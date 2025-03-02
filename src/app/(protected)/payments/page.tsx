'use client'

import { useEffect, useState } from 'react'
import { getPaymentsInfo } from '@/data/payments'
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

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

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading payments...</div>
    if (error) return <div className="text-red-500 text-center min-h-screen flex items-center justify-center">{error}</div>

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6 text-white">Payment History</h1>
            <div className="space-y-4">
                {payments.map((payment) => (
                    <PaymentCard key={payment.id} payment={payment} />
                ))}
            </div>
        </div>
    )
}