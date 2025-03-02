'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { getChargingSessionsInfo } from '@/data/charging-session'
import { getVehicles } from '@/data/vehicles'
import { getPortsInfo } from '@/data/ports'
import { createPayment } from '@/data/payments'

// Update the interface to include theoretical duration
interface SessionDetails {
  startTime: string;
  endTime: string;
  energyUsed: number;
  duration: string;
  portPower: number;
  portNumber: number;
  theoreticalDuration: string;
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [vehicle, setVehicle] = useState<any>(null)
  const [sessionDetails, setSessionDetails] = useState<SessionDetails>({
    startTime: '',
    endTime: '',
    energyUsed: 0,
    duration: '',
    portPower: 0,
    portNumber: 0,
    theoreticalDuration: ''
  })
  const [ports, setPorts] = useState<any[]>([])
  
  const sessionId = searchParams.get('sessionId')
  const amount = searchParams.get('amount')

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;

      try {
        // Fetch all required data in parallel
        const [sessions, vehicles, ports] = await Promise.all([
          getChargingSessionsInfo(),
          getVehicles(),
          getPortsInfo()
        ]);

        const sessionData = sessions?.find(s => s.id === Number(sessionId));
        
        if (sessionData) {
          setSession(sessionData);
          
          // Get port information
          const sessionPort = ports?.find(p => p.id === sessionData.port_id);
          
          // Update the duration calculations in fetchSessionDetails
          const start = new Date(sessionData.start_time);
          const end = sessionData.end_time ? new Date(sessionData.end_time) : new Date();
          const durationMs = end.getTime() - start.getTime();

          // Calculate minutes and seconds
          const durationTotalSeconds = Math.round(durationMs / 1000);
          const durationHours = Math.floor(durationTotalSeconds / 3600);
          const durationMinutes = Math.floor((durationTotalSeconds % 3600) / 60);
          const durationSeconds = durationTotalSeconds % 60;

          // Calculate theoretical duration with seconds
          const energyUsed = Number(sessionData.energy_used_kwh || 0);
          const portPower = sessionPort?.power_kw || 0;
          const theoreticalDurationHours = portPower > 0 ? energyUsed / portPower : 0;
          const theoreticalDurationTotalSeconds = Math.round(theoreticalDurationHours * 3600);
          const theoreticalHours = Math.floor(theoreticalDurationTotalSeconds / 3600);
          const theoreticalMinutes = Math.floor((theoreticalDurationTotalSeconds % 3600) / 60);
          const theoreticalSeconds = theoreticalDurationTotalSeconds % 60;

          setSessionDetails({
            startTime: start.toLocaleString(),
            endTime: sessionData.end_time ? end.toLocaleString() : 'In Progress',
            energyUsed: energyUsed.toFixed(2),
            duration: `${durationHours}h ${durationMinutes}m ${durationSeconds}s`,
            portPower: portPower,
            portNumber: sessionPort?.number || 0,
            theoreticalDuration: `${theoreticalHours}h ${theoreticalMinutes}m ${theoreticalSeconds}s`
          });

          // Set vehicle details
          if (vehicles) {
            const sessionVehicle = vehicles.find(v => v.id === sessionData.vehicle_id);
            if (sessionVehicle) {
              setVehicle(sessionVehicle);
            }
          }

          setPorts(ports || []);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        toast.error('Failed to load session details');
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !amount) {
      toast.error('Invalid payment details')
      router.push('/charging')
    }
  }, [sessionId, amount, router])

  const handlePayment = async (method: 'card' | 'blik' | 'transfer') => {
    setIsLoading(true)
    try {
      // First validate all required fields
      if (!sessionId || !amount) {
        throw new Error('Missing session ID or amount')
      }
      
      if (!session) {
        throw new Error('No active session found')
      }

      // Create payment using the data service
      const paymentData = {
        session_id: Number(sessionId),
        amount: Number(amount),
        payment_method: method,
        status: 'pending',
        // Use session ID directly from the charging session
        user_id: session.user_id, // Change from session.user.id to session.user_id
        transaction_id: Date.now(),
        energy_used: Number(sessionDetails.energyUsed),
        duration: sessionDetails.duration,
        port_number: sessionDetails.portNumber,
        port_power: sessionDetails.portPower,
        theoretical_duration: sessionDetails.theoreticalDuration
      }

      const payment = await createPayment(paymentData)

      if (!payment) {
        throw new Error('Failed to create payment record')
      }

      // Log successful payment creation
      console.log('Payment created:', {
        id: payment.id,
        method: method,
        amount: amount,
        sessionId: sessionId
      })

      // Show success message
      toast.success('Payment initiated', {
        description: 'You will be redirected to complete the payment'
      })
      
      // Redirect based on payment method with payment ID
      const redirectUrl = `/external-payment/${method}?` + new URLSearchParams({
        sessionId: sessionId,
        amount: amount,
        paymentId: payment.id.toString()
      }).toString()

      router.push(redirectUrl)

    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again or select a different payment method'
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
            {/* Vehicle Details */}
            {vehicle && (
              <div className="border-b border-[var(--yellow)] pb-4">
                <h2 className="text-lg font-semibold mb-2">Vehicle Information</h2>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Brand:</span>
                  <span>{vehicle.brand}</span>
                  <span className="text-gray-400">License Plate:</span>
                  <span className="font-mono">{vehicle.license_plate}</span>
                </div>
              </div>
            )}

            {/* Session Details with Port Info */}
            <div className="space-y-2 border-b border-[var(--yellow)] pb-4">
              <h2 className="text-lg font-semibold">Session Information</h2>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-400">Duration:</span>
                <span>{sessionDetails.theoreticalDuration}</span>
                <span className="text-gray-400">Energy Used:</span>
                <span>{sessionDetails.energyUsed} kWh</span>
                <span className="text-gray-400">Port Power:</span>
                <span>{sessionDetails.portPower} kW</span>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="flex justify-between pt-2">
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