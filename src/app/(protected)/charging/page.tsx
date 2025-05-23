'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { useRouter } from "next/navigation";
import { getActiveChargingSession } from '@/data/charging-session';

// Interfaces
interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  battery_capacity_kwh: number;
  battery_condition: number;
  max_charging_powerkwh: number;
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
  total_cost: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  user_id?: number;
}

interface ChargingSession {
  id: number;
  vehicle_id: number;
  port_id: number;
  user_id?: number;
  start_time: string;
  end_time?: string | null;
  duration_minutes?: number;
  energy_used_kwh: number;
  total_cost: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

interface Port {
  id: number | null,
  power_kw: number | null,
  number: number | null
}

// Constants
const COST_PER_KWH = 10; // Change from 1 PLN to 10 PLN per kWh

// Helper functions (keep these outside the component)
const calculateEnergyUsed = (batteryCapacity: number, currentCapacity: number, previousCapacity: number): number => {
  const energyUsed = Math.abs(currentCapacity - previousCapacity);
  return Math.min(energyUsed, batteryCapacity);
};

const calculateTimeFromPercentage = (selectedVehicle: Vehicle | null, selectedPort: Port, targetPercentage: number): number => {
  if (!selectedVehicle || !selectedPort) return 0;

  const currentPercent = (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100;
  const percentageToCharge = targetPercentage - currentPercent;
  const energyNeeded = (percentageToCharge / 100) * selectedVehicle.battery_capacity_kwh;
  const chargingPowerKW = Math.min(selectedPort.power_kw!, selectedVehicle.max_charging_powerkwh);
  
  return Math.ceil((energyNeeded / chargingPowerKW) * 60);
};

// Add this constant at the top of the file
// const calculateEnergy = (power: number, timeMinutes: number): number => {
//   const timeHours = timeMinutes / 60;
//   const energyKWh = power * timeHours;
//   return Number(energyKWh.toFixed(2));
// };

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

// const calculateEnergyFromCost = (cost: number): number => {
//   return Number((cost / COST_PER_KWH).toFixed(2));
// };

// Add with other helper functions
const updateCurrentCost = (energyUsed: number): number => {
  return Number((energyUsed * COST_PER_KWH).toFixed(2));
};

/**
 * Główny komponent strony ładowania
 * Zarządza procesem ładowania pojazdu, wyświetla stan baterii i pozwala na kontrolę sesji
 */
export default function ChargingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Move all state declarations here
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [targetPercentage, setTargetPercentage] = useState<number | undefined>(undefined);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string>('');
  const [isCharging, setIsCharging] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentBatteryLevel, setCurrentBatteryLevel] = useState<number>(0);
  const [currentCapacityKWh, setCurrentCapacityKWh] = useState<number>(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [cost, setCost] = useState<number | undefined>(undefined);
  const [chargeMode, setChargeMode] = useState<'time' | 'cost' | 'percentage'>('time');
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionResult, setSessionResult] = useState<ChargingSession | null>(null);

  // URL params handling
  const stationId = searchParams.get('station') ?? "";
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
      
