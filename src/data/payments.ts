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
        
        const response = await fetch(`${baseUrl}/payments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payments');
        }

        const payments = await response.json();
        
        // Sort payments by status priority and ID
        return payments.sort((a: Payment, b: Payment) => {
            // First, sort by status priority
            const getStatusPriority = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'pending': return 0;
                    case 'failed': return 1;
                    case 'completed': return 2;
                    default: return 3;
                }
            };

            const statusPriorityA = getStatusPriority(a.status);
            const statusPriorityB = getStatusPriority(b.status);

            if (statusPriorityA !== statusPriorityB) {
                return statusPriorityA - statusPriorityB;
            }

            // If status is the same, sort by ID in descending order
            return b.id - a.id;
        });

    } catch (error) {
        console.error('Error fetching payments:', error);
        return null;
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