import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import { LatLngTuple } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useEffect, useState, useMemo } from 'react';
import { getStationsInfo } from '@/data/stations';
import useGeoLocation from '@/lib/geo-location';  
import { getPortsInfo } from '@/data/ports';
import SearchBox from './SearchBox';

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
    power_kW: number;
    station_id: Station['id'];
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
    const [ports, setPorts] = useState<Port[]>([]);
    const [cityNames, setCityNames] = useState<Record<number, string>>({}); // new state for city names
    const [activeMarker, setActiveMarker] = useState<number | null>(null);

    // existing code for fetching ports and stations
    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const portsData = await getPortsInfo();
                console.log(portsData);
                if (portsData) {
                    setPorts(portsData);
                }
            } catch (error) {
                console.error('Error fetching stations:', error);
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

    // New effect: for each station fetch the city name from reverse geocoding
    useEffect(() => {
        if (stations.length > 0) {
            const fetchCities = async () => {
                const newMapping: Record<number, string> = {};
                await Promise.all(
                    stations.map(async (station) => {
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${station.latitude}&lon=${station.longitude}`);
                            const data = await response.json();
                            // Try different address properties in case the city field is missing.
                            const city = data.address.city || data.address.town || data.address.village || '';
                            newMapping[station.id] = city;
                        } catch (error) {
                            console.error('Error fetching city for station:', station.id, error);
                            newMapping[station.id] = '';
                        }
                    })
                );
                setCityNames(newMapping);
            };
            fetchCities();
        }
    }, [stations]);

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
                style={{ height: "800px", width: "100%", zIndex: "0" }}
            >
                <LocationUpdater position={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SearchBox stations={stations}></SearchBox>
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
                        className='relative text-center h-full w-full flex flex-col items-center justify-start bg-[var(--background)] rounded-lg shadow-lg text-white'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActiveMarker(null)}
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
                                    
                                    {cityNames[station.id] && `${cityNames[station.id]}`}, <br />
                                    {station.name}{' '}
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
                            <section className='flex flex-col gap-4  animate-display-from-top z-[1] bg-[var(--cardblack)] rounded-3xl p-7 hidden]'>
                                {ports.filter(port => port.station_id === station.id).map((port,index) => (
                                    <div key={port.id} className='flex items-center gap-4 text-xl '>
                                        <div className={`w-3 h-3 rounded-full ${
                                            port.status === 'wolny' ? 'bg-green-500' : 
                                            port.status === 'nieczynny' ? 'bg-red-500' : 
                                            'bg-[var(--yellow)]'
                                        }`}>
                                        </div>
                                        <div>Port {index + 1}: {port.power_kW}kW ({port.status})</div>
                                        
                                    </div>
                                ))}
                            </section>
                        </main>
                    </div>
                </div>
            ))}
        </div>
    );
}
