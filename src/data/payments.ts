"use server";

import { auth } from "@/auth";

/**
 * Interfejs reprezentujący płatność
 */
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

export interface PaymentCreate {
    session_id: number;
    amount: number;
    payment_method: string;
    status: string;
    transaction_id: string;
    energy_used: number;
    duration: string;
    port_number: number;
    port_power: number;
    theoretical_duration: string;
    discount_code_id?: number;
    original_amount?: number;
}

/**
 * Pobiera informacje o wszystkich płatnościach użytkownika
 * @returns Lista płatności lub null w przypadku błędu
 */
export const getPaymentsInfo = async (): Promise<Payment[] | null> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
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
            throw new Error(`Błąd pobierania płatności: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        return null;
    }
};

/**
 * Tworzy nową płatność
 * @param paymentData Dane płatności do utworzenia
 * @returns Utworzona płatność lub null w przypadku błędu
 */
export const createPayment = async (paymentData: PaymentCreate): Promise<Payment | null> => {
    try {
        const session = await auth();
        
        if (!session?.user?.apiToken) {
            console.error('No auth token available');
            return null;
        }

        const userId = session.user?.id;
        if (!userId) {
            console.error('No user id available');
            return null;
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const fullPaymentData = {
            ...paymentData,
            user_id: userId
        };

        console.log('Creating payment with data:', fullPaymentData);

        const response = await fetch(`${baseUrl}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.apiToken}`
            },
            body: JSON.stringify(fullPaymentData)
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            throw new Error('Invalid server response');
        }

        if (!response.ok) {
            console.error('Payment creation failed:', {
                status: response.status,
                data
            });
            throw new Error(data?.detail || 'Error creating payment');
        }

        return data;
    } catch (error) {
        console.error('Payment creation error:', error);
        throw error instanceof Error ? error : new Error('Unexpected error during payment creation');
    }
};