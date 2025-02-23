"use server";

import { auth } from "@/auth";

interface ChargingSession {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    vehicle_id: number;
    start_time: string;
    end_time: string | null;
    energy_used_kWh: number;
    total_cost: number;
    status: string;
}

export const getChargingSessionsInfo = async (): Promise<ChargingSession[] | null> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            console.error("No authentication token available");
            return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${baseUrl}/sessions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch vehicles');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return null;
    }
}