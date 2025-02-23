'use client'

import { useEffect, useState } from 'react'
import { getVehicles } from '@/data/vehicles'
import { VehiclesInfo } from '@/components/VehiclesInfo';
import { VehicleForm } from '@/components/VehicleForm';

interface Vehicle {
    id: number;
    license_plate: string;
    brand: string;
    battery_capacity_kWh: number;
    battery_condition: number;
    max_charging_powerkWh: number;
    created_at: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Vehicle Management</h1>
      <VehiclesInfo vehicles={vehicles} label='Vehicle Information' />
      <VehicleForm/>
    </div>

  )
}