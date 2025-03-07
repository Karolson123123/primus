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
import { Input } from '@/components/ui/input'
import { verifyDiscount, getDiscountByCode, Discount } from '@/data/discounts';
import { FormSuccess } from '@/components/FormSuccess';
import { useSession } from "next-auth/react";
import { PaymentCreate } from '@/data/payments'

// Interfejs szczegółów sesji ładowania
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
  // Podstawowe hooki i stan komponentu
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  // const [chargingSession, setChargingSession] = useState(null);
  const [vehicle, setVehicle] = useState(null)
  const [sessionDetails, setSessionDetails] = useState<SessionDetails>({
    startTime: '',
    endTime: '',
    energyUsed: 0,
    duration: '',
    portPower: 0,
    portNumber: 0,
    theoreticalDuration: ''
  })
  // const [ports, setPorts] = useState([])s

  const [discountPercentage, setDiscountPercentage] = useState(0);

  const [successMessage, setSuccessMessage] = useState('');
  const [scratchCode, setScratchCode] = useState('');
  const [isScratchVerifying, setIsScratchVerifying] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null)
  const [sessionCost, setSessionCost] = useState<number>(0);
  
  const sessionId = searchParams.get('sessionId')
  const amount = searchParams.get('amount')
  const { data: authSession } = useSession();

  // Pobieranie szczegółów sesji
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;

      try {
        const [sessions, vehicles, ports] = await Promise.all([
          getChargingSessionsInfo(),
          getVehicles(),
          getPortsInfo()
        ]);

        const sessionData = sessions?.find(s => s.id === Number(sessionId));
        
        if (sessionData) {
          // setChargingSession(sessionData);
          
          const sessionPort = ports?.find(p => p.id === sessionData.port_id);
          
          // Get the cost from session data
          const sessionCost = Number(sessionData.total_cost || 0);
          setSessionCost(sessionCost);

          // Obliczanie czasu trwania sesji
          const start = new Date(sessionData.start_time);
          const end = sessionData.end_time ? new Date(sessionData.end_time) : new Date();
          const durationMs = end.getTime() - start.getTime();

          const durationTotalSeconds = Math.round(durationMs / 1000);
          const durationHours = Math.floor(durationTotalSeconds / 3600);
          const durationMinutes = Math.floor((durationTotalSeconds % 3600) / 60);
          const durationSeconds = durationTotalSeconds % 60;

          // Obliczanie teoretycznego czasu ładowania
          const energyUsed = Number(sessionData.energy_used_kwh || 0);
          const portPower = sessionPort?.power_kw || 0;
          const theoreticalDurationHours = portPower > 0 ? energyUsed / portPower : 0;
          const theoreticalDurationTotalSeconds = Math.round(theoreticalDurationHours * 3600);
          const theoreticalHours = Math.floor(theoreticalDurationTotalSeconds / 3600);
          const theoreticalMinutes = Math.floor((theoreticalDurationTotalSeconds % 3600) / 60);
          const theoreticalSeconds = theoreticalDurationTotalSeconds % 60;

          setSessionDetails({
            startTime: start.toLocaleString(),
            endTime: sessionData.end_time ? end.toLocaleString() : 'W trakcie',
            energyUsed: Number(energyUsed.toFixed(2)),
            duration: `${durationHours}g ${durationMinutes}m ${durationSeconds}s`,
            portPower: portPower,
            portNumber: sessionPort?.number || 0,
            theoreticalDuration: `${theoreticalHours}g ${theoreticalMinutes}m ${theoreticalSeconds}s`
          });

          if (vehicles) {
            const sessionVehicle = vehicles.find(v => v.id === sessionData.vehicle_id);
            if (sessionVehicle) {
              setVehicle(sessionVehicle);
            }
          }

          // setPorts(ports || []);
        }
      } catch {
        toast.error('Nie udało się załadować szczegółów sesji');
      }
    };

    fetchSessionDetails();
  }, [sessionId]);
  console.log(discount);

  // Obsługa płatności
  const handlePayment = async (method: 'card' | 'blik' | 'transfer') => {
    setIsLoading(true);
    try {
      if (!sessionId || !sessionCost || !authSession?.user?.id) {
        throw new Error('Brak wymaganych danych do płatności');
      }

      const discountedAmount = calculateDiscountedAmount();
      
      console.log("Pobranie discount przez code");
      console.log("normal: ", amount);
      console.log("discount: ", discountedAmount);
      
      const paymentData: PaymentCreate = {
        session_id: Number(sessionId),
        amount: Number(discountedAmount),
        payment_method: method,
        status: 'pending',
        transaction_id: Date.now().toString(),
        energy_used: sessionDetails.energyUsed,
        duration: sessionDetails.duration,
        port_number: sessionDetails.portNumber,
        port_power: sessionDetails.portPower,
        theoretical_duration: sessionDetails.theoreticalDuration,
        // discount_code: scratchCode || undefined,
        // discount_percentage: discountPercentage || undefined,
        // discount_code_id:
        discount_code_id: discount?.id,
        original_amount: Number(sessionCost),
      };

      const payment = await createPayment(paymentData);

      if (!payment) {
        throw new Error('Nie udało się utworzyć płatności');
      }

      toast.success('Płatność rozpoczęta', {
        description: 'Zostaniesz przekierowany do realizacji płatności'
      });

      const redirectUrl = `/external-payment/${method}?` + new URLSearchParams({
        sessionId: sessionId,
        amount: discountedAmount,
        paymentId: payment.id.toString()
      }).toString();

      router.push(redirectUrl);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Wystąpił błąd podczas przetwarzania płatności', {
        description: error instanceof Error ? error.message : 'Spróbuj ponownie lub wybierz inną metodę płatności'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyScratchCode = async () => {
    if (!scratchCode) return;
    
    setIsScratchVerifying(true);
    try {
      console.log(scratchCode);
      const discountData: Discount | null = await getDiscountByCode(scratchCode);
      console.log("Pobranie discount data przez code");
      console.log(discountData);

      setDiscount(discountData);
      const result = await verifyDiscount(scratchCode);
      if (result.isValid) {
        setDiscountPercentage(result.percentage);
        setSuccessMessage(`Kod ze zdrapki zastosowany! Zniżka: ${result.percentage}%`);
        setScratchCode(''); // Clear the input after successful application
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Wystąpił błąd podczas weryfikacji kodu ze zdrapki');
    } finally {
      setIsScratchVerifying(false);
    }
  };

  const calculateDiscountedAmount = () => {
    if (!discountPercentage) return sessionCost.toString();
    const discountAmount = (sessionCost * discountPercentage) / 100;
    return (sessionCost - discountAmount).toFixed(2);
  };

  const formatAmount = (amount: number | string) => {
    return Number(amount).toFixed(2);
  };

  return (
    <div className="container mx-auto py-12 px-4 max-lg:w-full max-lg:mt-20">
      <Card className="max-w-md mx-auto bg-[var(--cardblack)] border-[var(--yellow)] text-[var(--text-color)]">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Szczegóły płatności</h1>
          
          <div className="space-y-4 mb-6">
            {vehicle && (
              <div className="border-b border-[var(--yellow)] pb-4">
                <h2 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Informacje o pojeździe</h2>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-[var(--text-color-lighter)]">Marka:</span>
                  <span>{vehicle.brand}</span>
                  <span className="text-[var(--text-color-lighter)]">Numer rejestracyjny:</span>
                  <span className="font-mono">{vehicle.license_plate}</span>
                </div>
              </div>
            )}

            <div className="space-y-2 border-b border-[var(--yellow)] pb-4">
              <h2 className="text-lg font-semibold">Informacje o sesji</h2>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-400">Czas trwania:</span>
                <span>{sessionDetails.theoreticalDuration}</span>
                <span className="text-gray-400">Zużyta energia:</span>
                <span>{sessionDetails.energyUsed} kWh</span>
                <span className="text-gray-400">Moc portu:</span>
                <span>{sessionDetails.portPower} kW</span>
              </div>
            </div>
            <div className='space-y-2 border-b border-[var(--yellow)] pb-4'>
              <label className='flex flex-col text-xl font-bold text-center gap-3 text-[var(--text-color)]'>
                Aktywuj kod rabatowy
                <div className='flex'>
                  <Input 
                    type="text" 
                    value={scratchCode}
                    onChange={(e) => setScratchCode(e.target.value.toUpperCase())}
                    placeholder="Wpisz kod"
                    className='rounded-l-md uppercase rounded-r-none text-center border-[var(--yellow)]'
                    disabled={isScratchVerifying}
                  />
                  <button 
                    onClick={handleApplyScratchCode}
                    disabled={isScratchVerifying || !scratchCode}
                    className='w-9 h-9 bg-[var(--yellow)] rounded-r-md rounded-l-none hover:bg-[var(--darkeryellow)] text-sm disabled:opacity-50'
                  >
                    ✔
                  </button>
                </div>
              </label>
              {successMessage && <FormSuccess message={successMessage} />}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-color-lighter)]">Koszt sesji:</span>
                <span className={discountPercentage > 0 ? "line-through text-[var(--text-color-lighter)]" : ""}>
                  {formatAmount(amount)} PLN
                </span>
              </div>
              
              {discountPercentage > 0 && (
                <>
                  <div className="flex justify-between text-[var(--yellow)]">
                    <span>Rabat ({discountPercentage}%):</span>
                    <span>-{formatAmount((Number(amount) * discountPercentage) / 100)} PLN</span>
                  </div>
                  <div className="border-t border-[var(--yellow)] pt-2 mt-2"></div>
                </>
              )}
              
              <div className="flex justify-between">
                <span className="text-lg font-bold">Do zapłaty:</span>
                <span className="text-lg font-bold text-[var(--yellow)]">
                  {calculateDiscountedAmount()} PLN
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => handlePayment('blik')}
                disabled={isLoading}
                className="w-full bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black"
              >
                Płatność BLIK
              </Button>

              <Button
                onClick={() => handlePayment('transfer')}
                disabled={isLoading}
                className="w-full bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black"
              >
                Przelew bankowy
              </Button>
            </div>
          </div>

          <button
            onClick={() => router.push('/charging')}
            className="mt-6 w-full text-gray-400 hover:text-white text-sm"
          >
            Anuluj płatność
          </button>
        </div>
      </Card>
    </div>
  )
}