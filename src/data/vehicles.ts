"use server";

import { auth } from "@/auth";

/**
 * Interfejs pojazdu elektrycznego
 */
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

/**
 * Dane wymagane do utworzenia nowego pojazdu
 */
interface CreateVehicleData {
    license_plate: string;
    brand: string;
    battery_capacity_kwh: number;
    battery_condition: number;
    max_charging_powerkwh: number;
    current_battery_capacity_kw: number;
}

/**
 * Pobiera wszystkie pojazdy użytkownika
 */
export async function getVehicles(): Promise<Vehicle[] | null> {
  try {
    const session = await auth();
    if (!session?.user?.apiToken) {
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
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Tworzy nowy pojazd
 */
export const createVehicle = async (vehicleData: CreateVehicleData): Promise<Vehicle> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const completeVehicleData = {
            ...vehicleData,
            user_id: session.user.id,
            battery_capacity_kwh: Math.round(Math.max(0, Number(vehicleData.battery_capacity_kwh || 0))),
            max_charging_powerkwh: Math.round(Math.max(0, Number(vehicleData.max_charging_powerkwh || 0))),
            battery_condition: Math.min(100, Math.max(0, vehicleData.battery_condition)),
            current_battery_capacity_kw: Number(
                Math.min(
                    Number(vehicleData.current_battery_capacity_kw || 0),
                    Number(vehicleData.battery_capacity_kwh || 0)
                ).toFixed(2)
            )
        };

        if (completeVehicleData.battery_condition < 0 || completeVehicleData.battery_condition > 100) {
            throw new Error('Stan baterii musi być między 0 a 100%');
        }

        const response = await fetch(`${baseUrl}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(completeVehicleData)
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            const textResponse = await response.text();
            if (textResponse.includes("vehicles_license_plate_unique")) {
                throw new Error("Pojazd o tym numerze rejestracyjnym już istnieje");
            }
            throw new Error(`Błąd serwera: ${textResponse}`);
        }

        if (!response.ok) {
            if (response.status === 409 || 
                (responseData.detail && 
                 (responseData.detail.includes("license_plate") || 
                  responseData.detail.includes("UniqueViolation")))) {
                throw new Error("Pojazd o tym numerze rejestracyjnym już istnieje");
            }
            
            if (response.status === 422) {
                const validationErrors = responseData.detail;
                const errorMessage = Array.isArray(validationErrors) 
                    ? validationErrors.map(e => e.msg).join(', ')
                    : 'Błąd walidacji';
                throw new Error(errorMessage);
            }
            
            throw new Error(responseData.detail || 'Nie udało się utworzyć pojazdu');
        }

        return responseData;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Nie udało się utworzyć pojazdu');
    }
};

/**
 * Aktualizuje poziom naładowania pojazdu
 */
export const updateVehicleCapacity = async (vehicleId: number, newCapacity: number): Promise<Vehicle> => {
    try {
        const session = await auth();
        if (!session?.user?.apiToken) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const roundedCapacity = Number(newCapacity.toFixed(3));
        
        const response = await fetch(`${baseUrl}/vehicles/${vehicleId}/capacity`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify({
                current_battery_capacity_kw: roundedCapacity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 422) {
                const validationErrors = data.detail;
                const errorMessage = Array.isArray(validationErrors) 
                    ? validationErrors.map(e => e.msg).join(', ')
                    : 'Błąd walidacji';
                throw new Error(errorMessage);
            }
            
            throw new Error(data.detail || 'Nie udało się zaktualizować poziomu naładowania');
        }

        return data;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Nie udało się zaktualizować poziomu naładowania');
    }
};