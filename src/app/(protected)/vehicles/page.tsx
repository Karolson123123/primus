'use client'

import { useEffect, useState } from 'react'
import { getVehicles } from '@/data/vehicles'
import { VehiclesInfo } from '@/components/VehiclesInfo'
import { VehicleForm } from '@/components/VehicleForm'
import { Button } from '@/components/ui/button'

interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  battery_capacity_kwh: number;
  battery_condition: number;
  current_battery_capacity_kw: number; // Add this field
  max_charging_powerkwh: number;
  created_at: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleData = await getVehicles();
        if (vehicleData) {
          setVehicles(vehicleData);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  if (loading) {
    return <div>Loading vehicles...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <>
      <style jsx global>{`
        /* Apply yellow border for all elements except those in the navbar */
        *:not(.navbar):not(.navbar *) {
          border-color: var(--yellow) !important;
        }
      `}</style>
      <div className="container mx-auto py-6">
        <div className='navbar flex justify-between items-center w-[97%]'>
          <h1 className="text-2xl font-bold mb-6">Vehicle Management</h1>
          <Button
            onClick={() => setShowForm(prev => !prev)}
            className={`rounded-full bg-[var(--yellow)] h-12 w-12 flex items-center justify-center transform transition-transform duration-300 z-[10000] ${showForm ? 'rotate-45' : ''}`}
            aria-label="Toggle Vehicle Form"
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
        <VehiclesInfo vehicles={vehicles} label='Vehicle Information' />
        {showForm && <VehicleForm />}
      </div>
    </>
  )
}