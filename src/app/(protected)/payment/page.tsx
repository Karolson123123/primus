'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  
  const sessionId = searchParams.get('sessionId')
  const amount = searchParams.get('amount')

  useEffect(() => {
    if (!sessionId || !amount) {
      toast.error('Invalid payment details')
      router.push('/charging')
    }
  }, [sessionId, amount, router])

  const handlePayment = async (method: 'card' | 'blik' | 'transfer') => {
    setIsLoading(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Payment initiated', {
        description: 'You will be redirected to complete the payment'
      })
      
      // Redirect based on payment method
      switch(method) {
        case 'card':
          router.push(`/external-payment/card?sessionId=${sessionId}&amount=${amount}`)
          break
        case 'blik':
          router.push(`/external-payment/blik?sessionId=${sessionId}&amount=${amount}`) 
          break
        case 'transfer':
          router.push(`/external-payment/transfer?sessionId=${sessionId}&amount=${amount}`)
          break
      }
    } catch (error) {
      toast.error('Payment failed', {
        description: 'Please try again or select a different payment method'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto bg-[var(--cardblack)] border-[var(--yellow)] text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Payment Details</h1>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span>Session ID:</span>
              <span className="font-mono">{sessionId}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--yellow)] pt-4">
              <span className="text-lg font-bold">Total Amount:</span>
              <span className="text-lg font-bold">{amount} PLN</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handlePayment('card')}
              disabled={isLoading}
              className="w-full bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black"
            >
              Pay with Card
            </Button>

            <Button
              onClick={() => handlePayment('blik')}
              disabled={isLoading}
              className="w-full bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black"
            >
              Pay with BLIK
            </Button>

            <Button
              onClick={() => handlePayment('transfer')}
              disabled={isLoading}
              className="w-full bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black"
            >
              Bank Transfer
            </Button>
          </div>

          <button
            onClick={() => router.push('/charging')}
            className="mt-6 w-full text-gray-400 hover:text-white text-sm"
          >
            Cancel Payment
          </button>
        </div>
      </Card>
    </div>
  )
}