'use client'

import { useEffect, useState } from 'react'
import { getStationsInfo } from '@/data/stations'
import { Button } from '@/components/ui/button'
import { StationForm } from '@/components/StationForm'
import { StationsInfo } from '@/components/StationInfo'
import { AdminContent } from '@/components/auth/AdminContent'

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



export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchStations = async () => {
    try {
      const stationData = await getStationsInfo();
      if (stationData) {
        setStations(stationData);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      setError('Failed to load stations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  if (loading) {
    return <div className="text-white text-center">Loading stations...</div>
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
      <div className="container mx-auto py-6">
        <div className='navbar flex justify-between items-center w-[97%]'>
          <h1 className="text-2xl font-bold mb-6 text-white">Stations Management</h1>
          <AdminContent>
            <Button
              onClick={() => setShowForm(prev => !prev)}
              className={`rounded-full bg-[var(--yellow)] h-12 w-12 flex items-center justify-center transform transition-transform duration-300 z-[10000] ${showForm ? 'rotate-45' : ''}`}
              aria-label="Toggle Station Form"
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
          label='Stations:' 
          stations={stations} 
          isLoading={loading}
          adminControls={
            <AdminContent>
              {/* Wrap this around the controls in StationsInfo */}
              <div className="admin-controls">
                {/* Your edit/delete/add port buttons will be here */}
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