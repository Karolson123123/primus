'use server'

import { auth } from '@/auth';
import { startChargingSession, stopChargingSession } from '@/data/charging-session';
import { updateVehicleCapacity } from '@/data/vehicles';
import { ChargingSession } from '@/data/charging-session';

/**
 * Interfejs danych sesji ładowania
 */
interface ChargingSessionData {
    vehicle_id: number;
    port_id: number;
    start_time: string;
    duration_minutes: number;
    end_time?: string;
    energy_used_kwh: number;
    total_cost: number;
    status: 'IN_PROGRESS' | 'COMPLETED';
}

/**
 * Aktualizuje status portu ładowania
 * @param portId - Identyfikator portu
 * @param status - Nowy status portu ('wolny' lub 'zajety')
 */
async function updatePortStatus(portId: number, status: 'wolny' | 'zajety') {
    const session = await auth();
    if (!session?.user?.apiToken) {
        throw new Error('Brak tokenu uwierzytelniającego');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/ports/${portId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.apiToken}`
        },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Nie udało się zaktualizować statusu portu');
    }

    return response.json();
}

/**
 * Rozpoczyna nową sesję ładowania
 * @param sessionData - Dane sesji ładowania
 */
export async function startNewChargingSession(sessionData: ChargingSessionData) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('Wymagane uwierzytelnienie');
    }
  
    try {
        await updatePortStatus(sessionData.port_id, 'zajety');
        const response = await startChargingSession({
            ...sessionData,
            // user_id: session.user.id
        });
        return response;
    } catch (error) {
        try {
            await updatePortStatus(sessionData.port_id, 'wolny');
        } catch  {
            throw new Error('Nie udało się zresetować statusu portu');
        }
        throw error instanceof Error ? error : new Error('Nie udało się rozpocząć sesji ładowania');
    }
}

/**
 * Kończy bieżącą sesję ładowania
 * @param sessionId - Identyfikator sesji
 * @param vehicleId - Identyfikator pojazdu
 * @param currentCapacity - Aktualna pojemność baterii
 * @param energyUsed - Zużyta energia
 * @param finalCost - Końcowy koszt
 */
export async function stopCurrentChargingSession(
    sessionId: number,
    vehicleId: number,
    currentCapacity: number,
    energyUsed: number,
    finalCost: number
) {
    try {
        const sessionData: ChargingSession = {
            id: sessionId,
            vehicle_id: vehicleId,
            port_id: 0,
            start_time: "",
            end_time: new Date().toISOString(),
            energy_used_kwh: energyUsed,
            total_cost: finalCost,
            status: 'COMPLETED',
            payment_status: "PENDING"
        };

        const session = await stopChargingSession(sessionData);
        if (!session) {
            throw new Error('Nie udało się zakończyć sesji ładowania');
        }

        await updateVehicleCapacity(vehicleId, currentCapacity);
        
        if (session.port_id) {
            await updatePortStatus(session.port_id, 'wolny');
        }

        return session;
    } catch (error) {
        throw new Error(
            error instanceof Error 
                ? error.message 
                : 'Nie udało się zakończyć sesji ładowania'
        );
    }
}

/**
 * Aktualizuje stan sesji ładowania
 * @param sessionId - Identyfikator sesji
 * @param updatedData - Zaktualizowane dane sesji
 */
export async function updateSessionState(sessionId: number, updatedData: {
    energy_used_kwh: number;
    current_battery_level: number;
}) {
    try {
        const session = await auth();
        if (!session?.user) {
            throw new Error('Wymagane uwierzytelnienie');
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/sessions/${sessionId}/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error('Nie udało się zaktualizować stanu sesji');
        }

        return await response.json();
    } catch {
        throw new Error('Błąd podczas aktualizacji stanu sesji');
    }
}