"use client"

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { getVehicles } from "@/data/vehicles";
import { useEffect, useState as useReactState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Make sure you have lucide-react installed

interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  battery_capacity_kwh: number;
  battery_condition: number;
  current_battery_capacity_kw: number; // Add this field
  max_charging_powerkwh: number;
  created_at: string;
}

interface VehiclesInfoProps {
    vehicles?: Vehicle[];
    label: string;
    isLoading?: boolean;
}

// First, add this type definition after your existing interfaces
type SortOption = 'battery' | 'capacity' | 'alphabetical' | 'condition';

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = () => setShowDetails((prev) => !prev);

  // Calculate battery percentages
  const batteryConditionPercentage = Math.round(vehicle.battery_condition * 100);
  const currentBatteryPercentage = Math.round((vehicle.current_battery_capacity_kw / vehicle.battery_capacity_kwh) * 100);

  return (
    <div
      onClick={toggleDetails}
      className="cursor-pointer rounded-lg border border-[var(--yellow)] p-4 space-y-2 bg-[var(--cardblack)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Car image placeholder */}
          <Image
            src={'car.svg'}
            alt="Car"
            width={48}
            height={48}
            className=""
          />
          <div>
            <p className="text-xl font-bold text-white">{vehicle.brand}</p>
            <p className="text-sm text-gray-300">{vehicle.license_plate}</p>
          </div>
        </div>
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
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showDetails ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-4 space-y-4 border-t border-[var(--yellow)] pt-4">
          {/* Battery Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Battery Capacity</p>
              <div className="flex items-center space-x-2">
                <p className="text-md text-white p-1 bg-gray-700 rounded-md">
                  {vehicle.battery_capacity_kwh} kWh
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Battery Condition</p>
              <Badge 
                variant={vehicle.battery_condition > 0.7 ? "success" : "destructive"}
              >
                {batteryConditionPercentage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Current Battery</p>
              <Badge 
                variant={
                  (vehicle.current_battery_capacity_kw / vehicle.battery_capacity_kwh) > 0.7 
                    ? "success" 
                    : "destructive"
                }
              >
                {currentBatteryPercentage}%
              </Badge>
            </div>
            {/* Add Max Charging Power */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Max Charging Power</p>
              <div className="flex items-center space-x-2">
                <p className="text-md text-white p-1 bg-gray-700 rounded-md">
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

// Update the VehiclesInfo component
export const VehiclesInfo = ({
    vehicles = [],
    label,
    isLoading = false,
}: VehiclesInfoProps) => {
    const [displayCount, setDisplayCount] = useState(5);
    const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
    // Add search state
    const [searchQuery, setSearchQuery] = useState('');

    const sortAndFilterVehicles = useCallback((vehicles: Vehicle[]) => {
        // First filter
        const filteredVehicles = vehicles.filter(vehicle => 
            vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Then sort
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
        setDisplayCount(prevCount => {
            const nextCount = prevCount + 5;
            return nextCount > vehicles.length ? vehicles.length : nextCount;
        });
    }, [vehicles.length]);

    if (isLoading) {
        return (
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
        );
    }

    // Get the sorted and sliced vehicles
    const displayedVehicles = sortAndFilterVehicles(vehicles).slice(0, displayCount);
    const remainingCount = vehicles.length - displayCount;
    const hasMore = remainingCount > 0;

    return (
        <Card className="bg-[var(--cardblack)] w-[90%]">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-2xl font-semibold text-white">
                        {label}
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        {/* Search input */}
                        <div className="relative w-full md:w-64">
                            <Input
                                type="text"
                                placeholder="Search vehicles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-700 text-white border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                        
                        {/* Existing sort dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-[var(--yellow)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                            >
                                <option value="alphabetical">Alphabetical</option>
                                <option value="battery">Battery %</option>
                                <option value="capacity">Max Capacity</option>
                                <option value="condition">Battery Condition</option>
                            </select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayedVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}

                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                        >
                            Load More ({remainingCount} remaining)
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

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
                    setError('Invalid data format received');
                }
            } catch (error) {
                console.error("Error fetching vehicles:", error);
                setError('Failed to load vehicles. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    if (isLoading) {
        return <div className="text-white">Loading vehicles...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="w-full flex justify-center items-center min-h-screen">
            {vehicles.length === 0 ? (
                <div className="text-white">No vehicles found</div>
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