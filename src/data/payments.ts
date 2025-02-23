"use server";

import { auth } from "@/auth";

interface Payment {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

export const getPaymentsInfo = async (): Promise<Payment[] | null> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            console.error("No authentication token available");
            return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${baseUrl}/payments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            cache: 'no-store'
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
        console.log("Successfully fetched payments:", {
            count: data?.length || 0
        });
        
        return data;
    } catch (error) {
        console.error("Error in getPaymentsInfo:", {
            name: error?.name,
            message: error instanceof Error ? error.message : "Unknown error",
            error: JSON.stringify(error, null, 2)
        });
        return null;
    }
}