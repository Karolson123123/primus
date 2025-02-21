interface Port {
    id: string;
    power_kW: string;
    status: string;
}

interface ChargingStation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    ports: Port[];
}

export const getStationsInfo = async (): Promise<ChargingStation[] | null> => {
    try {
        const response = await fetch('http://localhost:8000/stations',  {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stations');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching stations:", error);
        return null;
    }
}

export const getStationsWithPorts = async (): Promise<ChargingStation[] | null> => {
    try {
        const response = await fetch('http://localhost:8000/stations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stations and ports');
        }
        const stations = await response.json();
        return stations;
    } catch (error) {
        console.error("Error fetching stations and ports:", error);
        return null;
    }
}