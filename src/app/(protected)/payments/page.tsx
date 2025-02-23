'use client'

import { useEffect, useState } from 'react'
import { getPaymentsInfo } from '@/data/payments'
import { PaymentsInfo } from '@/components/PaymentsInfo'

export default function PaymentsPage() {
    const [payments, setPayments] = useState([])
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

    if (loading) return <div>Loading payments...</div>
    if (error) return <div className="text-red-500 text-center">{error}</div>

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Płatności</h1>
            <PaymentsInfo payments={payments} label="Payments Information" />
        </div>
    )
}