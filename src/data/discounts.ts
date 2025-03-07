"use server";

import { auth } from "@/auth";

export interface Discount {
    id: number;
    code: string;
    description: string;
    discount_percentage: number;
    expiration_date: Date;
    created_at: Date;
}

interface DiscountIn {
    code: string;
    description: string;
    discount_percentage: number;
    expiration_date: string;  // Add this field
}

export const getDiscount = async (discountCode: string): Promise<Discount | null> => {
    try {
        const session = await auth();
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (session?.user?.apiToken) {
            headers['Authorization'] = `Bearer ${session.user.apiToken}`;
        }

        const response = await fetch(`${baseUrl}/discounts/${discountCode}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            console.error('Response status:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('Received discount data:', data); // Debug log

        // Verify the data has required fields
        if (!data.code || typeof data.discount_percentage !== 'number') {
            console.error('Invalid discount data:', data);
            return null;
        }

        return {
            id: data.id,
            code: data.code,
            description: data.description,
            discount_percentage: data.discount_percentage,
            expiration_date: new Date(data.expiration_date),
            created_at: new Date(data.created_at)
        };
    } catch (error) {
        console.error('Error fetching discount:', error);
        return null;
    }
}

export const createDiscount = async (discount: DiscountIn): Promise<Discount | null> => {
    try {
        const session = await auth();
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        if (!discount.code || !discount.discount_percentage) {
            console.error('Missing required discount data:', discount);
            return null;
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (session?.user?.apiToken) {
            headers['Authorization'] = `Bearer ${session.user.apiToken}`;
        }

        // Log the exact data being sent
        const requestBody = {
            code: discount.code,
            description: discount.description || `Discount for ${discount.discount_percentage}% off`,
            discount_percentage: Number(discount.discount_percentage),
            expiration_date: discount.expiration_date
        };
        
        console.log('Sending discount data:', requestBody);

        const response = await fetch(`${baseUrl}/discounts`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error creating discount:', errorData);
            return null;
        }

        const data = await response.json();
        console.log('Created discount:', data);

        return {
            id: data.id,
            code: data.code,
            description: data.description,
            discount_percentage: Number(data.discount_percentage),
            expiration_date: new Date(data.expiration_date),
            created_at: new Date(data.created_at)
        };
    } catch (error) {
        console.error('Error in createDiscount:', error);
        return null;
    }
}

export const verifyDiscount = async (code: string): Promise<{ isValid: boolean; percentage: number; message: string }> => {
    try {
        const session = await auth();
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (session?.user?.apiToken) {
            headers['Authorization'] = `Bearer ${session.user.apiToken}`;
        }

        console.log('Verifying discount code:', code); // Debug log

        const response = await fetch(`${baseUrl}/discounts/verify/${code}`, {
            method: 'POST',
            headers: headers
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Verify discount error:', data); // Debug log
            return {
                isValid: false,
                percentage: 0,
                message: data.detail || 'Kod rabatowy jest nieprawidłowy'
            };
        }

        console.log('Verify discount response:', data); // Debug log

        return {
            isValid: data.isValid,
            percentage: data.percentage,
            message: data.message
        };
    } catch (error) {
        console.error('Error verifying discount:', error);
        return {
            isValid: false,
            percentage: 0,
            message: 'Wystąpił błąd podczas weryfikacji kodu'
        };
    }
};

export const getDiscountByCode = async (code: string): Promise<Discount | null> => {
    try {
        console.log(code);
        const session = await auth();
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (session?.user?.apiToken) {
            headers['Authorization'] = `Bearer ${session.user.apiToken}`;
        }

        console.log('Verifying discount code:', code); 

        const response = await fetch(`${baseUrl}/discounts/${code}`, {
            method: 'GET',
            headers: headers
        });
        console.log(response);
        const data: Discount = await response.json();
        return data;

    } catch (error) {
        console.log(error);
        return null;
    }
}