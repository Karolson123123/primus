'use server'

import { auth } from '@/auth';
import { startChargingSession, stopChargingSession } from '@/data/charging-session';
import { updateVehicleCapacity } from '@/data/vehicles';

async function updatePortStatus(portId: number, status: 'wolny' | 'zajety') {
  const session = await auth();
  if (!session?.user?.apiToken) {
    throw new Error('No authentication token available');
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
    throw new Error(errorData.detail || 'Failed to update port status');
  }

  return response.json();
}

interface ChargingSessionData {
    vehicle_id: number;
    port_id: number;
    start_time: string;  // ISO timestamp string
    duration_minutes: number;
    end_time?: string;   // ISO timestamp string
    energy_used_kwh: number;  // Correct lowercase naming
    total_cost: number;
    status: 'IN_PROGRESS' | 'COMPLETED';
  }

export async function startNewChargingSession(sessionData: ChargingSessionData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  
  try {
    // Update port status to 'zajety'
    await updatePortStatus(sessionData.port_id, 'zajety');
    
    // Start the charging session
    const response = await startChargingSession({
      ...sessionData,
      user_id: session.user.id
    });
    
    return response;
  } catch (error) {
    // If anything fails, ensure port is set back to 'wolny'
    try {
      await updatePortStatus(sessionData.port_id, 'wolny');
    } catch (resetError) {
      console.error('Failed to reset port status:', resetError);
    }
    throw error instanceof Error ? error : new Error('Failed to start charging session');
  }
}

export async function stopCurrentChargingSession(
  sessionId: number,
  vehicleId: number,
  currentCapacity: number,
  energyUsed: number,
  finalCost: number
) {
  try {
    // Create session data object with the values we have
    const sessionData: ChargingSession = {
      id: sessionId,
      vehicle_id: vehicleId,
      port_id: null, // Will be filled from existing session
      start_time: null, // Will be filled from existing session
      end_time: new Date().toISOString(),
      energy_used_kwh: energyUsed,
      total_cost: finalCost,
      status: 'COMPLETED'
    };

    // Stop the charging session with full details
    const session = await stopChargingSession(sessionData);
    if (!session) {
      throw new Error('Failed to stop charging session');
    }

    // Update vehicle capacity
    await updateVehicleCapacity(vehicleId, currentCapacity);
    
    // Update port status back to 'wolny'
    if (session.port_id) {
      await updatePortStatus(session.port_id, 'wolny');
    }

    return session;
  } catch (error) {
    console.error('Stop charging error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to stop charging session');
  }
}

export async function updateSessionState(sessionId: number, updatedData: {
  energy_used_kwh: number;
  current_battery_level: number;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Authentication required');
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
      throw new Error('Failed to update session state');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating session state:', error);
    throw error;
  }
}