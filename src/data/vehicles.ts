interface Vehicle {
    id: number;
    license_plate: string;
    brand: string;
    battery_capacity_kWh: number;
    battery_condition: number;
    max_charging_powerkWh: number;
    created_at: string;
    user_id: number;
}

export const getVehicles = async (): Promise<Vehicle[] | null> => {
    try {
        const response = await fetch('http://localhost:8000/vehicles', {
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