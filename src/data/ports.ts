"use server";

import { auth } from "@/auth";

/**
 * Interfejs portu ładowania
 */
interface Port {
    id: number;
    station_id: number;
    power_kw: number;
    status: 'wolny' | 'zajety' | 'nieczynny';
    last_service_date: string | null;
    created_at: string;
}

/**
 * Dane wymagane do utworzenia nowego portu
 */
export interface CreatePortData {
    station_id: number;
    power_kw: number;
    status: 'wolny' | 'zajety' | 'nieczynny';
}

/**
 * Pobiera informacje o wszystkich portach ładowania
 */
export const getPortsInfo = async (): Promise<Port[] | null> => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${baseUrl}/ports`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            throw new Error(`Błąd pobierania portów: ${response.status}`);
        }

        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Aktualizuje status portu ładowania
 */
export const updatePortStatus = async (portId: number, status: 'wolny' | 'zajety' | 'nieczynny'): Promise<Port | null> => {
    try {
        const session = await auth();
        if (!session?.user?.apiToken) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const activeSessions = await fetch(
            `${baseUrl}/sessions/active/${portId}`,
            {
                headers: {
                    'Authorization': `Bearer ${session.user.apiToken}`
                }
            }
        );

        if (!activeSessions.ok) {
            throw new Error('Błąd sprawdzania aktywnych sesji');
        }

        const sessionsData = await activeSessions.json();
        const hasActiveSessions = sessionsData.length > 0;

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
                throw new Error('Błąd aktualizacji statusu portu');
            }
            return response.json();
        }

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
            throw new Error('Błąd aktualizacji statusu portu');
        }

        return response.json();
    } catch {
        return null;
    }
};

/**
 * Tworzy nowy port ładowania
 */
export const createPort = async (portData: CreatePortData): Promise<Port> => {
    try {
        const session = await auth();
        if (!session?.user?.apiToken) {
            throw new Error('Wymagane uwierzytelnienie');
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
            throw new Error('Błąd tworzenia portu');
        }

        return await response.json();
    } catch (error) {
        throw error instanceof Error ? error : new Error('Błąd tworzenia portu');
    }
};

/**
 * Usuwa port ładowania
 */
export const deletePort = async (portId: number): Promise<void> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/ports/${portId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.user.apiToken}`
            }
        });

        if (!response.ok) {
            throw new Error(
                response.status === 400 
                    ? 'Nie można usunąć portu z aktywnymi sesjami ładowania' 
                    : 'Błąd usuwania portu'
            );
        }
    } catch (error) {
        throw error instanceof Error ? error : new Error('Wystąpił nieoczekiwany błąd');
    }
};

/**
 * Aktualizuje dane portu ładowania
 */
export const updatePort = async (portId: number, data: Partial<CreatePortData>): Promise<Port> => {
    try {
        const session = await auth();
        if (!session?.user?.apiToken) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${baseUrl}/ports/${portId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Błąd aktualizacji portu');
        }

        return await response.json();
    } catch (error) {
        throw error instanceof Error ? error : new Error('Błąd aktualizacji portu');
    }
};