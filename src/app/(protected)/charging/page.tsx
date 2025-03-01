'use client'

import { useEffect, useState } from 'react';
import { getVehicles } from '@/data/vehicles';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Map from '@/components/Map'; 
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { updateSessionState } from '@/data/charging-session';
import { startNewChargingSession, stopCurrentChargingSession } from '@/actions/charging-actions';
import { toast } from "sonner";
import { updatePortStatus } from '@/data/ports';
import { useRouter } from "next/navigation";
import { getActiveChargingSession } from '@/data/charging-session';

// Interfaces
interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  battery_capacity_kwh: number;  // Changed from battery_capacity_kWh
  battery_condition: number;
  max_charging_powerkwh: number; // Changed from max_charging_powerkWh
  created_at: string;
  user_id: number;
  current_battery_capacity_kw: number;
}

interface ChargingSessionData {
  vehicle_id: number;
  port_id: number;
  start_time: string;
  duration_minutes: number;
  energy_used_kwh: number;
  total_cost: number;  // Ensure this exists
  status: 'IN_PROGRESS' | 'COMPLETED';
  user_id?: number; // Add this optional field
}

interface ChargingSession {
  id: number;
  vehicle_id: number;
  port_id: number;
  user_id: number;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  energy_used_kwh: number;
  total_cost: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

// Constants
const COST_PER_KWH = 10; // 10 PLN per kWh

// Helper functions (keep these outside the component)
const calculateEnergyUsed = (batteryCapacity: number, currentCapacity: number, previousCapacity: number): number => {
  const energyUsed = Math.abs(currentCapacity - previousCapacity);
  return Math.min(energyUsed, batteryCapacity);
};

const calculateTimeFromPercentage = (selectedVehicle: Vehicle | null, selectedPort: any, targetPercentage: number): number => {
  if (!selectedVehicle || !selectedPort) return 0;

  const currentPercent = (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100;
  const percentageToCharge = targetPercentage - currentPercent;
  const energyNeeded = (percentageToCharge / 100) * selectedVehicle.battery_capacity_kwh;
  const chargingPowerKW = Math.min(selectedPort.power_kw!, selectedVehicle.max_charging_powerkwh);
  
  return Math.ceil((energyNeeded / chargingPowerKW) * 60);
};

// Add this constant at the top of the file
const calculateEnergy = (power: number, timeMinutes: number): number => {
  const timeHours = timeMinutes / 60;
  const energyKWh = power * timeHours;
  return Number(energyKWh.toFixed(2));
};

const calculateTimeFromEnergy = (energy: number, power: number): number => {
  const timeHours = energy / power;
  return Math.ceil(timeHours * 60); // Convert to minutes
};

// First, add a consistent energy calculation helper at the top
const calculateChargingEnergy = (
  powerKW: number,
  timeMinutes: number,
  maxBatteryCapacity: number,
  currentCapacity: number
): number => {
  const timeHours = timeMinutes / 60;
  const theoreticalEnergy = powerKW * timeHours;
  const maxPossibleEnergy = maxBatteryCapacity - currentCapacity;
  return Math.min(theoreticalEnergy, maxPossibleEnergy);
};

// Helper functions
const calculateCost = (energyKWh: number): number => {
  return Number((energyKWh * COST_PER_KWH).toFixed(2));
};

const calculateEnergyFromCost = (cost: number): number => {
  return Number((cost / COST_PER_KWH).toFixed(2));
};

export default function ChargingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Move all state declarations here
  const [duration, setDuration] = useState(0);
  const [targetPercentage, setTargetPercentage] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string>('');
  const [isCharging, setIsCharging] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentBatteryLevel, setCurrentBatteryLevel] = useState<number>(0);
  const [currentCapacityKWh, setCurrentCapacityKWh] = useState<number>(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [cost, setCost] = useState(0);
  const [chargeMode, setChargeMode] = useState<'time' | 'cost' | 'percentage'>('time');
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionResult, setSessionResult] = useState<ChargingSession | null>(null);

  // URL params handling
  const stationId = searchParams.get('station');
  const portId = searchParams.get('port');
  const powerKw = searchParams.get('power');
  const portNumber = searchParams.get('portNumber');

  const [selectedPort, setSelectedPort] = useState({
    id: portId ? parseInt(portId) : null,
    power_kw: powerKw ? parseInt(powerKw) : null,
    number: portNumber ? parseInt(portNumber) : null
  });

