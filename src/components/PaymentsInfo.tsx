"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { getPaymentsInfo } from "@/data/payments";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

type FilterOption = 'all' | 'pending' | 'completed' | 'failed';
type SortOption = 'newest' | 'oldest' | 'highest_amount' | 'lowest_amount';

export const PaymentsInfo = ({
    payments = [],
    label,
    isLoading = false,
}: PaymentsInfoProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [displayCount, setDisplayCount] = useState(5);

    const filterAndSortPayments = useCallback((paymentsToProcess: Payment[]) => {
        let filtered = paymentsToProcess.filter(payment => {
            const matchesSearch = searchQuery === '' || 
                payment.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter = filterBy === 'all' ? true :
                payment.status.toLowerCase() === filterBy;

            return matchesSearch && matchesFilter;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'highest_amount':
                    return b.amount - a.amount;
                case 'lowest_amount':
                    return a.amount - b.amount;
                case 'newest':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });
    }, [searchQuery, filterBy, sortBy]);

    const handleLoadMore = useCallback(() => {
        setDisplayCount(prev => Math.min(prev + 5, payments.length));
    }, [payments.length]);

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

    const filteredPayments = filterAndSortPayments(payments);
    const displayedPayments = filteredPayments.slice(0, displayCount);
    const hasMore = displayCount < filteredPayments.length;

    return (
        <Card className="bg-[var(--cardblack)] w-[90%]">
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <p className="text-2xl font-semibold text-center text-white">
                        {label}
                    </p>
                    
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Box */}
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                placeholder="Search by session ID or payment method..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-700 text-white border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Status:</span>
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                                className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-[var(--yellow)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-[var(--yellow)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest_amount">Highest Amount</option>
                                <option value="lowest_amount">Lowest Amount</option>
                            </select>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {displayedPayments.map((payment) => { 
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

                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                        >
                            Load More ({filteredPayments.length - displayCount} remaining)
                        </button>
                    </div>
                )}
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