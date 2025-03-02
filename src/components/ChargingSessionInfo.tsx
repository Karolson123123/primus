"use client"

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getChargingSessionsInfo } from "@/data/charging-session";
import { getVehicles } from "@/data/vehicles";
import { getPortsInfo } from "@/data/ports";
import { getStationsInfo } from "@/data/stations";
import { useRouter } from 'next/navigation';

interface ChargingSession {
  id: number;
  name: string;
  created_at: string;
  vehicle_id: number;
  start_time: string;
  end_time: string | null;
  energy_used_kwh: number;
  total_cost: number;
  status: string;
  port_id: string;
  payment_status?: 'PENDING' | 'COMPLETED' | 'FAILED';
}

interface ChargingSessionInfoProps {
  sessions?: ChargingSession[];
  label: string;
  isLoading?: boolean;
}

interface Vehicle {
  id: number;
  brand: string;
  license_plate: string;
}

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}


interface Port {
  id: number;
  status: string;
  created_at: string;
  power_kw: number;
  station_id: Station['id'];
}

const getPaymentStatusColor = (status?: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-600';
    case 'FAILED':
      return 'bg-red-600';
    case 'PENDING':
    default:
      return 'bg-yellow-600';
  }
};

const ChargingSessionCard = ({
  session,
  associatedVehicle,
  associatedStation,
}: {
  session: ChargingSession;
  associatedVehicle?: Vehicle;
  associatedStation?: Station;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const needsPayment = session.status === 'COMPLETED' && 
                      (!session.payment_status || session.payment_status === 'PENDING');

  const handlePayment = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from toggling when clicking payment button
    router.push(`/payment?sessionId=${session.id}&amount=${session.total_cost}`);
  };

  return (
    <Card
      onClick={() => setShowDetails((prev) => !prev)}
      className="bg-[var(--cardblack)] border border-[var(--yellow)] p-4 cursor-pointer"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Add payment status indicator here */}
            {needsPayment && (
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${getPaymentStatusColor(session.payment_status)} animate-pulse`} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
              </div>
            )}
            
            {/* Existing car image and vehicle info */}
            <Image
              src="/car.svg"
              alt="Car"
              width={48}
              height={48}
              className=""
            />
            <div>
              <p className="text-xl font-bold text-white">
                {associatedVehicle ? associatedVehicle.brand : "N/A"}
              </p>
              <p className="text-sm text-gray-300">
                {associatedVehicle ? associatedVehicle.license_plate : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
          <div className="bg-[var(--yellow)] rounded-lg mr-10">
                <Image
                  src="/charging.svg"
                  alt="Charging"
                  width={48}
                  height={48}
                  className=""
                />
              </div>
            <div className="flex flex-col items-center">
              
              <p className="text-xl font-bold text-white">
                {session.total_cost.toFixed(2)} zł
              </p>
              <p className="text-sm text-gray-300">
                {new Date(session.start_time).toLocaleDateString()}
              </p>
            </div>
            <div>
              {/* Toggle arrow with transition */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-6 h-6 transform transition-transform duration-150 ${
                  showDetails ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </CardHeader>
      {showDetails && (
        <CardContent className="space-y-2 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white">Energy Used</p>
            <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
              {session.energy_used_kwh} kWh
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white">Total Cost</p>
            <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
              {session.total_cost.toFixed(2)} zł
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white">Status</p>
            <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
              {session.status}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white">Payment Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getPaymentStatusColor(session.payment_status)}`} />
              <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
                {session.payment_status || 'PENDING'}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white">Location</p>
            <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
              {associatedStation ? associatedStation.name : "N/A"}
            </p>
          </div>
          {needsPayment && (
            <div className="pt-4 mt-2 border-t border-[var(--yellow)]">
              <button
                onClick={handlePayment}
                className="w-full py-2 bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black font-semibold rounded-md transition-colors"
              >
                Pay {session.total_cost.toFixed(2)} PLN
              </button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

// Add displayCount state and handleLoadMore function at the top of ChargingSessionInfo component
export const ChargingSessionInfo = ({
  label,
  isLoading = false,
}: ChargingSessionInfoProps) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [displayCount, setDisplayCount] = useState(4); // Start with 5 sessions

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prevCount => {
      const nextCount = prevCount + 4;
      return nextCount > sessions.length ? sessions.length : nextCount;
    });
  }, [sessions.length]);

  const sortSessions = useCallback((sessionsToSort: ChargingSession[]) => {
    return [...sessionsToSort].sort((a, b) => {
      // First priority: Sessions that need payment (COMPLETED status with pending payment)
      const aNeedsPayment = a.status === 'COMPLETED' && (!a.payment_status || a.payment_status === 'PENDING');
      const bNeedsPayment = b.status === 'COMPLETED' && (!b.payment_status || b.payment_status === 'PENDING');
      
      if (aNeedsPayment && !bNeedsPayment) return -1;
      if (!aNeedsPayment && bNeedsPayment) return 1;
      
      // Second priority: Sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsData = await getChargingSessionsInfo();
        console.log(sessionsData);
        if (sessionsData) {
          setSessions(sortSessions(sessionsData));
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    fetchSessions();
  }, [sortSessions]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehiclesData = await getVehicles();
        console.log(vehiclesData);
        if (vehiclesData) {
          setVehicles(vehiclesData);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
          const fetchPorts = async () => {
              try {
                  const portsData = await getPortsInfo();
                  console.log(portsData);
                  if (portsData) {
                      setPorts(portsData);
                  }
              } catch (error) {
                  console.error('Error fetching stations:', error);
              }
          };
          fetchPorts();
      }, []);
  
      useEffect(() => {
          const fetchStations = async () => {
              try {
                  const stationsData = await getStationsInfo();
                  console.log(stationsData);
                  if (stationsData) {
                      setStations(stationsData);
                  }
              } catch (error) {
                  console.error('Error fetching stations:', error);
              }
          };
          fetchStations();
      }, []);


  if (isLoading) {
    return (
      <div>
        <Card className="bg-[var(--cardblack)] w-[90%]">
          <CardHeader>
            <p className="text-2xl font-semibold text-center text-white">
              {label}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card className="bg-[var(--cardblack)] w-[90%] border border-[var(--yellow)]">
        <CardHeader>
          <p className="text-2xl font-semibold text-center text-white">
            {label}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.slice(0, displayCount).map((session) => {
            const associatedVehicle = vehicles.find(
              (vehicle) => vehicle.id === session.vehicle_id
            );
            const associatedPort = ports.find(
              (port) => port.id === Number(session.port_id)
            );
            const associatedStation = associatedPort
              ? stations.find((station) => station.id === associatedPort.station_id)
              : undefined;

            return (
              <ChargingSessionCard
                key={session.id}
                session={session}
                associatedVehicle={associatedVehicle}
                associatedStation={associatedStation}
              />
            );
          })}

          {/* Add Load More button */}
          {sessions.length > displayCount && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={handleLoadMore}
                className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              >
                Load More ({sessions.length - displayCount} remaining)
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};