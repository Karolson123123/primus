"use client";

import { ScratchCard, SCRATCH_TYPE } from 'scratchcard-js';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

/**
  TO WAŻNE
  Z backendu brać expiration date i jeśli jest po tej dacie to localstorage.removeKey("scrtched")
 */


export default function DiscountPage() {
  const scContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // localStorage.setItem("scratched", "false");
    let i = 1;
    let scratched = false;
    const storedScratchedState = localStorage.getItem("scratched");
    toast(`${i++} State: ${storedScratchedState}`);
    console.log(`${i++} State: ${storedScratchedState}`);
    if (storedScratchedState === "true") {
      scratched = true
      console.log("halo")
    }
    toast(`${i++}. ${scratched}`);
    console.log(`${i++}. ${scratched}`);
    if (!scratched) {
      if (scContainer.current !== null) {
        const sc = new ScratchCard(scContainer.current, {
          scratchType: SCRATCH_TYPE.LINE,
          containerWidth: 500,
          containerHeight: 300,
          imageForwardSrc: '/discount.png',
          imageBackgroundSrc: '/BackgroundImage.png',
          htmlBackground: '',
          clearZoneRadius: 20,
          nPoints: 30,
          pointSize: 4,
          percentToFinish: 10,
          callback: () => {
            toast('Gratulacje zdrapałeś zdrapkę!');
            localStorage.setItem("scratched", "true");
          }
        //   brushSrc: "/basic-marker.png",
        //   enabledPercentUpdate: true
        })
        sc.init().then(() => {
          // sc.canvas.addEventListener('scratch.move', () => {
          //   const percent = sc.getPercent().toFixed(2)
          //   // console.log(percent)
          // })
        }).catch((error) => {
          alert(error.message);
        });

        return () => {
            sc.clear();
        }
      }
    }
  }, [scContainer]);
  
  return(
      <>
          <div ref={scContainer} className='scContainer'>
            <div className='z-[-10]'>
                <p className='text-[2rem]'>test</p>
            </div>    
          </div>

      </>
  );
};
