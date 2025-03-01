"use server";

import { auth } from "@/auth";

export interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  battery_capacity_kwh: number;  // Changed from battery_capacity_kWh
  battery_condition: number;
  max_charging_powerkwh: number;
  created_at: string;
  user_id: number;
  current_battery_capacity_kw: number;
}

interface CreateVehicleData {
    license_plate: string;
    brand: string;
    battery_capacity_kwh: number;
    battery_condition: number;
    max_charging_powerkWh: number;
    current_battery_capacity_kw: number; // Add this required field
}

export async function getVehicles(): Promise<Vehicle[] | null> {
  try {
    const session = await auth();
    if (!session?.user?.apiToken) {
      console.error("No authentication token available");
      return null;
    }

    console.log("Auth token:", session?.user?.apiToken?.substring(0, 20) + "...");

    const token = session.user.apiToken;
    console.log("Request token structure:", {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20),
        tokenEnd: token.substring(token.length - 20),
        fullHeader: `Bearer ${token}`.substring(0, 50) + "..."
    });

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    console.log("Fetching vehicles from:", `${baseUrl}/vehicles`);
    
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

export const createVehicle = async (vehicleData: CreateVehicleData): Promise<Vehicle> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        // Add user_id to the vehicle data
        const completeVehicleData = {
            ...vehicleData,
            user_id: session.user.id
        };
        
        console.log("Creating vehicle with data:", completeVehicleData);
        
        const response = await fetch(`${baseUrl}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(completeVehicleData)
        });

        const errorData = await response.json();

        if (!response.ok) {
            // Handle FastAPI validation errors
            if (response.status === 422) {
                const validationErrors = errorData.detail;
                const errorMessage = Array.isArray(validationErrors) 
                    ? validationErrors.map(e => e.msg).join(', ')
                    : 'Validation error';
                throw new Error(errorMessage);
            }
            
            // Handle other API errors
            throw new Error(errorData.detail || 'Failed to create vehicle');
        }

        console.log("Vehicle created successfully:", errorData);
        return errorData;
    } catch (error) {
        console.error("Error in createVehicle:", error);
        throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
};

export const updateVehicleCapacity = async (vehicleId: number, newCapacity: number): Promise<Vehicle> => {
    try {
        const session = await auth();
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        // Round to 3 decimal places and ensure it's a number
        const roundedCapacity = Number(newCapacity.toFixed(3));
        
        // Log before sending request
        console.log("Updating vehicle capacity:", {
            vehicleId,
            newCapacity: roundedCapacity,
            originalValue: newCapacity
        });
        
        const response = await fetch(`${baseUrl}/vehicles/${vehicleId}/capacity`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            // Add the missing request body
            body: JSON.stringify({
                current_battery_capacity_kw: roundedCapacity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle FastAPI validation errors
            if (response.status === 422) {
                const validationErrors = data.detail;
                const errorMessage = Array.isArray(validationErrors) 
                    ? validationErrors.map(e => e.msg).join(', ')
                    : 'Validation error';
                throw new Error(errorMessage);
            }
            
            throw new Error(data.detail || 'Failed to update vehicle capacity');
        }

        // Log after successful update
        console.log("Vehicle capacity updated successfully:", {
            oldCapacity: data.current_battery_capacity_kw,
            newCapacity: roundedCapacity,
            returnedCapacity: data.current_battery_capacity_kw
        });

        return data;
    } catch (error) {
        console.error("Error in updateVehicleCapacity:", error);
        throw error instanceof Error ? error : new Error('Failed to update vehicle capacity');
    }
};