  const stationInfo = {
    id: stationId,
    city: searchParams.get('city') || "Not specified",
    name: searchParams.get('name') || "Not specified"
  };

  // Calculate estimated time
  const estimatedTime = chargeMode === 'time' 
    ? duration 
    : chargeMode === 'cost'
    ? Math.ceil(cost / (COST_PER_KWH * Math.min(selectedPort?.power_kw || 0, selectedVehicle?.max_charging_powerkwh || 0)) * 60) 
    : calculateTimeFromPercentage(selectedVehicle, selectedPort, targetPercentage);

  // Event handlers
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (newValue >= 0) {
      setCost(newValue);
    }
  };

  const handleCostIncrement = () => {
    setCost(prev => prev + 10);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Math.max(0, Number(e.target.value));
    setDuration(newDuration);
  };

  const handleDurationIncrement = () => {
    setDuration(prev => prev + 30);
  };

  // Move all your existing useEffect hooks here
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicles();
        if (data && data.length) {
          setVehicles(data);
          setSelectedVehicle(data[0]); // Optionally set first vehicle as default
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load vehicles');
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (isCharging && remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // Auto stop the charging when time runs out
            handleStopCharging();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setIntervalId(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isCharging, remainingTime]);

  // Add new effect to handle auto-stop conditions
  useEffect(() => {
    if (isCharging && remainingTime > 0) {
      const shouldStopCharging = () => {
        if (!selectedVehicle) return false;
        
        const batteryPercentage = (currentCapacityKWh / selectedVehicle.battery_capacity_kwh) * 100;
        
        // Check stop conditions
        if (chargeMode === 'percentage' && batteryPercentage >= targetPercentage) {
          return true;
        }
        if (batteryPercentage >= 100) {
          return true;
        }
        return false;
      };

      if (shouldStopCharging()) {
        // Use setTimeout to avoid state updates during render
        setTimeout(() => {
          handleStopCharging();
          toast.success("Charging Complete", {
            description: "Target battery level reached",
            duration: 5000,
            action: {
              label: "View Details",
              onClick: () => router.push('/charging')
            }
          });
        }, 0);
      }
    }
  }, [
    isCharging, 
    remainingTime,
    currentCapacityKWh,
    selectedVehicle?.battery_capacity_kwh,
    chargeMode,
    targetPercentage
  ]);

  // Remove auto-stop from battery update effect
  useEffect(() => {
    if (isCharging && remainingTime > 0) {
      const maxPowerKW = Math.min(
        selectedPort.power_kw || 0, 
        selectedVehicle?.max_charging_powerkwh || 0
      );
      const increasePerSecondKWh = maxPowerKW / 3600;
      
      const batteryInterval = setInterval(() => {
        setCurrentCapacityKWh((prev) => {
          const newCapacity = Math.min(
            selectedVehicle.battery_capacity_kwh,
            prev + increasePerSecondKWh
          );
          
          const energyUsed = newCapacity - selectedVehicle.current_battery_capacity_kw;
          const newCost = calculateCost(energyUsed);
          setCurrentCost(newCost);

          return Number(newCapacity.toFixed(4));
        });
      }, 1000);

      return () => clearInterval(batteryInterval);
    }
  }, [isCharging, remainingTime, selectedPort.power_kw, selectedVehicle]);

  // Add this useEffect to update port when URL parameters change
  useEffect(() => {
    const portId = searchParams.get('port');
    const powerKw = searchParams.get('power');
    const portNumber = searchParams.get('portNumber');

    if (portId && powerKw && portNumber) {
        setSelectedPort({
            id: parseInt(portId),
            power_kw: parseInt(powerKw),
            number: parseInt(portNumber)
        });
    }
}, [searchParams]); // Add searchParams as dependency

  useEffect(() => {
    if (selectedVehicle) {
      setCurrentCapacityKWh(selectedVehicle.current_battery_capacity_kw);
      setCurrentBatteryLevel((selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    // Move validation and state updates to an effect
    if (chargeMode === 'cost') {
      // Ensure cost is always positive
      if (cost < 0) {
        setCost(0);
      }
    }
  }, [chargeMode, cost]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = Number(e.target.value);
    const vehicle = vehicles.find((v) => v.id === vehicleId) || null;
    setSelectedVehicle(vehicle);
    setShowVehicleSelect(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Check for existing active session first
      const activeSession = await getActiveChargingSession();
      if (activeSession) {
        toast.error("Active Session Exists", {
          description: "You have an ongoing charging session. Please complete or stop it first."
        });
        router.push('/charging');
        return;
      }

      if (!stationId || !selectedPort.id) {
        setError('Please select a charging station and port');
        return;
      }
  
      if (!selectedVehicle?.id) {
        setError('Please select a vehicle');
        return;
      }
  
      // Add battery and percentage validation
      const currentBatteryPercentage = (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100;
      if (currentBatteryPercentage >= 100) {
        setError('Vehicle battery is already fully charged');
        return;
      }
  
      if (chargeMode === 'percentage' && targetPercentage <= currentBatteryPercentage) {
        setError('Target percentage must be higher than current battery level');
        return;
      }
  
      setIsSubmitting(true);
      try {
        const calculatedTime = chargeMode === 'percentage' ? calculateTimeFromPercentage(selectedVehicle, selectedPort, targetPercentage) : estimatedTime;
        
        const chargingSessionData: ChargingSessionData = {
          vehicle_id: selectedVehicle.id,
          port_id: selectedPort.id,
          start_time: new Date().toISOString(),
          duration_minutes: calculatedTime,
          energy_used_kwh: 0,
          total_cost: 0,
          status: 'IN_PROGRESS'
        };
  
        const response = await startNewChargingSession(chargingSessionData);
  
        if (!response?.id || isNaN(response.id)) {
          throw new Error('Invalid session ID received from server');
        }
  
        setSessionResult(response);
        setIsCharging(true);
        setRemainingTime(chargeMode === 'time' ? duration * 60 : estimatedTime * 60);
        
      } catch (err) {
        console.error('Error starting session:', err);
        setError(err instanceof Error ? err.message : 'Failed to start charging session');
        setIsCharging(false);
        setSessionResult(null);
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Add this helper function to validate session response
  function isValidChargingSession(session: any): session is ChargingSession {
    return (
      session &&
      typeof session === 'object' &&
      typeof session.id === 'number' &&
      typeof session.vehicle_id === 'number' &&
      typeof session.port_id === 'number' &&
      typeof session.start_time === 'string' &&
      (session.end_time === null || typeof session.end_time === 'string') &&
      typeof session.energy_used_kwh === 'number' &&
      typeof session.total_cost === 'number' &&
      (session.status === 'IN_PROGRESS' || session.status === 'COMPLETED')
    );
  }

  const handleStopCharging = async () => {
    if (!sessionResult?.id || !selectedVehicle?.id) {
        setError('No active session or vehicle to stop.');
        return;
    }

    setIsSubmitting(true);

    try {
        const energyUsed = Math.max(0, currentCapacityKWh - selectedVehicle.current_battery_capacity_kw);
        const finalCost = Math.max(0, currentCost);

        // Call the server action to stop charging and update port status
        const result = await stopCurrentChargingSession(
            sessionResult.id,
            selectedVehicle.id,
            currentCapacityKWh,
            energyUsed,
            finalCost
        );

        if (result) {
            // Show success toast
            toast.success("Charging Complete", {
                description: `Final cost: ${finalCost.toFixed(2)} PLN | Energy used: ${energyUsed.toFixed(2)} kWh`,
                duration: 5000,
                action: {
                    label: "View Details",
                    onClick: () => router.push('/charging')
                }
            });

            // Reset states
            setSessionResult(null);
            setIsCharging(false);
            setRemainingTime(0);
            
            // Clear intervals
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }

            // Update port status to 'wolny' - Add retry logic
            if (selectedPort.id) {
                let retryCount = 0;
                const maxRetries = 3;
                
                while (retryCount < maxRetries) {
                    try {
                        await updatePortStatus(selectedPort.id, 'wolny');
                        break;
                    } catch (error) {
                        console.error(`Failed to update port status (attempt ${retryCount + 1}):`, error);
                        retryCount++;
                        if (retryCount === maxRetries) {
                            toast.error("Failed to update port status", {
                                description: "The session was stopped but the port status couldn't be updated"
                            });
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                    }
                }
            }
        }
    } catch (error) {
        console.error('Failed to stop charging:', error);
        setError(error instanceof Error ? err.message : 'Failed to stop charging');
        
        toast.error("Failed to stop charging", {
            description: error instanceof Error ? error.message : 'Please try again',
        });
    } finally {
        setIsSubmitting(false);
    }
};

// Add this new effect to update cost when percentage changes
useEffect(() => {
  if (chargeMode === 'percentage' && selectedVehicle && selectedPort) {
    const currentPercent = (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100;
    const percentageToCharge = targetPercentage - currentPercent;
    const energyNeeded = (percentageToCharge / 100) * selectedVehicle.battery_capacity_kwh;
    const estimatedCost = energyNeeded * COST_PER_KWH;
    setCost(Number(estimatedCost.toFixed(2)));
  }
}, [chargeMode, targetPercentage, selectedVehicle, selectedPort]);

// Add this effect to update cost when time changes
useEffect(() => {
  if (chargeMode === 'time' && selectedVehicle && selectedPort) {
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    const durationHours = duration / 60;
    const energyToBeUsed = chargingPowerKW * durationHours;
    const estimatedCost = energyToBeUsed * COST_PER_KWH;
    setCost(Number(estimatedCost.toFixed(2)));
  }
}, [duration, chargeMode, selectedPort, selectedVehicle]);

// Update the effect for cost mode calculations
useEffect(() => {
  if (chargeMode === 'cost' && selectedVehicle && selectedPort) {
    // Calculate charging power in kW
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    
    // Calculate energy possible with this cost
    const energyPossible = cost / COST_PER_KWH; // If cost is 1 PLN, energy will be 0.1 kWh
    
    // Calculate time needed in minutes
    const timeNeededMinutes = Math.ceil((energyPossible / chargingPowerKW) * 60);
    
    setDuration(timeNeededMinutes);
    
    // Verify the cost calculation
    const verificationEnergy = calculateEnergy(chargingPowerKW, timeNeededMinutes);
    const verificationCost = verificationEnergy * COST_PER_KWH;
    
    // Update cost if there's a mismatch
    if (Math.abs(verificationCost - cost) > 0.01) {
      setCost(Number(verificationCost.toFixed(2)));
    }
  }
}, [cost, chargeMode, selectedPort?.power_kw, selectedVehicle?.max_charging_powerkwh]);

useEffect(() => {
  if (chargeMode === 'cost' && selectedVehicle && selectedPort) {
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    const energyPossible = cost / COST_PER_KWH;
    const timeNeededMinutes = calculateTimeFromEnergy(energyPossible, chargingPowerKW);
    setDuration(timeNeededMinutes);
  }
}, [cost, chargeMode, selectedPort?.power_kw, selectedVehicle?.max_charging_powerkwh]);

useEffect(() => {
  if (chargeMode === 'percentage' && selectedVehicle && selectedPort) {
    const currentPercent = (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100;
    const percentageToCharge = targetPercentage - currentPercent;
    const energyNeeded = (percentageToCharge / 100) * selectedVehicle.battery_capacity_kwh;
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    const timeNeededMinutes = calculateTimeFromEnergy(energyNeeded, chargingPowerKW);
    setDuration(timeNeededMinutes);
    const estimatedCost = energyNeeded * COST_PER_KWH;
    setCost(Number(estimatedCost.toFixed(2)));
  }
}, [chargeMode, targetPercentage, selectedVehicle, selectedPort]);

// Then modify the charging mode effects
useEffect(() => {
  if (chargeMode === 'time' && selectedVehicle && selectedPort) {
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    const energyToBeUsed = calculateChargingEnergy(
      chargingPowerKW,
      duration,
      selectedVehicle.battery_capacity_kwh,
      selectedVehicle.current_battery_capacity_kw
    );
    const estimatedCost = energyToBeUsed * COST_PER_KWH;
    setCost(Number(estimatedCost.toFixed(2)));
  }
}, [duration, chargeMode, selectedPort, selectedVehicle]);

useEffect(() => {
  if (chargeMode === 'cost' && selectedVehicle && selectedPort) {
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    const energyPossible = cost / COST_PER_KWH;
    const maxPossibleEnergy = selectedVehicle.battery_capacity_kwh - selectedVehicle.current_battery_capacity_kw;
    const actualEnergy = Math.min(energyPossible, maxPossibleEnergy);
    const timeNeededMinutes = Math.ceil((actualEnergy / chargingPowerKW) * 60);
    setDuration(timeNeededMinutes);
  }
}, [cost, chargeMode, selectedPort?.power_kw, selectedVehicle]);

useEffect(() => {
  if (chargeMode === 'percentage' && selectedVehicle && selectedPort) {
    const currentPercent = (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100;
    const percentageToCharge = targetPercentage - currentPercent;
    const energyNeeded = (percentageToCharge / 100) * selectedVehicle.battery_capacity_kwh;
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    const timeNeededMinutes = Math.ceil((energyNeeded / chargingPowerKW) * 60);
    setDuration(timeNeededMinutes);
    const estimatedCost = energyNeeded * COST_PER_KWH;
    setCost(Number(estimatedCost.toFixed(2)));
  }
}, [chargeMode, targetPercentage, selectedVehicle, selectedPort]);

  useEffect(() => {
    if (isCharging && sessionResult?.id) {
      const syncInterval = setInterval(() => {
        // Calculate energy used
        const energyUsed = calculateEnergyUsed(
          selectedVehicle.battery_capacity_kwh,
          selectedVehicle.battery_condition * 100,
          currentBatteryLevel
        );

        // Use server action to update state
        updateSessionState(sessionResult.id, {
          energy_used_kwh: energyUsed,
          current_battery_level: currentBatteryLevel,
          total_cost: currentCost  // Add this line
        }).catch(error => {
          console.error('Failed to sync battery state:', error);
        });
      }, 30000);
  
      return () => clearInterval(syncInterval);
    }
  }, [isCharging, sessionResult?.id, currentBatteryLevel, currentCost]); // Add currentCost to dependencies

  useEffect(() => {
    if (isCharging && sessionResult?.id) {
        const syncInterval = setInterval(() => {
            // Calculate energy used
            const energyUsed = calculateEnergyUsed(selectedVehicle.battery_capacity_kwh, selectedVehicle.battery_condition * 100, currentBatteryLevel);
            
            // Calculate current cost
            const currentCost = updateCurrentCost(energyUsed);
            
            // Update session state with cost
            updateSessionState(sessionResult.id, {
                energy_used_kwh: energyUsed,
                current_battery_level: currentBatteryLevel,
                total_cost: currentCost // Add this
            });
        }, 30000);

        return () => clearInterval(syncInterval);
    }
}, [isCharging, sessionResult?.id, currentBatteryLevel]);

useEffect(() => {
    if (isCharging && sessionResult?.id) {
        const syncInterval = setInterval(() => {
            const energyUsed = currentCapacityKWh - selectedVehicle.current_battery_capacity_kw;
            
            updateSessionState(sessionResult.id, {
                energy_used_kwh: energyUsed,
                current_battery_level: currentBatteryLevel,
                total_cost: currentCost
            }).catch(error => {
                console.error('Failed to sync session state:', error);
            });
        }, 30000);

        return () => clearInterval(syncInterval);
    }
}, [isCharging, sessionResult?.id, currentBatteryLevel, currentCapacityKWh, currentCost, selectedVehicle]);

// Add a shorter interval for UI updates
useEffect(() => {
  if (isCharging && sessionResult?.id) {
    const uiUpdateInterval = setInterval(async () => {
      try {
        const sessionUpdateData = {
          energy_used_kwh: Math.max(0, Number((currentCapacityKWh - selectedVehicle?.current_battery_capacity_kw) || 0)),
          current_battery_level: Math.max(0, Number(currentBatteryLevel || 0)),
          total_cost: Math.max(0, Number(currentCost || 0))
        };

        await updateSessionState(sessionResult.id, sessionUpdateData);
      } catch (error) {
        console.error('Failed to sync UI state:', error);
      }
    }, 1000);

    return () => clearInterval(uiUpdateInterval);
  }
}, [isCharging, sessionResult?.id, selectedVehicle, currentCapacityKWh, currentBatteryLevel, currentCost]);

// Keep the server sync interval at a longer duration
useEffect(() => {
  if (isCharging && sessionResult?.id) {
    const serverSyncInterval = setInterval(() => {
      const sessionUpdateData = {
        energy_used_kwh: Math.max(0, Number((currentCapacityKWh - selectedVehicle?.current_battery_capacity_kw) || 0)),
        current_battery_level: Math.max(0, Number(currentBatteryLevel || 0)),
        total_cost: Math.max(0, Number(currentCost || 0))
      };

      updateSessionState(sessionResult.id, sessionUpdateData)
        .catch(error => {
          console.error('Failed to sync session state:', error);
        });
    }, 30000);

    return () => clearInterval(serverSyncInterval);
  }
}, [isCharging, sessionResult?.id, currentBatteryLevel, currentCapacityKWh, currentCost, selectedVehicle]);

// Replace the existing effect with this corrected version
useEffect(() => {
  if (isCharging && sessionResult?.id) {
    const syncInterval = setInterval(() => {
      try {
        // Calculate energy used correctly
        const energyUsed = Math.max(0, currentCapacityKWh - selectedVehicle.current_battery_capacity_kw);
        
        // Format the update data
        const sessionUpdateData = {
          energy_used_kwh: Number(energyUsed.toFixed(2)),
          current_battery_level: Math.min(100, Number((currentCapacityKWh / selectedVehicle.battery_capacity_kwh * 100).toFixed(2))),
          total_cost: Number(currentCost.toFixed(2))
        };

        updateSessionState(sessionResult.id, sessionUpdateData)
          .catch(error => {
            console.error('Failed to sync session state:', error);
          });
      } catch (error) {
        console.error('Error in sync interval:', error);
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }
}, [isCharging, sessionResult?.id, currentCapacityKWh, selectedVehicle, currentCost]);

  useEffect(() => {
  const checkActiveSession = async () => {
    try {
      const activeSession = await getActiveChargingSession();
      
      if (activeSession) {
        // Get associated vehicle and port details
        const vehicle = vehicles.find(v => v.id === activeSession.vehicle_id);
        if (!vehicle) {
          throw new Error('Vehicle not found for active session');
        }

        // Set all necessary states to resume session
        setSessionResult(activeSession);
        setSelectedVehicle(vehicle);
        setIsCharging(true);
        setCurrentCapacityKWh(vehicle.current_battery_capacity_kw);
        setCurrentBatteryLevel((vehicle.current_battery_capacity_kw / vehicle.battery_capacity_kwh) * 100);

        // Show notification about resumed session
        toast.info("Active Session Found", {
          description: "Resuming your previous charging session",
          duration: 5000,
          action: {
            label: "View Details",
            onClick: () => router.push('/charging')
          }
        });
      }
    } catch (error) {
      console.error('Error checking for active session:', error);
      toast.error("Error checking active session", {
        description: "Failed to check for active charging sessions"
      });
    }
  };

  if (vehicles.length > 0) {
    checkActiveSession();
  }
}, [vehicles, router]); // Add router to dependencies

// Add this effect after other useEffects
useEffect(() => {
  if (chargeMode === 'time' && duration > 0) {
    // Calculate power that will be used (in kW)
    const chargingPowerKW = Math.min(selectedPort?.power_kw || 0, selectedVehicle?.max_charging_powerkwh || 0);
    
    // Convert duration from minutes to hours
    const durationHours = duration / 60;
    
    // Calculate energy that will be used in kWh
    const energyToBeUsed = chargingPowerKW * durationHours;
    
    // Calculate estimated cost (COST_PER_KWH is 1 PLN)
    const estimatedCost = energyToBeUsed * COST_PER_KWH;
    
    // Update cost state with 2 decimal places
    setCost(Number(estimatedCost.toFixed(2)));
  }
}, [duration, chargeMode, selectedPort?.power_kw, selectedVehicle?.max_charging_powerkwh]);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Start Charging Session</h1>
      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
        </div>
      )}

      {/* Vehicle Select Container (shown initially when there is no selected vehicle) */}
      {!selectedVehicle && (
        <div className="mb-6 p-4 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-white border-[var(--yellow)]">
          <label htmlFor="vehicle" className="block text-sm font-medium text-gray-300">
            Select Vehicle
          </label>
          <select
            id="vehicle"
            value=""
            onChange={handleVehicleChange}
            className="mt-1 block w-full rounded-lg bg-[var(--cardblack)] text-white border border-[var(--yellow)] shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-300"
          >
            <option value="" disabled>
              -- Select a vehicle --
            </option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id} className="bg-[var(--cardblack)] text-white">
                {vehicle.brand} {vehicle.license_plate}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Toggle display of vehicles list when container is clicked */}
      {showVehicleSelect && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm mt-">
          <div className="relative p-8 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-white border-[var(--yellow)] max-w-lg w-full max-h-[90vh] mt-20 "> {/* Increased from 80vh to 90vh */}
            {/* X button to close the modal */}
            <button
              onClick={() => setShowVehicleSelect(false)}
              className="absolute top-2 right-2 text-white text-xl"
            >
              &times;
            </button>
            <p className="block text-xl font-medium text-[gray-300] mb-6">Select Vehicle</p>
            {/* Increased max height of scrollable area */}
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]"> {/* Increased from 80vh to 90vh */}
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-4 border-b last:border-b-0 border-[var(--yellow)] cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setShowVehicleSelect(false);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <Image src={'car.svg'} alt="Car" width={48} height={48} />
                    <div>
                      <p className="text-lg font-semibold">{vehicle.brand}</p>
                      <p className="text-sm text-gray-300">{vehicle.license_plate}</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom: Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Station, Vehicle, Charging Options */}
        <div className="space-y-6">
          {/* Station Info Container - Simplified */}
          {selectedVehicle && (
            <div 
              onClick={() => setShowMap(true)}
              className="flex items-center justify-between p-4 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-white border-[var(--yellow)] cursor-pointer hover:bg-[var(--background)] transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Image src={"/basic-marker.png"} alt="marker" width={48} height={48} />
                <div>
                  <p className="text-xl font-bold">{stationInfo.name}</p>
                  {selectedPort.id && (
                    <p className="text-sm text-[var(--yellow)]">
                      Port {selectedPort.number} - {selectedPort.power_kw}kW
                    </p>
                  )}
                </div>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-gray-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </div>
          )}
          {/* Display Map Component when showMap is true */}
          {showMap && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="relative p-8 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-white border-[var(--yellow)]  w-[95%] h-[85%] z-[1000000000]">
                {/* X button to close the modal */}
                <button
                  onClick={() => setShowMap(false)}
                  className="absolute top-2 right-2 text-white text-xl"
                >
                  &times;
                </button>
                {/* Map Component */}
                <div className="h-full w-full">
                  <Map height='700px' selectedStationId={stationInfo.id}></Map>
                </div>
              </div>
            </div>
          )}
          {/* Vehicle Info Container */}
          {selectedVehicle && (
            <div
              onClick={() => setShowVehicleSelect(!showVehicleSelect)}
              className="w-full p-4 cursor-pointer border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-white border-[var(--yellow)] flex items-center justify-between hover:bg-[var(--background)] transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Image src={'car.svg'} alt="Car" width={48} height={48} className="text-yellow-500" />
                <div>
                  <p className="text-xl font-bold">{selectedVehicle.brand}</p>
                  <p className="text-sm text-gray-300">{selectedVehicle.license_plate}</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
          {/* Charging Options Form Container */}
          {selectedVehicle && (
            <div className="p-4 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-white border-[var(--yellow)] ">
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="space-x-4">
                  <legend className="m-2 text-md font-medium text-gray-300">Charging Options</legend>
                  <label className="text-gray-300">
                    <input
                      type="radio"
                      name="chargeMode"
                      value="time"
                      checked={chargeMode === 'time'}
                      onChange={(e) => setChargeMode(e.target.value as 'time' | 'cost' | 'percentage')}
                      className="mr-1"
                    />
                    By Time
                  </label>
                  <label className="text-gray-300">
                    <input
                      type="radio"
                      name="chargeMode"
                      value="cost"
                      checked={chargeMode === 'cost'}
                      onChange={(e) => setChargeMode(e.target.value as 'time' | 'cost' | 'percentage')}
                      className="mr-1"
                    />
                    By Cost
                  </label>
                  <label className="text-gray-300">
                    <input
                      type="radio"
                      name="chargeMode"
                      value="percentage"
                      checked={chargeMode === 'percentage'}
                      onChange={(e) => setChargeMode(e.target.value as 'time' | 'cost' | 'percentage')}
                      className="mr-1"
                    />
                    By Percentage
                  </label>
                </fieldset>

                {/* Add this new section for percentage input */}
                {chargeMode === 'percentage' && (
                  <div>
                    <label htmlFor="targetPercentage" className="block text-sm font-medium text-gray-300">
                      Target Battery Percentage
                    </label>
                    <div className="flex items-center space-x-4 mt-1">
                      <input
                        type="number"
                        id="targetPercentage"
                        value={targetPercentage}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, Number(e.target.value)));
                          setTargetPercentage(value);
                        }}
                        className="w-full rounded-lg bg-[var(--cardblack)] text-white border border-[var(--yellow)] shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-300"
                        min={Math.ceil(currentBatteryLevel)}
                        max="100"
                        required
                      />
                      <Button
                        type="button"
                        onClick={() => setTargetPercentage(prev => Math.min(100, prev + 10))}
                      >
                        + 10%
                      </Button>
                    </div>
                  </div>
                )}
                {chargeMode === 'time' ? (
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-300">
                      Charging Duration (minutes)
                    </label>
                    <div className="flex items-center space-x-4 mt-1">
                      <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={handleDurationChange}
                        className="w-full rounded-lg bg-[var(--cardblack)] text-white border border-[var(--yellow)] shadow-sm"
                        min="1"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleDurationIncrement}
                      >
                        + 30 Minutes
                      </Button>
                    </div>
                  </div>
                ) : chargeMode === 'cost' ? (
                  <div>
                    <label htmlFor="cost" className="block text-sm font-medium text-gray-300">
                      Charging Cost (PLN)
                    </label>
                    <div className="flex items-center space-x-4 mt-1">
                      <input
                        type="number"
                        id="cost"
                        value={cost}
                        onChange={handleCostChange}
                        className="w-full rounded-lg bg-[var(--cardblack)] text-white border border-[var(--yellow)] shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-300"
                        min="1"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleCostIncrement} // Remove extra parenthesis
                      >
                        + 10 PLN
                      </Button>
                    </div>
                  </div>
                ) : null}  {/* Remove the else case since percentage is handled above */}
                <div className="space-y-4">
                  {!isCharging ? (
                    <Button 
                      type="submit" 
                      disabled={
                        isSubmitting || 
                        !selectedVehicle || 
                        !stationId || 
                        !selectedPort.id || 
                        (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100 >= 100
                      } 
                      className={`w-full ${
                        !selectedVehicle || 
                        !stationId || 
                        !selectedPort.id ||
                        (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100 >= 100
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]'
                      }`}
                    >
                      {!selectedVehicle 
                          ? 'Select a Vehicle' 
                          : !stationId 
                          ? 'Select a Station'
                          : !selectedPort.id
                          ? 'Select a Port'
                          : (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100 >= 100
                          ? 'Battery Full'
                          : isSubmitting 
                          ? 'Starting...' 
                          : 'Start Charging Session'
                      }
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={handleStopCharging} 
                      disabled={isSubmitting}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      {isSubmitting ? 'Stopping...' : 'Stop Charging'}
                    </Button>
                  )}

                  {sessionResult && (
                    <div className="p-4 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-green-300 border-[var(--yellow)]">
                      <p>Charging Session {isCharging ? 'In Progress' : 'Completed'}</p>
                      <p>Session ID: {sessionResult.id}</p>
                      {isCharging && (
                        <>
                          <p className="mt-2">
                            Time Remaining: {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
                          </p>
                          <p className="mt-2">
                            Energy Used: {((currentCapacityKWh - selectedVehicle?.current_battery_capacity_kw) || 0).toFixed(2)} kWh
                          </p>
                          <p className="mt-2 text-yellow-500">
                            Current Cost: {(currentCost || 0).toFixed(2)} PLN
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
        {/* Right Column: Battery Info */}
        {selectedVehicle && (
          <div className="flex flex-col items-center p-8 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-white border-[var(--yellow)]">
            <span className="text-xl mb-6">
              {(currentCapacityKWh || 0).toFixed(2)} / {selectedVehicle?.battery_capacity_kwh || 0} kWh
            </span>
            <div className="relative w-64 h-64 mb-6">
              <CircularProgressbar 
                value={(currentCapacityKWh / selectedVehicle.battery_capacity_kwh) * 100} 
                text={`${Math.round((currentCapacityKWh / selectedVehicle.battery_capacity_kwh) * 100)}%`} 
                styles={buildStyles({
                  textColor: "var(--yellow)",
                  pathColor: "var(--yellow)",
                  trailColor: "gray",
                  textSize: "1.5rem",
                  strokeLinecap: 'round',
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            <div className="mt-6 text-gray-300 text-center space-y-4">
              <p className="text-lg text-yellow-500">
                Charging Speed: {Math.min(selectedPort?.power_kw || 0, selectedVehicle?.max_charging_powerkwh || 0)} kW/h
              </p>
              <p className="mt-2 text-yellow-500">
                {isCharging ? 'Current' : 'Estimated'} Cost: {(isCharging ? currentCost : cost || 0).toFixed(2)} PLN
              </p>
              <p className="mt-2 text-yellow-500">
                {isCharging ? 'Remaining' : 'Estimated'} Time: {Math.floor((isCharging ? remainingTime : estimatedTime * 60) / 60)}:{String((isCharging ? remainingTime : estimatedTime * 60) % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
