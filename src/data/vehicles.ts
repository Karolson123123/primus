"use server";

import { auth } from "@/auth";

interface Vehicle {
    id: number;
    license_plate: string;
    brand: string;
    battery_capacity_kWh: number;
    battery_condition: number;
    max_charging_powerkWh: number;
    created_at: string;
    user_id: number;
}

interface CreateVehicleData {
    license_plate: string;
    brand: string;
    battery_capacity_kWh: number;
    battery_condition: number;
    max_charging_powerkWh: number;
}

export const getVehicles = async (): Promise<Vehicle[] | null> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            console.error("No authentication token available");
            return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${baseUrl}/vehicles`, {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            }),
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: "Failed to parse error response"
            }));
            console.error("API Error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            return null;
        }

        const data = await response.json();
        console.log("Successfully fetched vehicles:", {
            count: data?.length || 0
        });
        
        return data;
    } catch (error) {
        console.error("Error in getVehicles:", {
            name: error?.name,
            message: error instanceof Error ? error.message : "Unknown error",
            error: JSON.stringify(error, null, 2)
        });
        return null;
    }
}

export const createVehicle = async (vehicleData: CreateVehicleData): Promise<Vehicle | null> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        console.log("Creating vehicle with data:", vehicleData);
        
        const response = await fetch(`${baseUrl}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(vehicleData),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("API Error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(errorData?.message || 'Failed to create vehicle');
        }

        const data = await response.json();
        console.log("Vehicle created successfully:", data);
        return data;
    } catch (error) {
        console.error("Error in createVehicle:", error);
        throw error;
    }
}