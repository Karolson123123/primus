"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { getVehicles } from "@/data/vehicles";
import { useEffect, useState } from "react";

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
                    <div key={vehicle.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Numer rejestracyjny
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {vehicle.license_plate}
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Marka
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {vehicle.brand}
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Pojemność baterii
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {vehicle.battery_capacity_kWh} kWh
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Stan baterii
                            </p>
                            <Badge variant={vehicle.battery_condition > 0.7 ? "success" : "destructive"}>
                                {Math.round(vehicle.battery_condition * 100)}%
                            </Badge>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const VehiclesPage = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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