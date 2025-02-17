import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import { LatLngTuple } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
type MarkerType = {
  readonly geocode: LatLngTuple;
  readonly popupText: string;
};

const icon = L.icon({
  iconUrl: "/basic-marker.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [38, 38],
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

export default function Map() {
    const markers: readonly MarkerType[] = [
        {
            geocode: [54.354068, 18.656240] as LatLngTuple,
            popupText: "Location 1"
        },
        {
            geocode: [54.364068, 18.656240] as LatLngTuple,
            popupText: "Location 2"
        },
        {
            geocode: [54.374068, 18.656240] as LatLngTuple,
            popupText: "Location 3"
        },
    ];

    const center: LatLngTuple = [54.354068, 18.656240];

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "870px", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={60}
                animate={true}
                iconCreateFunction={createClusterCustomIcon}
            >
                {markers.map((marker, index) => (
                    <Marker 
                        key={index} 
                        position={marker.geocode} 
                        icon={icon}
                    >
                        <Popup 
                            offset={[-980,500]}
                            position={marker.geocode} 
                            
                        >
                            <div className='text-center h-[800px] w-[300px] flex flex-col items-center justify-center bg-[var(--background)] rounded-lg shadow-lg text-white '
                            onClick={(e) => e.stopPropagation()}>
                                <h1 className='font-semibold text-4xl p-5'>{marker.popupText}</h1>
                                <main className='w-[95%] h-[90%] flex justify-around items-center flex-col p-7'>
                                    <section className='text-4xl flex items-center'><img src="/EV-charger.png" alt="EV charger port" className='w-20 h-20'/>Ports 1/4</section>
                                    <section className='text-4xl'>xd xd jakies info</section>
                                </main>
                                <a href="/some-link" onClick={(e) => e.stopPropagation()}>Link text</a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}