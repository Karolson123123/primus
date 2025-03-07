"use client"

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { getVehicles } from "@/data/vehicles";
import { useEffect, useState as useReactState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

/**
 * Interfejs pojazdu
 */
interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  battery_capacity_kwh: number;
  battery_condition: number;
  current_battery_capacity_kw: number;
  max_charging_powerkwh: number;
  created_at: string;
}

/**
 * Interfejs właściwości komponentu listy pojazdów
 */
interface VehiclesInfoProps {
    vehicles?: Vehicle[];
    label: string;
    isLoading?: boolean;
}

type SortOption = 'battery' | 'capacity' | 'alphabetical' | 'condition';

/**
 * Komponent karty pojedynczego pojazdu
 */
const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = () => setShowDetails((prev) => !prev);

  const batteryConditionPercentage = Math.round(vehicle.battery_condition * 100);
  const currentBatteryPercentage = Math.round((vehicle.current_battery_capacity_kw / vehicle.battery_capacity_kwh) * 100);

  return (
    <div
      onClick={toggleDetails}
      className="cursor-pointer rounded-lg border border-[var(--yellow)] p-3 sm:p-4 space-y-2 bg-[var(--cardblack)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Image src={'car.svg'} alt="Pojazd" width={36} height={36} className="w-8 h-8 sm:w-12 sm:h-12" />
          <div>
            <p className="text-base sm:text-xl font-bold text-[--text-color]">{vehicle.brand}</p>
            <p className="text-xs sm:text-sm text-[var(--text-color-lighter)]">{vehicle.license_plate}</p>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 sm:w-6 sm:h-6 transform transition-transform duration-150 ${showDetails ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="white"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        showDetails ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 border-t border-[var(--yellow)] pt-3 sm:pt-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm text-[var(--text-color-lighter)]">Pojemność baterii</p>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <p className="text-xs sm:text-md text-[--text-color] p-1 bg-gray-700 rounded-md">
                  {vehicle.battery_capacity_kwh} kWh
                </p>
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm text-[var(--text-color-lighter)]">Stan baterii</p>
              <Badge 
                variant={vehicle.battery_condition > 0.7 ? "success" : "destructive"}
                className="text-xs sm:text-sm px-2 py-1"
              >
                {batteryConditionPercentage}%
              </Badge>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm text-[var(--text-color-lighter)]">Aktualny poziom</p>
              <Badge 
                variant={(vehicle.current_battery_capacity_kw / vehicle.battery_capacity_kwh) > 0.7 ? "success" : "destructive"}
                className="text-xs sm:text-sm px-2 py-1"
              >
                {currentBatteryPercentage}%
              </Badge>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm text-[var(--text-color-lighter)]">Maksymalna moc ładowania</p>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <p className="text-xs sm:text-md text-[--text-color] p-1 bg-gray-700 rounded-md">
                  {vehicle.max_charging_powerkwh} kW
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Główny komponent listy pojazdów
 */
export const VehiclesInfo = ({ vehicles = [], label, isLoading = false }: VehiclesInfoProps) => {
    const [displayCount, setDisplayCount] = useState(5);
    const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
    const [searchQuery, setSearchQuery] = useState('');

    const sortAndFilterVehicles = useCallback((vehicles: Vehicle[]) => {
        const filteredVehicles = vehicles.filter(vehicle => 
            vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filteredVehicles.sort((a, b) => {
            switch (sortBy) {
                case 'battery':
                    return (b.current_battery_capacity_kw / b.battery_capacity_kwh) - 
                           (a.current_battery_capacity_kw / a.battery_capacity_kwh);
                case 'capacity':
                    return b.battery_capacity_kwh - a.battery_capacity_kwh;
                case 'condition':
                    return b.battery_condition - a.battery_condition;
                case 'alphabetical':
                default:
                    return a.brand.localeCompare(b.brand);
            }
        });
    }, [sortBy, searchQuery]);

    const handleLoadMore = useCallback(() => {
        setDisplayCount(prevCount => Math.min(prevCount + 5, vehicles.length));
    }, [vehicles.length]);

    if (isLoading) {
        return (
            <Card className="bg-[var(--cardblack)] w-[90%]">
                <CardHeader>
                    <p className="text-2xl font-semibold text-center text-[--text-color]">{label}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-700 rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const displayedVehicles = sortAndFilterVehicles(vehicles).slice(0, displayCount);
    const remainingCount = sortAndFilterVehicles(vehicles).length - displayCount;

    return (
        <Card className="bg-[var(--cardblack)] w-full max-w-[95%] lg:max-w-[90%] mx-auto">
            <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                    <p className="text-xl sm:text-2xl font-semibold text-[--text-color] text-center sm:text-left">
                        {label}
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Input
                                type="text"
                                placeholder="Szukaj pojazdów..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 sm:pl-10 py-1 sm:py-2 text-sm sm:text-base bg-gray-700 text-[--text-color] border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]"
                            />
                            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-color-lighter)] w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-[var(--text-color-lighter)] text-sm sm:text-base">Sortuj:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="bg-gray-700 text-[--text-color] text-sm sm:text-base px-2 sm:px-3 py-1 rounded-lg border border-[var(--yellow)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                            >
                                <option value="alphabetical">Alfabetycznie</option>
                                <option value="battery">Poziom baterii</option>
                                <option value="capacity">Pojemność</option>
                                <option value="condition">Stan baterii</option>
                            </select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                {displayedVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}

                {remainingCount > 0 && (
                    <div className="flex justify-center mt-4 sm:mt-6">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black text-sm sm:text-base font-medium px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                        >
                            Pokaż więcej ({remainingCount} pozostało)
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

/**
 * Strona listy pojazdów
 */
const VehiclesPage = () => {
    const [vehicles, setVehicles] = useReactState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useReactState(true);
    const [error, setError] = useReactState<string | null>(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setIsLoading(true);
                const data = await getVehicles();
                if (Array.isArray(data)) {
                    setVehicles(data);
                } else {
                    setError('Nieprawidłowy format danych');
                }
            } catch (error) {
                setError('Nie udało się załadować pojazdów. Spróbuj ponownie później.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center min-h-screen">
                <div className="text-[--text-color] text-lg">Ładowanie pojazdów...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center items-center min-h-screen p-4">
            {vehicles.length === 0 ? (
                <div className="text-[--text-color] text-lg">Brak pojazdów</div>
            ) : (
                <VehiclesInfo 
                    label="Moje pojazdy"
                    vehicles={vehicles}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default VehiclesPage;