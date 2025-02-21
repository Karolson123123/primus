interface Port {
    id: number;
    status: string;
    created_at: string;
    power_kW: number;
    station_id: number;
}

export const getPortsInfo = async (): Promise<Port[] | null> => {
    try {
        const response = await fetch('http://localhost:8000/ports', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
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