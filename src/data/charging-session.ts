interface ChargingSession {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    vehicle_id: number;
    start_time: string;
    end_time: string | null;
    energy_used_kWh: number;
    total_cost: number;
    status: string;
}

export const getChargingSessionsInfo = async (): Promise<ChargingSession[] | null> => {
    try {
        const response = await fetch('http://localhost:8000/sessions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch vehicles');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return null;
    }
}