"use server";

import { auth } from "@/auth";

// Update interface to match backend schema
interface Payment {
    id: number;
    user_id: string;
    session_id: number;
    amount: number;
    status: string;
    transaction_id: number;
    payment_method: string;
    created_at: string;
}

export const getPaymentsInfo = async (): Promise<Payment[] | null> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            console.error("No authentication token available");
            return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        console.log('Fetching payments from:', `${baseUrl}/payments`);
        console.log('Using token:', session.user.apiToken);

        const response = await fetch(`${baseUrl}/payments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`,
                'Cache-Control': 'no-cache'
            },
            next: { revalidate: 0 },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Payment API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText}`);
        }

        const payments = await response.json();
        console.log('Successfully fetched payments:', {
            count: payments?.length || 0
        });

        return payments;

    } catch (error) {
        console.error('Error in getPaymentsInfo:', {
            name: error?.name,
            message: error instanceof Error ? error.message : String(error)
        });
        throw error;
    }
};

// Add function to create payment
export const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment | null> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            console.error("No authentication token available");
            return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${baseUrl}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            throw new Error('Failed to create payment record');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating payment:', error);
        return null;
    }
}