"use server";

import { auth } from "@/auth";

interface Port {
    id: number;
    station_id: number;
    power_kw: number;
    status: 'wolny' | 'zajety' | 'nieczynny';
    last_service_date: string | null;
    created_at: string;
}

export interface CreatePortData {
    station_id: number;
    power_kw: number;
    status: 'wolny' | 'zajety' | 'nieczynny';
}

export const getPortsInfo = async (): Promise<Port[] | null> => {
    try {
        const session = await auth();
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/ports`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch ports');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching ports:", error);
        return null;
    }
}

export const updatePortStatus = async (portId: number, status: 'wolny' | 'zajety' | 'nieczynny'): Promise<Port | null> => {
    try {
        const session = await auth();
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        // First check if there are any active sessions for this port
        const activeSessions = await fetch(
            `${baseUrl}/sessions/active/${portId}`,
            {
                headers: {
                    'Authorization': `Bearer ${session.user.apiToken}`
                }
            }
        );

        if (!activeSessions.ok) {
            throw new Error('Failed to check active sessions');
        }

        const sessionsData = await activeSessions.json();
        const hasActiveSessions = sessionsData.length > 0;

        // If port is marked as nieczynny, keep it that way regardless of sessions
        if (status === 'nieczynny') {
            const response = await fetch(`${baseUrl}/ports/${portId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.apiToken}`
                },
                body: JSON.stringify({ status: 'nieczynny' })
            });

            if (!response.ok) {
                throw new Error('Failed to update port status');
            }
            return response.json();
        }

        // If there are active sessions, port must be zajety
        // If no active sessions and not marked as nieczynny, port should be wolny
        const actualStatus = hasActiveSessions ? 'zajety' : 'wolny';

        const response = await fetch(`${baseUrl}/ports/${portId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify({ status: actualStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update port status');
        }

        return response.json();
    } catch (error) {
        console.error("Error updating port status:", error);
        return null;
    }
};

export const createPort = async (portData: CreatePortData): Promise<Port> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/ports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(portData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error('Failed to create port');
        }

        return await response.json();
    } catch (error) {
        console.error("Error in createPort:", error);
        throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
};

export const deletePort = async (portId: number): Promise<void> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/ports/${portId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.user.apiToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(
                response.status === 400 
                    ? 'Cannot delete port with active charging sessions' 
                    : 'Failed to delete port'
            );
        }
    } catch (error) {
        console.error("Error in deletePort:", error);
        throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
};

export const updatePort = async (portId: number, data: Partial<CreatePortData>): Promise<Port> => {
    try {
        const session = await auth();
        if (!session?.user?.apiToken) {
            throw new Error("No authentication token available");
        }

        // Using PUT method as required by backend
        const response = await fetch(`http://localhost:8000/ports/${portId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error('Failed to update port');
        }

        return await response.json();
    } catch (error) {
        console.error("Error in updatePort:", error);
        throw error;
    }
};