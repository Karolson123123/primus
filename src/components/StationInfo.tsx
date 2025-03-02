"use client"

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getStationsInfo, deleteStation, updateStation } from "@/data/stations";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getPortsInfo, deletePort, updatePort } from "@/data/ports";
import { PortForm } from './PortForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AdminContent } from "./auth/AdminContent";
import { UserContent } from "./auth/UserContent";

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

// Update the Port interface
interface Port {
  id: number;
  number: number;
  power_kw: number;
  status: 'wolny' | 'zajety' | 'nieczynny';  // Changed from 'AVAILABLE' | 'IN_USE' | 'OFFLINE'
  station_id: Station[];
}

interface StationInfoProps {
    stations?: Station[];
    label: string;
    isLoading?: boolean;
}

const StationCard = ({ station }: { station: Station }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [showPortForm, setShowPortForm] = useState(false);
  const [showEditStation, setShowEditStation] = useState(false);
  const [showEditPort, setShowEditPort] = useState<number | null>(null);
  const [editStationData, setEditStationData] = useState(station);
  const [editPortData, setEditPortData] = useState<Port | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const portsData = await getPortsInfo();
        // Filter ports for this specific station
        const stationPorts = portsData.filter(port => port.station_id === station.id);
        setPorts(stationPorts);
      } catch (error) {
        console.error('Error fetching ports:', error);
      }
    };
    fetchPorts();
  }, [station.id]);

  const refreshPorts = async () => {
    try {
      const portsData = await getPortsInfo();
      const stationPorts = portsData.filter(port => port.station_id === station.id);
      setPorts(stationPorts);
    } catch (error) {
      console.error('Error refreshing ports:', error);
    }
  };

  const toggleDetails = () => setShowDetails((prev) => !prev);

 

  const handleDeleteStation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        await deleteStation(station.id);
        // Refresh parent component
        window.location.reload();
      } catch (error) {
        console.error('Error deleting station:', error);
      }
    }
  };

  const handleDeletePort = async (e: React.MouseEvent, portId: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this port?')) {
      try {
        await deletePort(portId);
        refreshPorts();
      } catch (error) {
        console.error('Error deleting port:', error);
      }
    }
  };

  const handleUpdateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Station update attempt:', {
      stationId: station.id,
      updateData: editStationData
    });
    try {
        await updateStation(station.id, editStationData);
        setShowEditStation(false);
        window.location.reload();
    } catch (error) {
        console.error('Error updating station:', error);
    }
  };

  const handleUpdatePort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPortData) return;
    
    try {
        await updatePort(editPortData.id, {
            power_kw: editPortData.power_kw,
            status: editPortData.status
        });
        await refreshPorts();
        setShowEditPort(null);
    } catch (error) {
        console.error('Error updating port:', error);
        alert('Failed to update port. Please try again.');
    }
};

  const handleChargingStart = async (e: React.MouseEvent, selectedPort: Port) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (!selectedPort) {
      console.error('No port selected');
      return;
    }
  
    try {
      // Navigate to charging page with port info
      const searchParams = new URLSearchParams({
        port: selectedPort.id.toString(),
        power: selectedPort.power_kw.toString(),
        portNumber: selectedPort.number?.toString() || '1',
        station: station.id.toString(),
        name: station.name
      });
  
      window.location.href = `/charging?${searchParams.toString()}`;
    } catch (error) {
      console.error('Error starting charging session:', error);
    }
  };

  return (
    <div
      onClick={toggleDetails}
      className="cursor-pointer rounded-lg border p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src={'/basic-marker.png'}
            alt="Charging Station"
            width={48}
            height={48}
          />
          <div>
            <p className="text-xl font-bold text-white">
              {station.name}
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                ports.some(port => port.status === 'wolny') ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-400">
                {ports.filter(port => port.status === 'wolny').length}/{ports.length} ports available
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminContent>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditStation(true);
              }}
              className="text-gray-400 hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteStation}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </AdminContent>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-6 h-6 transform transition-transform duration-150 ${
            showDetails ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="white"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${
        showDetails ? "max-h-[500px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"
      }`}>
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Charging Ports</h3>
            <AdminContent>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPortForm(true);
                }}
                className="bg-[var(--yellow)] hover:bg-yellow-600 text-black px-4 py-2 rounded-lg"
              >
                Add Port
              </button>
            </AdminContent>
          </div>
          <div className="grid grid-cols-2 gap-4 overflow-y-auto">
            {ports.map((port, index) => (
              <div 
                key={port.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPort(port.status === 'wolny' ? port : null);
                }}
                className={`p-4 rounded-lg cursor-pointer transition-all
                  ${port.status !== 'wolny' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
                  ${selectedPort?.id === port.id ? 'border-2 border-[var(--yellow)] bg-gray-800' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      port.status === 'wolny' ? 'bg-green-500' : 
                      port.status === 'nieczynny' ? 'bg-red-500' : 
                      'bg-[var(--yellow)]'
                    }`} />
                    <div>
                      <div>Port {index + 1}</div>
                      <div className="text-sm text-gray-400">{port.power_kw}kW</div>
                      <div className="text-sm text-gray-400">Status: {port.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminContent>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditPort(port.id);
                          setEditPortData(port);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeletePort(e, port.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </AdminContent>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {showPortForm && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault(); // Add this to prevent any default behavior
              }}
              className="relative z-50" // Add z-index to ensure form stays on top
            >
              <PortForm
                stationId={station.id}
                onSuccess={() => {
                  setShowPortForm(false);
                  refreshPorts();
                }}
                onClose={() => setShowPortForm(false)}
              />
            </div>
          )}
          
          {showDetails && (
            <UserContent>
              <button
                onClick={(e) => handleChargingStart(e, selectedPort!)}
                className={`w-full py-4 transition-colors rounded-xl text-xl font-semibold ${
                  selectedPort 
                    ? 'bg-[var(--yellow)] hover:bg-yellow-600' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!selectedPort}
              >
                {!ports.some(port => port.status === 'wolny')
                  ? 'No ports available'
                  : !selectedPort
                  ? 'Select port'
                  : 'Start charging'
                }
              </button>
            </UserContent>
          )}
        </div>
      </div>

      {/* Edit Station Dialog */}
      <Dialog open={showEditStation} onOpenChange={setShowEditStation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Station</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input
                value={editStationData.name}
                onChange={(e) => setEditStationData({
                  ...editStationData,
                  name: e.target.value
                })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="any"
                value={editStationData.latitude}
                onChange={(e) => setEditStationData({
                  ...editStationData,
                  latitude: parseFloat(e.target.value)
                })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="any"
                value={editStationData.longitude}
                onChange={(e) => setEditStationData({
                  ...editStationData,
                  longitude: parseFloat(e.target.value)
                })}
                required
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Port Dialog */}
      <Dialog open={showEditPort !== null} onOpenChange={() => setShowEditPort(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Port</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePort} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Power (kW)</label>
              <Input
                type="number"
                step="0.1"
                value={editPortData?.power_kw}
                onChange={(e) => setEditPortData(prev => 
                  prev ? {...prev, power_kw: parseFloat(e.target.value)} : null
                )}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <Select
                value={editPortData?.status}
                onValueChange={(value) => setEditPortData(prev => 
                  prev ? {...prev, status: value as 'wolny' | 'zajety' | 'nieczynny'} : null
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wolny">Wolny</SelectItem>
                  <SelectItem value="zajety">Zajęty</SelectItem>
                  <SelectItem value="nieczynny">Nieczynny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const StationsInfo = ({
    stations = [],
    label,
    isLoading = false,
}: StationInfoProps) => {
    const [displayCount, setDisplayCount] = useState(5); // Start with 5 stations
    
    // Move this inside the component
    const handleLoadMore = useCallback(() => {
        setDisplayCount(prevCount => {
            const nextCount = prevCount + 5;
            return nextCount > stations.length ? stations.length : nextCount;
        });
    }, [stations.length]);

    if (isLoading) {
        return (
            <Card className="bg-[var(--cardblack)] w-[90%]">
                <CardHeader>
                    <p className="text-2xl font-semibold text-center text-white">
                        {label}
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-700 rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Get the stations to display based on current displayCount
    const displayedStations = stations.slice(0, displayCount);
    const remainingCount = stations.length - displayCount;
    const hasMore = remainingCount > 0;

    return (
        <Card className="bg-[var(--cardblack)] w-[90%]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center text-white">
                    {label}
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {displayedStations.map((station) => (
                        <StationCard key={station.id} station={station} />
                    ))}
                </div>
                
                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-[var(--yellow)] hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span>Loading...</span>
                            ) : (
                                <span>Load More ({remainingCount} remaining)</span>
                            )}
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const StationsPage = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                setIsLoading(true);
                const data = await getStationsInfo();
                if (Array.isArray(data)) {
                    setStations(data);
                } else {
                    setError('Invalid data format received');
                }
            } catch (error) {
                console.error("Error fetching stations:", error);
                setError('Failed to load stations. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStations();
    }, []);

    if (isLoading) {
        return <div className="text-white">Loading stations...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="w-full flex justify-center items-center min-h-screen">
            {stations.length === 0 ? (
                <div className="text-white">No stations found</div>
            ) : (
                <StationsInfo 
                    label="Charging Stations"
                    stations={stations}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default StationsPage;