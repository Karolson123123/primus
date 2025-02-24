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
    battery_capacity_kWh: number;
    battery_condition: number;
    max_charging_powerkWh: number;
    created_at: string;
}

interface VehiclesInfoProps {
    vehicles?: Vehicle[];
    label: string;
    isLoading?: boolean;
}

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
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
              {vehicle.battery_capacity_kWh} kWh
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

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await getVehicles();
                if (data) {
                    setVehicles(data);
                }
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full flex justify-center items-center min-h-screen">
            <VehiclesInfo 
                label="Moje pojazdy"
                vehicles={vehicles}
                isLoading={isLoading}
            />
        </div>
    );
};

export default VehiclesPage;