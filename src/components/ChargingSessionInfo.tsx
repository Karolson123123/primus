"use client"

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getChargingSessionsInfo } from "@/data/charging-session";
import { getVehicles } from "@/data/vehicles";
import { getPortsInfo } from "@/data/ports";
import { getStationsInfo } from "@/data/stations";
import { useRouter } from 'next/navigation';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Interfejsy opisujące struktury danych
 */
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

type FilterOption = 'all' | 'completed' | 'in_progress' | 'pending_payment';
type SortOption = 'newest' | 'oldest' | 'highest_cost' | 'lowest_cost';

/**
 * Funkcja zwracająca kolor dla statusu płatności
 */
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

/**
 * Komponent karty pojedynczej sesji ładowania
 */
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
    e.stopPropagation();
    router.push(`/payment?sessionId=${session.id}&amount=${session.total_cost}`);
  };

  return (
    <Card
      onClick={() => setShowDetails(prev => !prev)}
      className="bg-[var(--cardblack)] border border-[var(--yellow)] p-2 md:p-4 cursor-pointer"
    >
      <CardHeader className="p-2 md:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center 
        justify-between gap-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Add payment status indicator here */}
            {needsPayment && (
              <div className="relative">
                <div className={`w-2 md:w-3 h-2 md:h-3 rounded-full ${getPaymentStatusColor(session.payment_status)} animate-pulse`} />
              </div>
            )}
            
            {/* Existing car image and vehicle info */}
            <Image
              src="/car.svg"
              alt="Car"
              width={36}
              height={36}
              className="w-8 h-8 md:w-12 md:h-12"
            />
            <div>
              <p className="text-lg md:text-xl font-bold text-[--text-color]">
                {associatedVehicle ? associatedVehicle.brand : "N/A"}
              </p>
              <p className="text-xs md:text-sm text-[--text-color-lighter]">
                {associatedVehicle ? associatedVehicle.license_plate : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4 ml-auto">
          <div className="bg-[var(--yellow)] rounded-lg p-2">
                <Image
                  src="/charging.svg"
                  alt="Charging"
                  width={24}
                  height={24}
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </div>
            <div className="flex flex-col items-end">
              
              <p className="text-lg md:text-xl font-bold text-[--text-color]">
                {session.total_cost.toFixed(2)} zł
              </p>
              <p className="text-xs md:text-sm text-[--text-color-lighter]">
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
        <CardContent className="space-y-3 md:space-y-4 p-2 md:p-4 
        text-sm md:text-base">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-[--text-color]">Zużyta energia</p>
            <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
            {session.energy_used_kwh.toFixed(2)} kWh
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-[--text-color]">Całkowity koszt</p>
            <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
              {session.total_cost.toFixed(2)} zł
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-[--text-color]">Status</p>
            <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
              {session.status}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-[--text-color]">Status płatności</p>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getPaymentStatusColor(session.payment_status)}`} />
              <p className="text-white text-xs font-mono p-1 bg-gray-700 rounded-md">
                {session.payment_status || 'PENDING'}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-[--text-color]">Lokalizacja</p>
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
                Zapłać {session.total_cost.toFixed(2)} PLN
              </button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Główny komponent wyświetlający listę sesji ładowania
 */
export const ChargingSessionInfo = ({
  label,
  isLoading = false,
}: ChargingSessionInfoProps) => {
  // Stan komponentu
  const [stations, setStations] = useState<Station[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [displayCount, setDisplayCount] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');


  /**
   * Funkcja ładująca więcej sesji
   */
  const handleLoadMore = useCallback(() => {
    setDisplayCount(prevCount => {
      const nextCount = prevCount + 4;
      return nextCount > sessions.length ? sessions.length : nextCount;
    });
  }, [sessions.length]);

  /**
   * Funkcja sortująca sesje
   */
  const sortSessions = useCallback((sessionsToSort: ChargingSession[]) => {
    return [...sessionsToSort].sort((a, b) => {
      const aNeedsPayment = a.status === 'COMPLETED' && (!a.payment_status || a.payment_status === 'PENDING');
      const bNeedsPayment = b.status === 'COMPLETED' && (!b.payment_status || b.payment_status === 'PENDING');
      
      if (aNeedsPayment && !bNeedsPayment) return -1;
      if (!aNeedsPayment && bNeedsPayment) return 1;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, []);

  const filterAndSortSessions = useCallback((sessionsToProcess: ChargingSession[]) => {
    const filtered = sessionsToProcess.filter(session => {
      // Add null check for session
      if (!session) return false;

      // Ensure vehicle_id exists and convert to number
      const sessionVehicleId = session.vehicle_id ? Number(session.vehicle_id) : null;
      if (sessionVehicleId === null) return false;

      // Find associated vehicle with null check
      const associatedVehicle = vehicles.find(v => 
        v && v.id && Number(v.id) === sessionVehicleId
      );
      
      const matchesSearch = !searchQuery || // If no search query, include all
        (associatedVehicle && (
          associatedVehicle.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          associatedVehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        ));

      // Determine if session matches filter criteria
      const matchesFilter = filterBy === 'all' ? true :
        filterBy === 'pending_payment' ? (session.status === 'COMPLETED' && (!session.payment_status || session.payment_status === 'PENDING')) :
        filterBy === 'in_progress' ? session.status === 'IN_PROGRESS' :
        session.status === filterBy.toUpperCase();

      return matchesSearch && matchesFilter;
    });

    // Sort the filtered sessions
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest_cost':
          return b.total_cost - a.total_cost;
        case 'lowest_cost':
          return a.total_cost - b.total_cost;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
}, [searchQuery, filterBy, sortBy, vehicles]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsData = await getChargingSessionsInfo();    
        if (sessionsData) {
          const sortedSessions = sortSessions(sessionsData);
          setSessions(sortedSessions);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    fetchSessions();
}, [sortSessions]);

useEffect(() => {
    const fetchVehicles = async () => {
      // setIsLoadingVehicles(true);
      try {
        const vehiclesData = await getVehicles();
        if (vehiclesData) {
          setVehicles(vehiclesData);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        // setIsLoadingVehicles(false);
      }
    };
    fetchVehicles();
}, []);

  useEffect(() => {
          const fetchPorts = async () => {
              try {
                  const portsData = await getPortsInfo();
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
            <p className="text-2xl font-semibold text-center text-[--text-color]">
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
    <div className="w-full px-2 md:px-4">
      <Card className="bg-[var(--cardblack)] w-full max-w-[1200px] mx-auto border border-[var(--yellow)]">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <p className="text-xl md:text-2xl font-semibold text-center text-[--text-color]">
              {label}
            </p>
            
            {/* Search and Filters - Stack on mobile, row on desktop */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Box - Full width on mobile */}
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Szukaj po nazwie lub numerze rejestracyjnym..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[var(--background)] text-white border-[var(--yellow)] 
                focus:ring-2 focus:ring-[var(--yellow)] w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
              text-[--text-color-lighter] w-4 h-4" />
              </div>

              {/* Filter and Sort Group - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {/* Filter Dropdown */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <span className="text-[--text-color-lighter] text-sm">Filtruj:</span>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                    className="w-full sm:w-auto bg-[var(--background)] text-[--text-color] px-3 py-2 rounded-lg 
                  border border-[var(--yellow)] focus:outline-none 
                  focus:ring-2 focus:ring-[var(--yellow)]"
                  >
                    <option value="all">Wszystkie sesje</option>
                    <option value="completed">Zakończone</option>
                    <option value="in_progress">W trakcie</option>
                    <option value="pending_payment">Oczekujące na płatność</option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <span className="text-[--text-color-lighter] text-sm">Sortuj:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full sm:w-auto bg-[var(--background)] text-[--text-color] px-3 py-2 rounded-lg 
                  border border-[var(--yellow)] focus:outline-none 
                  focus:ring-2 focus:ring-[var(--yellow)]"
                  >
                    <option value="newest">Najnowsze</option>
                    <option value="oldest">Najstarsze</option>
                    <option value="highest_cost">Najdroższe</option>
                    <option value="lowest_cost">Najtańsze</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 p-2 md:p-4">
          {filterAndSortSessions(sessions)
            .slice(0, displayCount)
            .map((session) => {           
              const associatedVehicle = vehicles.find(vehicle => Number(vehicle.id) === Number(session.vehicle_id));
              const associatedPort = ports.find(port => Number(port.id) === Number(session.port_id));
              const associatedStation = associatedPort
                ? stations.find(station => Number(station.id) === Number(associatedPort.station_id))
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

          {/* Update the Load More button to use filtered length */}
          {filterAndSortSessions(sessions).length > displayCount && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={handleLoadMore}
                className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              >
                Załaduj więcej ({filterAndSortSessions(sessions).length - displayCount} pozostało)
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};