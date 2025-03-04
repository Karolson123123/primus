"use client";

import { Bebas_Neue } from "next/font/google";

import { GuestContent } from "@/components/auth/GuestContent";
import { Button } from "@/components/ui/button";
import ClientMap from "@/components/ClientMap";
import { Navbar } from "@/components/Navbar";

const bebasNeue = Bebas_Neue({
  weight: "400"
});


export default function Home() {

  return (
    <>
        <Navbar />

        <main className="bg-black">
            <div className="h-screen w-full bg-cover scale-x-[-1] opacity-50 mt-[-5rem]" style={{backgroundImage: "url('BackgroundImage.jpg')"}}></div>
            <div className="h-screen w-full opacity-15 absolute top-0 bg-[linear-gradient(90deg,_rgba(190,140,2,1)_0%,_rgba(0,212,255,0)_100%)]"></div>
            <div className="h-screen w-full absolute top-0 pt-[17rem] max-lg:pt-[10rem] p-16">
              <div className="w-2/3 max-lg:w-full flex flex-col gap-8 animate-fadein">
                <h1 className={`${bebasNeue.className} text-8xl max-lg:text-[4rem]`}>ŁADOWANIE JEDNYM <br /> KLIKNIĘCIEM</h1>
                <p className="text-2xl w-[50%] max-lg:w-full max-lg:text-xl text-justify">Nasza aplikacja pozwala na ładowanie, ładowanie i ładowanie, Dzięki czemu jesteśmy najlepszą opcja na rynku. ALE to nie wszystko, ponieważ oferujemy również ładowanie!</p>
                <GuestContent>
                  <div className="flex flex-col w-1/2 max-lg:w-full gap-4">
                    <a href={'/login'} className="max-lg:w-full">
                      <Button className="px-6 py-3 bg-[var(--yellow)] text-xl max-lg:text-lg font-semibold 
                        rounded-lg hover:bg-[var(--darkeryellow)] w-[18rem] max-lg:w-full h-16 
                        hover:scale-[1.1] transition-transform">
                        ZALOGUJ SIĘ
                      </Button>
                    </a>
                    <a href={'/register'} className="max-lg:w-full">
                      <button className="px-6 py-3 text-[var(--yellow)] text-xl max-lg:text-lg 
                        font-semibold hover:bg-[var(--darkeryellow)] hover:text-white rounded-lg 
                        w-[18rem] max-lg:w-full h-16 border-[var(--yellow)] border-[5px] 
                        hover:border-0 hover:scale-[1.1] transition-transform">
                        ZAREJESTRUJ SIĘ
                      </button>
                    </a>
                  </div>
                </GuestContent>
              </div>
            </div>
        </main>

        <section className="text-center my-8">
          <a href="/stations" className={`${bebasNeue.className} text-6xl text-center my-4`}>NASZE PUNKTY ŁADOWANIA</a>
        </section>
        <ClientMap/>
    </>



  );
};