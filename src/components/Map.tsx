import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import { LatLngTuple } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useEffect, useState, useMemo } from 'react';
import { getStationsInfo, getStationsWithPorts } from '@/data/stations';
import useGeoLocation from '@/lib/geo-location';  

interface Port {
    id: string;
    power_kW: string;
    status: string;
}

interface Station {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    ports: Port[];
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

export default function Map() {
    const [stations, setStations] = useState<Station[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeMarker, setActiveMarker] = useState<number | null>(null);
    
    const refreshStations = async () => {
        setIsRefreshing(true);
        try {
            const data = await getStationsWithPorts();
            if (data) {
                setStations(data);
            }
        } catch (error) {
            console.error('Error refreshing stations:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const stationsData = await getStationsWithPorts();
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
                style={{ height: "870px", width: "100%", zIndex: "0" }}
            >
                <LocationUpdater position={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                        return (
                            <Marker 
                            
                                key={index} 
                                position={markerPosition}
                                icon={icon}
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
                    style={{ zIndex: 1000 , height: "95%" , width: "15%" }}
                >
                    <div 
                        className='relative text-center h-full w-full flex flex-col items-center justify-center bg-[var(--background)] rounded-lg shadow-lg text-white'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActiveMarker(null)}
                            className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-700 transition-colors"
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
                        
                        <h1 className='font-semibold text-4xl p-5'>{station.name}</h1>
                        <main className='w-[95%] h-[90%] flex justify-around items-center flex-col p-7'>
                            <section className='text-4xl flex items-center gap-4'>
                                <img src="/EV-charger.png" alt="EV charger port" className='w-20 h-20'/>
                                <div className="flex items-center gap-2">
                                    Ports {station.ports?.filter(port => port.status === 'available').length || 0}/{station.ports?.length || 0}
                                    <button 
                                        onClick={refreshStations}
                                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                                        disabled={isRefreshing}
                                    >
                                        <svg 
                                            className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </section>
                            <section className='flex flex-col gap-4'>
                                {station.ports && station.ports.length > 0 ? (
                                    station.ports.map((port, index) => (
                                        <div key={port.id} className='flex items-center gap-4 text-xl'>
                                            <div className={`w-3 h-3 rounded-full ${
                                                port.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                                            }`}></div>
                                            <span>Port {index + 1}: {port.power_kW}kW ({port.status})</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400">No ports available</div>
                                )}
                            </section>
                        </main>
                    </div>
                </div>
            ))}
        </div>
    );
}
