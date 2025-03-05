"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getStationsInfo, deleteStation, updateStation } from "@/data/stations";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getPortsInfo, deletePort, updatePort } from "@/data/ports";
import { PortForm } from './PortForm';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AdminContent } from "./auth/AdminContent";
import { UserContent } from "./auth/UserContent";
import { Search } from "react-feather";

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

// Add these types after your existing interfaces
type FilterOption = 'all' | 'active' | 'inactive' | 'maintenance';
type SortOption = 'alphabetical' | 'availability' | 'ports';

const StationCard = ({ station }: { station: Station }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [showPortForm, setShowPortForm] = useState(false);
  const [showEditStation, setShowEditStation] = useState(false);
  const [showEditPort, setShowEditPort] = useState<number | null>(null);
  const [editStationData, setEditStationData] = useState(station);
  const [editPortData, setEditPortData] = useState<Port | null>(null);


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
      className="cursor-pointer rounded-lg border border-[var(--yellow)] p-4 sm:p-6 space-y-2"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <Image
            src={'/basic-marker.png'}
            alt="Charging Station"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
          <div className="flex-1">
            <p className="text-lg sm:text-xl font-bold text-white">
              {station.name}
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                ports.some(port => port.status === 'wolny') ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs sm:text-sm text-gray-400">
                {ports.filter(port => port.status === 'wolny').length}/{ports.length} ports available
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <AdminContent>
            <button
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEditStation(true);
              }}
              className="text-sm sm:text-base text-gray-400 hover:text-white px-2 py-1 
                cursor-pointer z-10"
            >
              Edit
            </button>
            <button
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteStation(e);
              }}
              className="text-sm sm:text-base text-red-500 hover:text-red-600 px-2 py-1 
                cursor-pointer z-10"
            >
              Delete
            </button>
          </AdminContent>
        </div>
      </div>

      {/* Ports section */}
      <div className={`transition-all duration-300 ease-in-out ${
        showDetails ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      }`}>
        <div className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-white">Charging Ports</h3>
            <AdminContent>
              <button
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPortForm(true);
                }}
                className="text-xs sm:text-sm text-gray-400 hover:text-white px-2 py-1 
                  cursor-pointer z-10"
              >
                Add Port
              </button>
            </AdminContent>
          </div>

          {/* Ports grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {ports.map((port, index) => (
              <div 
                key={port.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPort(port.status === 'wolny' ? port : null);
                }}
                className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all
                  ${port.status !== 'wolny' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
                  ${selectedPort?.id === port.id ? 'border-2 border-[var(--yellow)] bg-gray-800' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      port.status === 'wolny' ? 'bg-green-500' : 
                      port.status === 'nieczynny' ? 'bg-red-500' : 
                      'bg-[var(--yellow)]'
                    }`} />
                    <div>
                      <div className="text-sm sm:text-base">Port {index + 1}</div>
                      <div className="text-xs sm:text-sm text-gray-400">{port.power_kw}kW</div>
                      <div className="text-xs sm:text-sm text-gray-400">Status: {port.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminContent>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowEditPort(port.id);
                          setEditPortData(port);
                        }}
                        className="text-xs sm:text-sm text-gray-400 hover:text-white px-2 py-1 
                          cursor-pointer z-10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeletePort(e, port.id);
                        }}
                        className="text-xs sm:text-sm text-red-500 hover:text-red-600 px-2 py-1 
                          cursor-pointer z-10"
                      >
                        Delete
                      </button>
                    </AdminContent>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Start charging button */}
          {showDetails && (
            <UserContent>
              <button
                onClick={(e) => handleChargingStart(e, selectedPort!)}
                className={`w-full py-3 sm:py-4 mt-4 transition-colors rounded-xl 
                  text-base sm:text-xl font-semibold ${
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
      {/* Edit Station Modal */}
      {showEditStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--cardblack)] p-6 rounded-lg border border-[var(--yellow)] w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Edit Station</h2>
              <button 
                onClick={() => setShowEditStation(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateStation} className="space-y-4">
              <div>
                <label className="text-white block mb-2">Name</label>
                <Input 
                  value={editStationData.name}
                  onChange={(e) => setEditStationData({...editStationData, name: e.target.value})}
                  className="bg-gray-700 text-white w-full"
                />
              </div>
              <div>
                <label className="text-white block mb-2">Status</label>
                <Select 
                  value={editStationData.status}
                  onValueChange={(value) => setEditStationData({
                    ...editStationData, 
                    status: value as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Port Modal */}
      {showEditPort !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--cardblack)] p-6 rounded-lg border border-[var(--yellow)] w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Edit Port</h2>
              <button 
                onClick={() => setShowEditPort(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdatePort} className="space-y-4">
              <div>
                <label className="text-white block mb-2">Power (kW)</label>
                <Input 
                  type="number"
                  value={editPortData?.power_kw || ''}
                  onChange={(e) => setEditPortData(prev => 
                    prev ? {...prev, power_kw: Number(e.target.value)} : null
                  )}
                  className="bg-gray-700 text-white w-full"
                />
              </div>
              <div>
                <label className="text-white block mb-2">Status</label>
                <Select 
                  value={editPortData?.status}
                  onValueChange={(value) => setEditPortData(prev => 
                    prev ? {...prev, status: value as 'wolny' | 'zajety' | 'nieczynny'} : null
                  )}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wolny">Wolny</SelectItem>
                    <SelectItem value="zajety">Zajęty</SelectItem>
                    <SelectItem value="nieczynny">Nieczynny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </div>
        </div>
      )}

      {/* Port Form Modal */}
      {showPortForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    </div>
  );
};

// Update the StationsInfo component
export const StationsInfo = ({
    stations = [],
    label,
    isLoading = false,
}: StationInfoProps) => {
    const [displayCount, setDisplayCount] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [sortBy, setSortBy] = useState<SortOption>('alphabetical');

    // Add filter and sort function
    const filterAndSortStations = useCallback((stationsToProcess: Station[]) => {
        let filtered = stationsToProcess.filter(station => {
            // Search filter
            const matchesSearch = searchQuery === '' || 
                station.name.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter with null check and type guard
            const matchesFilter = filterBy === 'all' ? true :
                station.status?.toLowerCase() === filterBy || 
                (station.status && station.status.toLowerCase() === filterBy);

            return matchesSearch && matchesFilter;
        });

        // Sort stations
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'alphabetical':
                    return a.name.localeCompare(b.name);
                case 'availability':
                    // Sort by status with null checks
                    if (!a.status && !b.status) return 0;
                    if (!a.status) return 1;
                    if (!b.status) return -1;
                    return a.status === 'ACTIVE' ? -1 : b.status === 'ACTIVE' ? 1 : 0;
                default:
                    return 0;
            }
        });
    }, [searchQuery, filterBy, sortBy]);

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

    // Update the return statement to include search and filters
    return (
        <Card className="bg-[var(--cardblack)] w-full border border-[var(--yellow)]">
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <p className="text-2xl font-semibold text-center text-white">
                        {label}
                    </p>
                    
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Box */}
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                placeholder="Search stations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-700 text-white border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Status:</span>
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                                className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-[var(--yellow)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                            >
                                <option value="all">All Stations</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-[var(--yellow)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                            >
                                <option value="alphabetical">Alphabetical</option>
                                <option value="availability">Availability</option>
                            </select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {filterAndSortStations(stations)
                        .slice(0, displayCount)
                        .map((station) => (
                            <StationCard key={station.id} station={station} />
                        ))}
                </div>
                
                {filterAndSortStations(stations).length > displayCount && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-[var(--yellow)] hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span>Loading...</span>
                            ) : (
                                <span>Load More ({filterAndSortStations(stations).length - displayCount} remaining)</span>
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