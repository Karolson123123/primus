"use server";

import { auth } from "@/auth";
import { updateVehicleCapacity } from '@/data/vehicles';
import { updatePortStatus } from "./ports";

// Interfejsy definiujące strukturę danych
export interface Vehicle {
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

export interface ChargingSessionData {
  vehicle_id: number;
  port_id: number;
  start_time?: string;
  duration_minutes: number;
  energy_used_kwh?: number;
  total_cost?: number;
  status?: 'IN_PROGRESS' | 'COMPLETED';
}

export interface ChargingSession {
  id: number;
  vehicle_id: number;
  port_id: number;
  start_time: string;
  end_time?: string;
  energy_used_kwh: number;
  total_cost: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  duration_minutes?: number;
  current_battery_capacity_kw?: number;
}

/**
 * Pobiera informacje o wszystkich sesjach ładowania
 */
export const getChargingSessionsInfo = async () => {
  try {
    const session = await auth();
    if (!session?.user?.apiToken) {
      throw new Error("Brak tokenu uwierzytelniającego");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    console.log('Fetching sessions from:', `${baseUrl}/sessions`);
    console.log('Using token:', session.user.apiToken ? 'Token present' : 'No token');

    const response = await fetch(`${baseUrl}/sessions`, {
      headers: {
        'Authorization': `Bearer ${session.user.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch sessions:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Błąd pobierania sesji: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', data);

    // Check if data is empty or invalid
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('No charging sessions found in response');
      return [];
    }

    // Rest of your existing validation code...
    const validatedSessions = data
      .filter(session => session && typeof session === 'object')
      .map(session => {
        // Deep clone the session object to avoid mutation
        const processedSession = {
          ...session,
          id: parseInt(session.id, 10),
          vehicle_id: session.vehicle_id ? parseInt(session.vehicle_id, 10) : undefined,
          port_id: session.port_id ? parseInt(session.port_id, 10) : undefined,
          energy_used_kwh: parseFloat(session.energy_used_kwh || 0),
          total_cost: parseFloat(session.total_cost || 0),
          status: session.status || 'COMPLETED',
          payment_status: session.payment_status || 'PENDING',
          start_time: session.start_time || new Date().toISOString(),
          end_time: session.end_time || null,
          duration_minutes: session.duration_minutes ? parseInt(session.duration_minutes, 10) : undefined,
          current_battery_capacity_kw: session.current_battery_capacity_kw ? 
            parseFloat(session.current_battery_capacity_kw) : undefined
        };

        if (!processedSession.vehicle_id) {
          console.warn('Session missing vehicle_id:', {
            sessionId: processedSession.id,
            rawSession: session
          });
        }

        return processedSession;
      })
      .filter(session => session.id && session.vehicle_id && session.port_id);

    console.log('Validated sessions:', validatedSessions);
    return validatedSessions;

  } catch (error) {
    console.error("Error in getChargingSessionsInfo:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
};

/**
 * Rozpoczyna nową sesję ładowania
 */
export const startChargingSession = async (sessionData: ChargingSessionData): Promise<ChargingSession> => {
  try {
    const session = await auth();
    if (!session?.user?.apiToken) {
      throw new Error("No authentication token available");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    const payload = {
      vehicle_id: Number(sessionData.vehicle_id),
      port_id: Number(sessionData.port_id),
      duration_minutes: Number(sessionData.duration_minutes),
      energy_used_kwh: Number(sessionData.energy_used_kwh || 0),
      total_cost: Number(sessionData.total_cost), // Use the passed cost directly
      status: 'IN_PROGRESS'
    };
    
    console.log('Sending session request with payload:', payload);

    const response = await fetch(`${baseUrl}/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.apiToken}`
      },
      body: JSON.stringify(payload)
    });

    // Try to get response data with error handling
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      console.error('Failed to parse server response:', {
        status: response.status,
        statusText: response.statusText,
        text: await response.text()
      });
      throw new Error('Invalid server response format');
    }

    console.log('Raw server response:', responseData);

    if (!response.ok) {
      console.error('Server error response:', responseData);
      throw new Error(responseData.detail || 'Failed to start charging session');
    }

    // Try to get ID from various possible response formats
    let sessionId: number;
    const rawId = responseData.id ?? responseData.charging_session?.id ?? responseData.session?.id;

    if (rawId === undefined || rawId === null) {
      console.error('Response missing ID:', responseData);
      throw new Error('Server response missing session ID');
    }

    // Convert the raw ID to number with validation
    if (typeof rawId === 'number' && !isNaN(rawId) && rawId > 0) {
      sessionId = rawId;
    } else if (typeof rawId === 'string') {
      const parsed = parseInt(rawId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        sessionId = parsed;
      } else {
        throw new Error('Invalid session ID format');
      }
    } else {
      throw new Error('Invalid session ID type');
    }

    // Create formatted response with validated data
    const formattedResponse: ChargingSession = {
      id: sessionId,
      vehicle_id: Number(payload.vehicle_id),
      port_id: Number(payload.port_id),
      start_time: responseData.start_time || new Date().toISOString(),
      duration_minutes: Number(payload.duration_minutes),
      energy_used_kwh: Number(responseData.energy_used_kwh || 0),
      total_cost: Number(payload.total_cost), // Use the cost from payload
      status: 'IN_PROGRESS',
      payment_status: 'PENDING' // Default to PENDING
    };

    // Validate all required fields
    const requiredFields = ['id', 'vehicle_id', 'port_id', 'start_time'] as const;
    const missingFields = requiredFields.filter(field => !formattedResponse[field]);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', {
        missingFields,
        formattedResponse
      });
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('Successfully created charging session:', formattedResponse);
    return formattedResponse;

  } catch (error) {
    console.error('Error in startChargingSession:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      payload: sessionData
    });
    throw error instanceof Error ? error : new Error('Failed to start charging session');
  }
};

/**
 * Kończy aktywną sesję ładowania
 */
export const stopChargingSession = async (sessionData: ChargingSession): Promise<ChargingSession> => {
  try {
    const session = await auth();
    if (!session?.user?.apiToken) {
      throw new Error('No authentication token available');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Create the stop payload using sessionData's total_cost
    const stopPayload = {
      current_battery_capacity_kw: sessionData.current_battery_capacity_kw ?? 0,
      energy_used_kwh: Math.max(0, sessionData.energy_used_kwh || 0),
      total_cost: sessionData.total_cost, // Use the cost from sessionData
      end_time: new Date().toISOString(),
      status: 'COMPLETED' as const
    };

    const response = await fetch(`${baseUrl}/sessions/${sessionData.id}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.apiToken}`
      },
      body: JSON.stringify(stopPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to stop charging session');
    }

    const responseData = await response.json();

    return {
      ...sessionData,
      end_time: new Date().toISOString(),
      energy_used_kwh: Math.max(0, responseData.energy_used_kwh ?? sessionData.energy_used_kwh),
      total_cost: Math.max(0, responseData.total_cost ?? sessionData.total_cost),
      status: 'COMPLETED',
      payment_status: 'PENDING' // Default to PENDING
    };
  } catch (error) {
    console.error('Stop charging session failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionData
    });
    throw error;
  }
};

/**
 * Aktualizuje pojemność pojazdu i kończy sesję ładowania
 */
export const updateVehicleCapacityAndStopSession = async (
  sessionData: ChargingSession, 
  vehicleId: number, 
  newCapacity: number,
  energyUsed: number,
  finalCost: number
): Promise<{ session: ChargingSession; vehicle: Vehicle }> => {
  try {
    const session = await auth();
    if (!session?.user?.apiToken) {
      throw new Error('No authentication token available');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    // First update vehicle capacity
    const updatedVehicle = await updateVehicleCapacity(vehicleId, newCapacity);

    // Update the stop session part with explicit cost handling
    if (sessionData.status !== 'COMPLETED') {
      // Calculate actual energy used and cost
      const actualEnergyUsed = Math.max(0, energyUsed);
      const actualCost = Math.max(0, finalCost);

      const stopPayload = {
        current_battery_capacity_kw: newCapacity,
        energy_used_kwh: actualEnergyUsed,
        total_cost: actualCost,
        end_time: new Date().toISOString(),
        status: 'COMPLETED' as const
      };

      console.log('Stop payload:', stopPayload);

      const sessionResponse = await fetch(`${baseUrl}/sessions/${sessionData.id}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.apiToken}`
        },
        body: JSON.stringify(stopPayload)
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        console.error('Failed to stop session:', {
          error: errorData,
          payload: stopPayload
        });
        throw new Error(errorData.detail || 'Failed to stop charging session');
      }

      const stoppedSession = await sessionResponse.json();

      // Ensure the response has the correct cost and energy values
      const finalSession = {
        ...stoppedSession,
        energy_used_kwh: actualEnergyUsed,
        total_cost: actualCost,
        current_battery_capacity_kw: newCapacity,
        status: 'COMPLETED' as const,
        payment_status: 'PENDING'
      };

      console.log('Final session state:', finalSession);

      return {
        session: finalSession,
        vehicle: updatedVehicle
      };
    }

    // If session is already completed, just return current state
    return {
      session: sessionData,
      vehicle: updatedVehicle
    };
  } catch (error) {
    console.error('Failed to update capacity and stop session:', error);
    throw error instanceof Error ? error : new Error('Failed to update capacity and stop session');
  }
};

/**
 * Pobiera aktywną sesję ładowania
 */
export const getActiveChargingSession = async (): Promise<ChargingSession | null> => {
  try {
    const sessions = await getChargingSessionsInfo();
    if (!sessions) return null;
    
    return sessions.find(session => session.status === 'IN_PROGRESS') || null;
  } catch (error) {
    console.error("Error fetching active session:", error);
    return null;
  }
};

export async function stopCurrentChargingSession(
  sessionId: number,
  vehicleId: number,
  currentCapacity: number
): Promise<ChargingSession> {
  try {
    // Validate input parameters
    if (!sessionId || !vehicleId || currentCapacity === undefined) {
      throw new Error('Missing required parameters for stopping session');
    }

    // First fetch the current session data
    const session = await auth();
    if (!session?.user?.apiToken) {
      throw new Error('No authentication token available');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Get the existing session details first
    const currentSession = await fetch(`${baseUrl}/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${session.user.apiToken}`
      }
    });

    if (!currentSession.ok) {
      throw new Error('Failed to fetch current session');
    }

    const sessionDetails = await currentSession.json();

    // Create session data object with existing data
    const sessionData: ChargingSession = {
      id: sessionId,
      vehicle_id: vehicleId,
      port_id: sessionDetails.port_id,
      start_time: sessionDetails.start_time,
      end_time: new Date().toISOString(),
      energy_used_kwh: sessionDetails.energy_used_kwh || 0,
      total_cost: sessionDetails.total_cost,
      status: 'COMPLETED',
      payment_status: 'PENDING' // Default to PENDING
    };

    // Stop the charging session
    const stoppedSession = await stopChargingSession(sessionData);
    
    // Update port status back to 'wolny'
    if (stoppedSession?.port_id) {
      await updatePortStatus(stoppedSession.port_id, 'wolny');
    }

    // Update vehicle capacity
    await updateVehicleCapacity(vehicleId, currentCapacity);
    
    return stoppedSession;
  } catch (error) {
    console.error('Error in stopCurrentChargingSession:', error);
    throw error instanceof Error ? error : new Error('Failed to stop charging session');
  }
};

export const updateSessionState = async (sessionId: number, updatedData: SessionUpdate): Promise<ChargingSession> => {
  try {
    const session = await auth();
    if (!session?.user?.apiToken) {
      throw new Error('No authentication token available');
    }

    // Format the payload to match backend expectations
    const payload = {
      energy_used_kwh: Number(updatedData.energy_used_kwh),
      current_battery_capacity_kw: Number(updatedData.current_battery_level || 0),
      total_cost: Number(updatedData.total_cost || 0),
      update_battery: true,
      payment_status: updatedData.payment_status // Include payment status
    };

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/sessions/${sessionId}/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.apiToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update session state');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating session state:', error);
    throw error;
  }
};

// Add a new function to update payment status
/**
 * Aktualizuje status płatności dla sesji
 */
export const updatePaymentStatus = async (
  sessionId: number,
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED'
): Promise<ChargingSession> => {
  try {
    const session = await auth();
    if (!session?.user?.apiToken) {
      throw new Error('No authentication token available');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/sessions/${sessionId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.apiToken}`
      },
      body: JSON.stringify({ payment_status: paymentStatus })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error instanceof Error ? error : new Error('Failed to update payment status');
  }
};