      if (selectedVehicle && selectedPort) {
        const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
        const energyKWh = newValue / COST_PER_KWH; // Energy in kWh based on cost
        const timeHours = energyKWh / chargingPowerKW;
        const timeMinutes = Math.ceil(timeHours * 60);
        
        setDuration(timeMinutes);
      }
    }
  };

  const handleCostIncrement = () => {
    setCost(prev => prev + 10);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Math.max(0, Number(e.target.value));
    setDuration(newDuration);
  };


  // Add these handlers to your component
  const handleTimeIncrement = (minutes: number) => {
    setDuration(prev => (prev || 0) + minutes);
  };

  // Add this handler function with your other handlers
  const handlePercentageIncrement = (increment: number) => {
    setTargetPercentage(prev => {
      const newValue = (prev || currentBatteryLevel) + increment;
      return Math.min(100, Math.max(currentBatteryLevel, newValue));
    });
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

  const handleStopCharging = async () => {
    if (!sessionResult?.id || !selectedVehicle?.id) {
        setError('No active session or vehicle to stop.');
        return;
    }

    setIsSubmitting(true);

    try {
        // Clear all intervals first
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }

        const energyUsed = Math.max(0, currentCapacityKWh - selectedVehicle.current_battery_capacity_kw);
        const finalCost = Math.max(0, currentCost);

        // Do one final state update before stopping
        await updateSessionState(sessionResult.id, {
            energy_used_kwh: energyUsed,
            current_battery_level: currentBatteryLevel,
            total_cost: finalCost
        });

        const result = await stopCurrentChargingSession(
            sessionResult.id,
            selectedVehicle.id,
            currentCapacityKWh,
            energyUsed,
            finalCost
        );

        if (result) {
            // Clear session state immediately
            setIsCharging(false);
            setRemainingTime(0);
            
            // Show success toast with payment option
            toast.success("Charging Complete", {
                description: `Final cost: ${finalCost.toFixed(2)} PLN | Energy used: ${energyUsed.toFixed(2)} kWh`,
                duration: 50000,
                action: {
                    label: "Go to Payment",
                    onClick: () => router.push(`/payment?sessionId=${sessionResult.id}&amount=${finalCost}`)
                }
            });
        }
    } catch (error) {
        console.error('Failed to stop charging:', error);
        toast.error("Failed to stop charging", {
            description: error instanceof Error ? error.message : 'Please try again'
        });
    } finally {
        setIsSubmitting(false);
    }
};

const cachedHandleStopCharging = useCallback(handleStopCharging, [currentBatteryLevel, currentCapacityKWh, currentCost, intervalId, router, selectedVehicle, sessionResult]);

