'use client'

import { useEffect, useState } from 'react'
import { getVehicles } from '@/data/vehicles'
import { VehiclesInfo } from '@/components/VehiclesInfo'
import { VehicleForm } from '@/components/VehicleForm'
import { Button } from '@/components/ui/button'

// Interfejs opisujący strukturę pojazdu
interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  battery_capacity_kwh: number;
  battery_condition: number;
  current_battery_capacity_kw: number;
  max_charging_powerkwh: number;
  created_at: string;
}

// Główny komponent zarządzania pojazdami
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Pobieranie danych pojazdów przy pierwszym renderowaniu
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleData = await getVehicles();
        if (vehicleData) {
          setVehicles(vehicleData);
        }
      } catch (error) {
        setError('Nie udało się załadować pojazdów. Spróbuj ponownie później.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  if (loading) {
    return <div>Ładowanie pojazdów...</div>
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
          <h1 className="text-2xl font-bold mb-6 text-[--text-color]">Zarządzanie pojazdami</h1>
          <Button
            onClick={() => setShowForm(prev => !prev)}
            className={`rounded-full bg-[var(--yellow)] h-12 w-12 flex items-center justify-center 
                       transform transition-transform duration-300 z-[100] ${showForm ? 'rotate-45' : ''}`}
            aria-label="Przełącz formularz pojazdu"
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
        </div>
        <VehiclesInfo vehicles={vehicles} label='Informacje o pojazdach' />
        {showForm && <VehicleForm />}
      </div>
    </>
  )
}