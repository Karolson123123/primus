"use server";

import { auth } from "@/auth";

/**
 * Interfejs stacji ładowania
 */
interface ChargingStation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

/**
 * Dane wymagane do utworzenia nowej stacji
 */
export interface CreateStationData {
    name: string;
    latitude: number;
    longitude: number;
}

/**
 * Pobiera informacje o wszystkich stacjach ładowania
 */
export const getStationsInfo = async (): Promise<ChargingStation[] | null> => {
    try {
        const session = await auth();
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (session?.user?.apiToken) {
            headers['Authorization'] = `Bearer ${session.user.apiToken}`;
        }

        const response = await fetch(`${baseUrl}/stations`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error('Błąd pobierania stacji');
        }
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Tworzy nową stację ładowania
 */
export const createStation = async (stationData: CreateStationData): Promise<ChargingStation> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/stations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(stationData)
        });

        if (!response.ok) {
            throw new Error('Błąd tworzenia stacji');
        }

        return await response.json();
    } catch (error) {
        throw error instanceof Error ? error : new Error('Wystąpił nieoczekiwany błąd');
    }
};

/**
 * Usuwa stację ładowania
 */
export const deleteStation = async (stationId: number): Promise<void> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/stations/${stationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.user.apiToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Błąd usuwania stacji');
        }
    } catch (error) {
        throw error instanceof Error ? error : new Error('Wystąpił nieoczekiwany błąd');
    }
};

/**
 * Aktualizuje dane stacji ładowania
 */
export const updateStation = async (stationId: number, data: Partial<CreateStationData>): Promise<ChargingStation> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/stations/${stationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Błąd aktualizacji stacji');
        }

        return await response.json();
    } catch (error) {
        throw error instanceof Error ? error : new Error('Wystąpił nieoczekiwany błąd');
    }
};