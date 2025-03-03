import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import * as L from 'leaflet';
import { LatLngTuple } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getStationsInfo } from '@/data/stations';
import useGeoLocation from '@/lib/geo-location';  
import { getPortsInfo } from '@/data/ports';
import SearchBox from './SearchBox';
import { useRouter } from 'next/navigation';

interface Station {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
}


interface Port {
    id: number;
    status: string;
    created_at: string;
    power_kw: number;
    station_id: Station['id'];
}

interface MapProps {
  height?: string;
  width?: string;
  selectedStationId?: string;
  onStationAndPortSelect?: (stationData: any, portData: any) => void;
}

const icon = L.icon({
  iconUrl: "/basic-marker.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [38, 38],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowSize: [41, 41]
});

const locationIcon = L.icon({
    iconUrl: "/location-marker.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [48, 48],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
    shadowSize: [41, 41]
});

const searchIcon = L.icon({
    iconUrl: "/search-marker.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [42, 42],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
    shadowSize: [41, 41]
});

// Add this with your other icon definitions
const selectedIcon = L.icon({
  iconUrl: "/selected-marker.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [48, 48], // Slightly larger than regular markers
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowSize: [41, 41]
});

const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    let size = 40;
    let color = 'var(--yellow)'; 

    if (count > 50) {
        color = '#FF0000'; 
        size = 60;
    } else if (count > 20) {
        color = '#FFA500'; 
        size = 50;
    }

    return L.divIcon({
        html: `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            border: 3px solid #fff;
            box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        ">${count}</div>`,
        className: 'custom-marker-cluster',
        iconSize: L.point(size, size, true),
    });
};

function LocationUpdater({ position }: { position: LatLngTuple }) {
    const map = useMap();
    
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [map, position]);

    return null;
}

// Add at the top of the file or near other interfaces
interface SearchBoxWithMapProps {
    stations: Station[];
    width: string;
    setActiveMarker: (index: number | null) => void;
}

function SearchBoxWithMap({ stations, width, setActiveMarker }: SearchBoxWithMapProps) {
    const map = useMap();
    const [searchMarker, setSearchMarker] = useState<L.Marker | null>(null);

    const handleStationSelect = (station: Station) => {
        // Remove existing search marker if any
        if (searchMarker) {
            searchMarker.remove();
        }

        // Create and add new marker
        const marker = L.marker([station.latitude, station.longitude], { icon: searchIcon })
            .addTo(map);
        setSearchMarker(marker);

        // Pan to the location
        map.panTo([station.latitude, station.longitude]);

        // Find the station index and set it as active
        const stationIndex = stations.findIndex(s => s.id === station.id);
        if (stationIndex !== -1) {
            setActiveMarker(stationIndex);
        }
    };

    return (
        <SearchBox 
            stations={stations} 
            width={width}
            onStationSelect={handleStationSelect}
        />
    );
}

// First, add these bounds constants at the top of your file, after the imports
// const MAX_BOUNDS: L.LatLngBoundsLiteral = [
//     [48.9, 14.12], // Southwest coordinates
//     [54.9, 24.15]  // Northeast coordinates
// ];

const MIN_ZOOM = 2;
const MAX_ZOOM = 18;

// Add these constants at the top of your file
const WORLD_BOUNDS: L.LatLngBoundsLiteral = [
    [-90, -180], // Southwest coordinates
    [90, 180]    // Northeast coordinates
];

