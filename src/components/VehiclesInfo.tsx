"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { getVehicles } from "@/data/vehicles";
import { useEffect, useState as useReactState } from "react";
import Image from "next/image";
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

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  console.log('Vehicle data:', vehicle); // Add this line to debug
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => setShowDetails((prev) => !prev);

  return (
    <div
      onClick={toggleDetails}
      className="cursor-pointer rounded-lg border p-4 space-y-2"
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
        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-md font-medium text-white">Pojemność baterii</p>
            <p className="text-md text-white p-1 bg-gray-700 rounded-md">
              {vehicle.battery_capacity_kwh} kWh
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-md font-medium text-white">Stan baterii</p>
            <Badge
              variant={
                vehicle.battery_condition > 0.7 ? "success" : "destructive"
              }
            >
              {Math.round(vehicle.battery_condition * 100)}%
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-md font-medium text-white">
                Battery Condition
              </label>
              <Badge 
                variant={vehicle.battery_condition > 0.7 ? "success" : "destructive"}
              >
                {Math.round(vehicle.battery_condition * 100)}%
              </Badge>
            </div>
            
            {/* Add current battery level */}
            <div>
              <label className="text-md font-medium text-white">
                Current Battery
              </label>
              <Badge 
                variant={
                  (vehicle.current_battery_capacity_kw / vehicle.battery_capacity_kwh) > 0.7 
                    ? "success" 
                    : "destructive"
                }
              >
                {Math.round((vehicle.current_battery_capacity_kw / vehicle.battery_capacity_kwh) * 100)}%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VehiclesInfo = ({
    vehicles,
    label,
    isLoading = false,
}: VehiclesInfoProps) => {
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
    return (
        <Card className="bg-[var(--cardblack)] w-[90%]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center text-white">
                    {label}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {vehicles?.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
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