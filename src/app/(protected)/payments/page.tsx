'use client'

import { useEffect, useState, useCallback } from 'react'
import { getPaymentsInfo } from '@/data/payments'
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input";

interface Payment {
    id: number
    user_id: string
    session_id: number
    amount: number
    status: 'pending' | 'completed' | 'failed'
    transaction_id: number
    payment_method: string
    created_at: string
}

type FilterOption = 'all' | 'pending' | 'completed' | 'failed';
type SortOption = 'newest' | 'oldest' | 'highest_amount' | 'lowest_amount';

// Create a new PaymentCard component
const PaymentCard = ({ payment }: { payment: Payment }) => {
    const [showDetails, setShowDetails] = useState(false)
    
    return (
        <Card className="bg-[var(--cardblack)] border-[var(--yellow)]">
            <div 
                onClick={() => setShowDetails(!showDetails)}
                className="cursor-pointer p-4 text-white"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div>
                            <p className="text-xl font-bold text-white">Payment #{payment.id}</p>
                            <p className="text-sm text-gray-400">{new Date(payment.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge 
                            className={`
                                ${payment.status === 'completed' ? 'bg-green-500' : ''}
                                ${payment.status === 'pending' ? 'bg-yellow-500' : ''}
                                ${payment.status === 'failed' ? 'bg-red-500' : ''}
                            `}
                        >
                            {payment.status.toUpperCase()}
                        </Badge>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-6 h-6 transform transition-transform duration-150 ${
                                showDetails ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        showDetails ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--yellow)]">
                        <div>
                            <p className="text-sm text-gray-400">Transaction ID</p>
                            <p className="font-mono text-white">{payment.transaction_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Amount</p>
                            <p className="font-semibold text-white">{payment.amount} PLN</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Payment Method</p>
                            <p className="capitalize text-white">{payment.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Session ID</p>
                            <p className="text-white">#{payment.session_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">User ID</p>
                            <p className="font-mono truncate text-white">{payment.user_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Created At</p>
                            <p className="text-white">{new Date(payment.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [displayCount, setDisplayCount] = useState(5);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const paymentData = await getPaymentsInfo()
                if (paymentData) {
                    setPayments(paymentData)
                }
            } catch (error) {
                console.error('Error fetching payments:', error)
                setError('Failed to load payments. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchPayments()
    }, [])

    const filterAndSortPayments = useCallback((paymentsToProcess: Payment[]) => {
        let filtered = paymentsToProcess.filter(payment => {
            const matchesSearch = searchQuery === '' || 
                payment.transaction_id.toString().includes(searchQuery) ||
                payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.session_id.toString().includes(searchQuery);

            const matchesFilter = filterBy === 'all' ? true :
                payment.status === filterBy;

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
        setDisplayCount(prevCount => {
            const nextCount = prevCount + 5;
            return nextCount > payments.length ? payments.length : nextCount;
        });
    }, [payments.length]);

    if (loading) {
        return (
            <Card className="bg-[var(--cardblack)] w-[90%] mx-auto border border-[var(--yellow)]">
                <CardHeader>
                    <p className="text-2xl font-semibold text-center text-white">
                        Payment History
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

    const displayedPayments = filterAndSortPayments(payments).slice(0, displayCount);
    const remainingCount = payments.length - displayCount;
    const hasMore = remainingCount > 0;

    return (
        <Card className="bg-[var(--cardblack)] w-[90%] mx-auto border border-[var(--yellow)]">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-2xl font-semibold text-white">
                        Payment History
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        {/* Search input */}
                        <div className="relative w-full md:w-64">
                            <Input
                                type="text"
                                placeholder="Search payments..."
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
                            <span className="text-gray-400">Sort by:</span>
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
                {displayedPayments.map((payment) => (
                    <PaymentCard key={payment.id} payment={payment} />
                ))}

                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                        >
                            Load More ({remainingCount} remaining)
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}