export default function Map({ height = "800px", width = "100%", selectedStationId }: MapProps) {
    const router = useRouter();
    const [stations, setStations] = useState<Station[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [activeMarker, setActiveMarker] = useState<number | null>(null);
    const [selectedPort, setSelectedPort] = useState<Port | null>(null);
    const chargingButtonRef = useRef<HTMLButtonElement>(null);

    // existing code for fetching ports and stations
    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const portsData = await getPortsInfo();
                if (portsData === null) {
                    console.error('Failed to fetch ports data');
                    return;
                }
                console.log('Ports data received:', portsData.length);
                setPorts(portsData);
            } catch (error) {
                console.error('Error in ports fetch:', error);
            }
        };
        fetchPorts();
    }, []);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const stationsData = await getStationsInfo();
                console.log(stationsData);
                if (stationsData) {
                    setStations(stationsData);
                }
            } catch (error) {
                console.error('Error fetching stations:', error);
            }
        };
        fetchStations();
    }, []);


    const location = useGeoLocation();
    

    const center: LatLngTuple = useMemo(() => {
        if (location.loaded && !location.error && location.coordinates) {
            return [location.coordinates.lat, location.coordinates.lng];
        }
        return [50.06143, 19.93658];
    }, [location]);



    return (
        <div className="relative">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height, width, zIndex: "0" }}
                maxZoom={MAX_ZOOM}
                minZoom={MIN_ZOOM}
                doubleClickZoom={true}
                maxBounds={WORLD_BOUNDS}
                maxBoundsViscosity={1.0}
                worldCopyJump={true}
            >
                <LocationUpdater position={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SearchBoxWithMap 
                    stations={stations} 
                    width="400px"
                    setActiveMarker={setActiveMarker}
                />
                {location.loaded && !location.error && location.coordinates && (
                    <Marker 
                        icon={locationIcon} 
                        position={[location.coordinates.lat, location.coordinates.lng]}
                    >
                        <Popup 
                            offset={[10,-20]} 
                            keepInView={true} 
                            closeButton={false}
                        >
                            <div className='bg-[var(--background)] text-white h-10 w-40 flex items-center justify-center rounded-lg text-xl'>
                                Twoja lokalizacja
                            </div>
                        </Popup>
                    </Marker>
                )}

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={60}
                    animate={true}
                    iconCreateFunction={createClusterCustomIcon}
                    
                >
                    {stations.map((station, index) => {
                        const markerPosition: LatLngTuple = [station.latitude, station.longitude];
                        const isSelected = station.id.toString() === selectedStationId;
                        
                        return (
                            <Marker 
                                key={index} 
                                position={markerPosition}
                                icon={isSelected ? selectedIcon : icon}
                                eventHandlers={{
                                    click: () => {
                                        setActiveMarker(activeMarker === index ? null : index);
                                    }
                                }}
                            >
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
            
            {stations.map((station, index) => (
                <div 
                    key={`popup-${index}`}
                    className={`absolute top-[50%] right-4 transform -translate-y-1/2 ${
                        activeMarker === index ? 'block' : 'hidden'
                    }`}
                    style={{ zIndex: 1000 , height: "95%" , width: "300px" }}
                >
                        <div 
                        className='relative text-center h-full w-full flex flex-col items-center justify-start bg-[var(--background)] rounded-lg shadow-lg text-white'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                setActiveMarker(null);
                                setSelectedPort(null); // Reset port selection when closing
                            }}
                            className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-700 transition-colors z-[3]"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>   
                        </button>    
                        <main className='w-[95%] h-[90%] flex gap-4 items-center flex-col p-6 text-4xl z-[2] overflow-y-auto mt-3'>
                            <div className='bg-[var(--cardblack)] rounded-3xl w-full'>
                                {/* Updated station name to include the city name if available */}
                                <h1 className='font-semibold text-4xl p-7'>
                                    {station.name}
                                </h1>
                            </div>
                            <section className='bg-[var(--cardblack)]  text-2xl flex flex-col items-center gap-4 h-fit w-full justify-center p-7 rounded-3xl' onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle('hidden')} >
                                Dostępne porty ładowania:
                            <div className='flex items-center gap-4 text-4xl'>
                                <img src="/EV-charger.png" alt="EV charger port" className='w-20 h-20'/>
                                <div className="flex items-center gap-1 text-4xl">  
                                                                      
                                         {ports.filter(port => port.station_id === station. id && port.status === 'wolny').length}/{ports.filter(port => port.station_id === station. id).length}                                 
                                </div>
                            </div>    
                                    
                            </section>
                            <section className='flex flex-col gap-4 animate-display-from-top z-[1] bg-[var(--cardblack)] rounded-3xl p-7'>
    <h3 className="text-2xl mb-2">Select Charging Port:</h3>
    {ports.filter(port => port.station_id === station.id).map((port, index) => (
        <div 
            key={port.id} 
            onClick={() => {
                setSelectedPort(port.status === 'wolny' ? port : null);
                // Add smooth scrolling to the charging button
                setTimeout(() => {
                    chargingButtonRef.current?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }}
            className={`flex items-center gap-4 text-xl p-4 rounded-lg cursor-pointer transition-all
                ${port.status !== 'wolny' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
                ${selectedPort?.id === port.id ? 'border-2 border-[var(--yellow)] bg-gray-800' : ''}
            `}
        >
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
    ))}
</section>

                            {/* Add the new charging button section */}
                            <section className='bg-[var(--cardblack)] rounded-3xl p-7 w-full'>
    <button
        ref={chargingButtonRef}
        onClick={() => {
            if (selectedPort) {
                // Get all ports for this station
                const stationPorts = ports.filter(p => p.station_id === station.id);
                // Find the port number (1-based index)
                const portNumber = stationPorts.findIndex(p => p.id === selectedPort.id) + 1;

                const url = `/charging?` + new URLSearchParams({
                    station: station.id.toString(),
                    name: station.name,
                    port: selectedPort.id.toString(),
                    power: selectedPort.power_kw.toString(),
                    portNumber: portNumber.toString()
                }).toString();

                router.push(url);
                // Close the map modal after selection
                setActiveMarker(null);
            }
        }}
        className={`w-full py-4 transition-colors rounded-xl text-2xl font-semibold ${
            selectedPort 
                ? 'bg-[var(--yellow)] hover:bg-yellow-600' 
                : 'bg-gray-600 cursor-not-allowed'
        }`}
        disabled={!selectedPort}
    >
        {!ports.some(port => port.station_id === station.id && port.status === 'wolny')
            ? 'Brak wolnych portów'
            : !selectedPort
            ? 'Wybierz port'
            : 'Rozpocznij ładowanie'
        }
    </button>
</section>

                        </main>
                    </div>
                </div>
            ))}
        </div>
    );
}
