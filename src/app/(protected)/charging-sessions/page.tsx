'use client'

import { useEffect, useState } from 'react'
import { getChargingSessionsInfo } from '@/data/charging-session'
import { ChargingSessionInfo } from '@/components/ChargingSessionInfo';

// Interfejs opisujący strukturę sesji ładowania
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
  // Stan komponentu
  const [sessions, setSessions] = useState<ChargingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pobieranie danych sesji ładowania przy montowaniu komponentu
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsData = await getChargingSessionsInfo();
        if (sessionsData) {
          setSessions(sessionsData);
        }
      } catch  {
        setError('Nie udało się załadować sesji. Spróbuj ponownie później.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) {
    return <div>Ładowanie sesji...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="container mx-auto py-6 max-lg:w-full max-lg:mt-20">
      <h1 className="text-2xl font-bold mb-6 text-[--text-color]">Historia sesji ładowania</h1>
      <ChargingSessionInfo sessions={sessions} label='Informacje o sesjach ładowania' />
    </div>
  )
}