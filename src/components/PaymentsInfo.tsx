"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getPaymentsInfo } from "@/data/payments";

interface Payment {
    id: number;
    user_id: string;
    session_id: string;
    amount: number;
    status: string;
    payment_method: string;
    created_at: string;
}

interface PaymentsInfoProps {
    payments?: Payment[];
    label: string;
    isLoading?: boolean;
}

export const PaymentsInfo = ({
    payments,
    label,
    isLoading = false,
}: PaymentsInfoProps) => {
    if (isLoading) {
        return (
            <Card className="bg-[var(--cardblack)] w-[90%]">
                <CardHeader>
                    <p className="text-2xl font-semibold text-center text-white">
                        {label}
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-700 rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card className="bg-[var(--cardblack)] w-[90%]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center text-white">
                    {label}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {payments?.map((payment) => { 
                    const halo = new Date(payment.created_at);
                    return (
                    <div key={payment.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Id Sesji
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {payment.session_id}
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Koszt
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {payment.amount} zł
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Metoda płatności
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {payment.payment_method}
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Data transakcji
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {halo.getHours() < 10 ? "0" + halo.getHours() : halo.getHours()}:{halo.getMinutes() < 10 ? "0" + halo.getMinutes() : halo.getMinutes()} {halo.getDate() < 10 ? "0" + halo.getDate() : halo.getDate()}.{halo.getMonth() < 10 ? "0" + halo.getMonth() : halo.getMonth()}.{halo.getFullYear()}
                            </p>
                        </div>
                    </div>
                )})}
            </CardContent>
        </Card>
    );
};

const PaymentsPage = () => {
    const [Payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await getPaymentsInfo();
                if (data) {
                    setPayments(data);
                }
            } catch (error) {
                console.error("Error fetching Payments:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full flex justify-center items-center min-h-screen">
            <PaymentsInfo 
                label="Moje pojazdy"
                payments={Payments}
                isLoading={isLoading}
            />
        </div>
    );
};

export default PaymentsPage;