useEffect(() => {
  if (isCharging && remainingTime > 0) {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          cachedHandleStopCharging();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (timer) clearInterval(timer);
    };
  }
}, [isCharging, cachedHandleStopCharging, remainingTime]);

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
          cachedHandleStopCharging();
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
    targetPercentage,
    cachedHandleStopCharging,
    router,
    selectedVehicle
  ]);

  // Remove auto-stop from battery update effect
  useEffect(() => {
    if (isCharging && remainingTime > 0) {
      const maxPowerKW = Math.min(
        selectedPort.power_kw || 0, 
        selectedVehicle?.max_charging_powerkwh || 0
      );
      const increasePerSecondKWh = maxPowerKW / 3600;
      if (selectedVehicle !== null) {
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
        const calculatedTime = chargeMode === 'percentage' 
          ? calculateTimeFromPercentage(selectedVehicle, selectedPort, targetPercentage) 
          : estimatedTime;
        
        const chargingSessionData: ChargingSessionData = {
          vehicle_id: selectedVehicle.id,
          port_id: selectedPort.id,
          start_time: new Date().toISOString(),
          duration_minutes: calculatedTime,
          energy_used_kwh: 0,
          total_cost: cost,
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
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    
    // Calculate energy and time based on cost
    const energyKWh = cost / COST_PER_KWH;
    const timeHours = energyKWh / chargingPowerKW;
    const timeMinutes = Math.ceil(timeHours * 60);
    
    setDuration(timeMinutes);
  }
}, [cost, chargeMode, selectedPort?.power_kw, selectedVehicle?.max_charging_powerkwh, selectedPort, selectedVehicle]);

useEffect(() => {
  if (chargeMode === 'cost' && selectedVehicle && selectedPort) {
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    const energyPossible = cost / COST_PER_KWH;
    const timeNeededMinutes = calculateTimeFromEnergy(energyPossible, chargingPowerKW);
    setDuration(timeNeededMinutes);
    // Remove the cost verification and update
  }
}, [cost, chargeMode, selectedPort?.power_kw, selectedVehicle?.max_charging_powerkwh, selectedPort, selectedVehicle]);

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
}, [cost, chargeMode, selectedPort?.power_kw, selectedVehicle, selectedPort]);

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
  if (isCharging && sessionResult?.id && selectedVehicle) {
    const syncInterval = setInterval(() => {
      // Calculate energy used
      const energyUsed = calculateEnergyUsed(
        selectedVehicle.battery_capacity_kwh,
        selectedVehicle.battery_condition * 100,
        currentBatteryLevel
      );
      
      // Calculate current cost using the new helper function
      const newCost = updateCurrentCost(energyUsed);
      setCurrentCost(newCost);
      
      // Update session state with cost
      updateSessionState(sessionResult.id, {
        energy_used_kwh: energyUsed,
        current_battery_level: currentBatteryLevel,
        total_cost: newCost
      }).catch(error => {
        console.error('Failed to sync session state:', error);
      });
    }, 30000);

    return () => clearInterval(syncInterval);
  }
}, [isCharging, sessionResult?.id, currentBatteryLevel, selectedVehicle]);

  useEffect(() => {
  if (isCharging && sessionResult?.id && selectedVehicle) {
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
}, [isCharging, sessionResult?.id, currentBatteryLevel, selectedVehicle]);

useEffect(() => {
    if (isCharging && sessionResult?.id && selectedVehicle) {
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
  if (isCharging && sessionResult?.id && selectedVehicle) {
    const uiUpdateInterval = setInterval(async () => {
      try {
        const sessionUpdateData = {
          energy_used_kwh: Math.max(0, Number((currentCapacityKWh - selectedVehicle.current_battery_capacity_kw) || 0)),
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
  if (isCharging && sessionResult?.id && selectedVehicle) {
    const serverSyncInterval = setInterval(() => {
      const sessionUpdateData = {
        energy_used_kwh: Math.max(0, Number((currentCapacityKWh - selectedVehicle.current_battery_capacity_kw) || 0)),
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
  if (isCharging && sessionResult?.id && selectedVehicle) {
    const syncInterval = setInterval(() => {
      try {
        // Calculate energy used correctly
        const energyUsed = Math.max(0, currentCapacityKWh - selectedVehicle.current_battery_capacity_kw);
        
        // Calculate current cost
        const newCost = updateCurrentCost(energyUsed);
        setCurrentCost(newCost);

        // Format the update data
        const sessionUpdateData = {
          energy_used_kwh: Number(energyUsed.toFixed(2)),
          current_battery_level: currentBatteryLevel,
          total_cost: newCost // Use the calculated cost
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
}, [isCharging, sessionResult?.id, currentCapacityKWh, selectedVehicle, currentBatteryLevel]);

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

// Update the time-based cost calculation effect
useEffect(() => {
  if (chargeMode === 'time' && duration > 0 && selectedVehicle && selectedPort) {
    // Calculate charging power in kW (minimum of port power and vehicle max charging power)
    const chargingPowerKW = Math.min(selectedPort.power_kw || 0, selectedVehicle.max_charging_powerkwh || 0);
    
    // Convert duration from minutes to hours
    const durationHours = duration / 60;
    
    // Calculate energy that will be used in kWh
    const energyToBeUsed = chargingPowerKW * durationHours;
    
    // Calculate cost (10 PLN per kWh)
    const estimatedCost = energyToBeUsed * COST_PER_KWH;
    
    // Update cost state with 2 decimal places
    setCost(Number(estimatedCost.toFixed(2)));
  }
}, [duration, chargeMode, selectedPort?.power_kw, selectedVehicle?.max_charging_powerkwh, selectedPort, selectedVehicle]);

  return (
    <div className="container mx-auto py-6 px-4 max-lg:w-full max-lg:mt-20">
      <h1 className="text-3xl font-bold text-[--text-color] mb-6">Rozpocznij sesję ładowania</h1>
      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
        </div>
      )}

      {/* Vehicle Select Container (shown initially when there is no selected vehicle) */}
      {!selectedVehicle && (
        <div className="mb-6 p-4 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-[--text-color] border-[var(--yellow)]">
          <label htmlFor="vehicle" className="block text-sm font-medium text-[--text-color-lighter]" >
            Wybierz pojazd
          </label>
          <select
            id="vehicle"
            value=""
            onChange={handleVehicleChange}
            className="mt-1 block w-full rounded-lg bg-[var(--cardblack)] text-[--text-color] border border-[var(--yellow)] shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-300"
          >
            <option value="" disabled>
              -- Wybierz pojazd --
            </option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id} className="bg-[var(--cardblack)] text-[--text-color]">
                {vehicle.brand} {vehicle.license_plate}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Toggle display of vehicles list when container is clicked */}
      {showVehicleSelect && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm mt-">
          <div className="relative p-8 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-[--text-color] border-[var(--yellow)] max-w-lg w-full max-h-[90vh] mt-20 "> {/* Increased from 80vh to 90vh */}
            {/* X button to close the modal */}
            <button
              onClick={() => setShowVehicleSelect(false)}
              className="absolute top-2 right-2 text-[--text-color] text-xl"
            >
              &times;
            </button>
            <p className="block text-xl font-medium text-[--text-color] mb-6">Wybierz pojazd</p>
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
                      <p className="text-sm text-[--text-color-lighter]">{vehicle.license_plate}</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#be8c02">
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
              className="flex items-center justify-between p-4 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-[--text-color] border-[var(--yellow)] cursor-pointer hover:bg-[var(--background)] transition-colors"
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
                className="h-6 w-6 text-[--text-color-lighter]" 
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
              <div className="relative w-[95%] h-[85%] max-lg:w-full max-lg:h-full max-lg:rounded-none p-4 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-[--text-color] border-[var(--yellow)] z-[1000000000]">
                {/* X button to close the modal */}
                <div className='bg-(var(--yellow))'>
                  <button
                    onClick={() => setShowMap(false)}
                    className="absolute top-4 max-lg:top-10 max-lg:right-0 right-2 w-16  text-black text-4xl max-lg:text-3xl z-[10] "
                  >
                    &times;
                  </button>
                </div>
                {/* Map Component */}
                <div className="w-full h-full">
                  <Map 
                    containerHeight="100%" 
                    selectedStationId={stationInfo.id}
                    searchBoxStyles={{
                      className: "absolute z-[999] w-[90%] max-w-[315px] left-1/2 -translate-x-1/2 top-4 transition-all",
                      containerClassName: "w-full"
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {/* Vehicle Info Container */}
          {selectedVehicle && (
            <div
              onClick={() => setShowVehicleSelect(!showVehicleSelect)}
              className="w-full p-4 cursor-pointer border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-[--text-color] border-[var(--yellow)] flex items-center justify-between hover:bg-[var(--background)] transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Image src={'car.svg'} alt="Car" width={48} height={48} className="text-yellow-500" />
                <div>
                  <p className="text-xl font-bold">{selectedVehicle.brand}</p>
                  <p className="text-sm text-[--text-color-lighter]">{selectedVehicle.license_plate}</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[--text-color-lighter]" fill="none" viewBox="0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
          {/* Charging Options Form Container */}
          {selectedVehicle && (
            <div className="p-4 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-[--text-color] border-[var(--yellow)]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="space-x-4">
                  <legend className="m-2 text-md font-medium text-[--text-color]">Opcje ładowania</legend>
                  <label className="text-[--text-color]">
                    <input
                      type="radio"
                      name="chargeMode"
                      value="time"
                      checked={chargeMode === 'time'}
                      onChange={(e) => setChargeMode(e.target.value as 'time' | 'cost' | 'percentage')}
                      className="mr-1"
                    />
                    Według czasu
                  </label>
                  <label className="text-[--text-color]">
                    <input
                      type="radio"
                      name="chargeMode"
                      value="cost"
                      checked={chargeMode === 'cost'}
                      onChange={(e) => setChargeMode(e.target.value as 'time' | 'cost' | 'percentage')}
                      className="mr-1"
                    />
                    Według kosztu
                  </label>
                  <label className="text-[--text-color]">
                    <input
                      type="radio"
                      name="chargeMode"
                      value="percentage"
                      checked={chargeMode === 'percentage'}
                      onChange={(e) => setChargeMode(e.target.value as 'time' | 'cost' | 'percentage')}
                      className="mr-1"
                    />
                    Według procentu
                  </label>
                </fieldset>

                {/* Add this new section for percentage input */}
                {chargeMode === 'percentage' && (
                  <div>
                    <label htmlFor="targetPercentage" className="block text-sm font-medium text-[--text-color]">
                      Docelowy procent naładowania baterii
                    </label>
                    <div className="flex items-center space-x-4 mt-1">
                      <input
                        type="number"
                        id="targetPercentage"
                        value={targetPercentage || ''}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(currentBatteryLevel, Number(e.target.value)));
                          setTargetPercentage(value);
                        }}
                        className="w-full rounded-lg bg-[var(--cardblack)] text-[--text-color] border border-[var(--yellow)] shadow-sm"
                        min={Math.ceil(currentBatteryLevel)}
                        max="100"
                        required
                        placeholder={`${Math.ceil(currentBatteryLevel)}-100`}
                      />
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={() => handlePercentageIncrement(10)}
                          className="px-3 py-2 bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]"
                          disabled={targetPercentage >= 100}
                        >
                          +10%
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handlePercentageIncrement(25)}
                          className="px-3 py-2 bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]"
                          disabled={targetPercentage >= 100}
                        >
                          +25%
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {chargeMode === 'time' ? (
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-[--text-color]">
                      Czas ładowania (minuty)
                    </label>
                    <div className="flex items-center space-x-4 mt-1">
                      <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={handleDurationChange}
                        className="w-full rounded-lg bg-[var(--cardblack)] text-[--text-color] border border-[var(--yellow)] shadow-sm"
                        min="1"
                        required
                        placeholder='1'
                      />
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={() => handleTimeIncrement(15)}
                          className="px-3 py-2 bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]"
                        >
                          +15
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleTimeIncrement(30)}
                          className="px-3 py-2 bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]"
                        >
                          +30
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleTimeIncrement(60)}
                          className="px-3 py-2 bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]"
                        >
                          +60
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : chargeMode === 'cost' ? (
                  <div>
                    <label htmlFor="cost" className="block text-sm font-medium text-[--text-color]">
                      Koszt ładowania (PLN)
                    </label>
                    <div className="flex items-center space-x-4 mt-1">
                      <input
                        type="number"
                        id="cost"
                        value={cost}
                        onChange={handleCostChange}
                        className="w-full rounded-lg bg-[var(--cardblack)] text-[--text-color] border border-[var(--yellow)] shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-300"
                        min="1"
                        required
                        placeholder='1'
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
                          ? 'Wybierz pojazd' 
                          : !stationId 
                          ? 'Wybierz stację'
                          : !selectedPort.id
                          ? 'Wybierz port'
                          : (selectedVehicle.current_battery_capacity_kw / selectedVehicle.battery_capacity_kwh) * 100 >= 100
                          ? 'Bateria pełna'
                          : isSubmitting 
                          ? 'Rozpoczynanie...' 
                          : 'Rozpocznij sesję ładowania'
                      }
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={handleStopCharging} 
                      disabled={isSubmitting}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      {isSubmitting ? 'Zatrzymywanie...' : 'Zatrzymaj ładowanie'}
                    </Button>
                  )}

                  
                  
                </div>
              </form>
            </div>
          )}
        </div>
        {/* Right Column: Battery Info */}
        {selectedVehicle && (
          <div className="flex flex-col items-center p-8 border-2 rounded-lg shadow-lg bg-[var(--cardblack)] text-[--text-color] border-[var(--yellow)]">
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
            <div className="mt-6 text-[--text-color] text-center space-y-4">
              <p className="text-lg text-yellow-500">
                Prędkość ładowania: {Math.min(selectedPort?.power_kw || 0, selectedVehicle?.max_charging_powerkwh || 0)} kW/h
              </p>
              <p className="mt-2 text-yellow-500">
                {isCharging ? 'Aktualny' : 'Szacowany'} koszt: {(isCharging ? currentCost : cost || 0).toFixed(2)} PLN
              </p>
              <p className="mt-2 text-yellow-500">
                {isCharging ? 'Pozostały' : 'Szacowany'} czas: {
                  Math.floor(remainingTime / 60)
                }:
                {
                  String(remainingTime % 60).padStart(2, '0')
                }
              </p>
              
              {/* Add the payment button here */}
              {sessionResult && !isCharging && (
                <Button
                  onClick={() => router.push(`/payment?sessionId=${sessionResult.id}&amount=${currentCost}`)}
                  className="w-full mt-4 bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-[--text-color]"
                >
                  Przejdź do płatności
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}