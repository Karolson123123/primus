"use server";

import { auth } from "@/auth";


interface ChargingStation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

export interface CreateStationData {
    name: string;
    latitude: number;
    longitude: number;
}

export const getStationsInfo = async (): Promise<ChargingStation[] | null> => {
    try {
        // Try to get session but don't require it
        const session = await auth();
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // Add authorization header only if user is logged in
        if (session?.user?.apiToken) {
            headers['Authorization'] = `Bearer ${session.user.apiToken}`;
        }

        const response = await fetch(`${baseUrl}/stations`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stations');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching stations:", error);
        return null;
    }
}

export const createStation = async (stationData: CreateStationData): Promise<ChargingStation> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const response = await fetch('http://localhost:8000/stations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(stationData)
        });

        // First check response.ok before trying to parse JSON
        if (!response.ok) {
            const errorText = await response.text(); // Get raw response text
            console.error('Server error response:', errorText);
            throw new Error('Failed to create station');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in createStation:", error);
        throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
};

export const deleteStation = async (stationId: number): Promise<void> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const response = await fetch(`http://localhost:8000/stations/${stationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.user.apiToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete station');
        }
    } catch (error) {
        console.error("Error in deleteStation:", error);
        throw error;
    }
};

export const updateStation = async (stationId: number, data: Partial<CreateStationData>): Promise<ChargingStation> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const response = await fetch(`http://localhost:8000/stations/${stationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to update station');
        }

        return await response.json();
    } catch (error) {
        console.error("Error in updateStation:", error);
        throw error;
    }
};

