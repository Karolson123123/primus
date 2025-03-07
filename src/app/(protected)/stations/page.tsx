'use client';

import { useEffect, useState } from 'react'
import { getStationsInfo } from '@/data/stations'
import { Button } from '@/components/ui/button'
import { StationForm } from '@/components/StationForm'
import { StationsInfo } from '@/components/StationInfo'
import { AdminContent } from '@/components/auth/AdminContent'

// Interfejsy opisujące strukturę danych
interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  ports: Port[];
  created_at: string;
}

interface Port {
  id: number;
  number: number;
  power_kw: number;
  status: 'AVAILABLE' | 'IN_USE' | 'OFFLINE';
}

// Główny komponent zarządzania stacjami ładowania
export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Funkcja pobierająca dane stacji z API
  const fetchStations = async () => {
    try {
      const stationData = await getStationsInfo();
      if (stationData) {
        setStations(stationData);
      }
    } catch (error) {
      setError('Nie udało się załadować stacji. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  // Pobieranie danych przy pierwszym renderowaniu
  useEffect(() => {
    fetchStations();
  }, []);

  if (loading) {
    return <div className="text-[--text-color] text-center">Ładowanie stacji...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <>
      <style jsx global>{`
        *:not(.navbar):not(.navbar *) {
          border-color: var(--yellow) !important;
        }
      `}</style>
      <div className="container mx-auto py-6 max-lg:w-full max-lg:mt-20">
        <div className='navbar flex justify-between items-center w-[97%]'>
          <h1 className="text-2xl font-bold mb-6 text-[--text-color]">Zarządzanie stacjami</h1>
          <AdminContent>
            <Button
              onClick={() => setShowForm(prev => !prev)}
              className={`rounded-full bg-[var(--yellow)] h-12 w-12 flex items-center justify-center 
                         transform transition-transform duration-300 z-[100] ${showForm ? 'rotate-45' : ''}`}
              aria-label="Przełącz formularz stacji"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-12 h-12" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="black"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          </AdminContent>
        </div>
        <StationsInfo 
          label='Stacje ładowania:' 
          stations={stations} 
          isLoading={loading}
          adminControls={
            <AdminContent>
              <div className="admin-controls">
                {/* Panel kontrolny administratora */}
              </div>
            </AdminContent>
          }
        />
        {showForm && (
          <AdminContent>
            <StationForm />
          </AdminContent>
        )}
      </div>
    </>
  )
}