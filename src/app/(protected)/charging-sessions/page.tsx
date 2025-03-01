'use client'

import { useEffect, useState } from 'react'
import { getChargingSessionsInfo } from '@/data/charging-session'
import { ChargingSessionInfo } from '@/components/ChargingSessionInfo';

interface ChargingSession {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    vehicle_id: number;
    start_time: string;
    end_time: string | null;
    energy_used_kwh: number;
    total_cost: number;
    status: string;
}

export default function ChargingSessionPage() {
  const [sessions, setSessions] = useState<ChargingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsData = await getChargingSessionsInfo();
        if (sessionsData) {
          setSessions(sessionsData);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) {
    return <div>Loading sessions...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Charging Sessions</h1>
      <ChargingSessionInfo sessions={sessions} label='Charging Session Information' />
    </div>
  )
}