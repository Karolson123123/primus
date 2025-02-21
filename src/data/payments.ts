interface Payment {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

export const getStationsInfo = async (): Promise<Payment[] | null> => {
    try {
        const response = await fetch('http://localhost:8000/payment', {
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