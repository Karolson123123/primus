"use client";

import { ScratchCard, SCRATCH_TYPE } from 'scratchcard-js';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { createDiscount } from '@/data/discounts';
// Add this interface for discount code structure
interface DiscountCodeData {
  code: string;
  percentage: number;
}

// Modify the generate function to include percentage
const generateDiscountCode = (): DiscountCodeData => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const percentage = Math.floor(Math.random() * (30 - 5 + 1)) + 5;
  
  // Log the generated data
  console.log('Generated discount data:', { code, percentage });
  
  return {
    code,
    percentage
  };
};

const shouldGenerateNewCode = () => {
  const lastDate = localStorage.getItem('lastCodeDate');
  const today = new Date().toDateString();
  return lastDate !== today;
};

const getTimeUntilMidnight = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
};

export default function DiscountPage() {
  const scContainer = useRef<HTMLDivElement>(null);
  const [discountCode, setDiscountCode] = useState<DiscountCodeData>({ code: '', percentage: 0 });
  const [timeLeft, setTimeLeft] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Add this ref for cleanup

  useEffect(() => {
    const createNewDiscount = async () => {
      const newCode = generateDiscountCode();
      console.log('New discount code generated:', newCode);

      try {
        const result = await createDiscount({
          code: newCode.code,
          description: `Discount code for ${newCode.percentage}% off`,
          discount_percentage: newCode.percentage,
          expiration_date: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
        });

        if (result) {
          console.log('Discount created successfully:', result);
          setDiscountCode(newCode);
          localStorage.setItem('currentDiscountCode', JSON.stringify(newCode));
          localStorage.setItem('lastCodeDate', new Date().toDateString());
        } else {
          console.error('Failed to create discount');
        }
      } catch (error) {
        console.error('Error creating discount:', error);
      }
    };

    if (shouldGenerateNewCode()) {
      createNewDiscount();
    } else {
      const stored = localStorage.getItem('currentDiscountCode');
      if (stored) {
        const parsedCode = JSON.parse(stored);
        console.log('Retrieved stored discount:', parsedCode);
        setDiscountCode(parsedCode);
      }
    }

    const updateTimer = () => {
      const timeUntilNext = getTimeUntilMidnight();
      const hours = Math.floor(timeUntilNext / (60 * 60 * 1000));
      const minutes = Math.floor((timeUntilNext % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((timeUntilNext % (60 * 1000)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

      if (hours === 0 && minutes === 0 && seconds === 0) {
        createNewDiscount();
      }
    };

    // Initial update
    updateTimer();

    // Set up the interval
    timerRef.current = setInterval(updateTimer, 1000);

    // Cleanup function
    // return () => {
    //   if (timerRef.current) {
    //     clearInterval(timerRef.current);
    //   }
    // };

    const scratched = localStorage.getItem("scratched") === "true";

    if (!scratched && scContainer.current !== null) {
      const sc = new ScratchCard(scContainer.current, {
        scratchType: SCRATCH_TYPE.LINE,
        containerWidth: 500,
        containerHeight: 300,
        imageForwardSrc: '/scratchcard.png',
        imageBackgroundSrc: '/BackgroundImage.png',
        htmlBackground: '',
        clearZoneRadius: 20,
        nPoints: 30,
        pointSize: 4,
        percentToFinish: 10,
        callback: async () => {
          try {
            const res = await createDiscount({
              code: discountCode.code,
              description: `Discount code for ${discountCode.percentage}% off`,
              discount_percentage: discountCode.percentage,
              expiration_date: new Date(new Date().setHours(23, 59, 59, 999)).toISOString() // Sets expiration to end of current day
            });

            if (res == null) {
              throw new Error("Nie udało się zapisać kodu rabatowego");
            }

            localStorage.setItem("scratched", "true");
            toast.success(`Odkryłeś kod promocyjny ${discountCode.code} na ${discountCode.percentage}% zniżki!`);
          } catch {
            
          }
        }
      });

      sc.init().catch(() => {
        toast.error("Wystąpił błąd podczas ładowania zdrapki");
      });

      return () => {
        sc.clear();
      };
    }
  }, [discountCode.code, discountCode.percentage]);
  return(
    <>
      <div className='text-4xl max-lg:text-2xl max-lg:mt-20 max-lg:mb-[-60] text-[var(--text-color)]'>
        Codzienne promocje do odkrycia!
      </div>
      <div className='max-lg:scale-[65%]'>
        <div ref={scContainer} className='scContainer'>
          <div className='z-[-10] flex flex-col'>
            <p className='text-xl mt-2'>Zniżka: {discountCode.percentage}%</p>
            <p className='text-[2rem]'>{discountCode.code}</p> 
            
          </div>    
        </div>
        <div className='text-sm mt-10 text-[var(--text-color)]'>
          Następna promocja dostępna za: {timeLeft}
        </div>
      </div>
    </>
  );
}
