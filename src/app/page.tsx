import Image from "next/image";
import Link from "next/link";
import { Bebas_Neue } from "next/font/google";

const bebasNeue = Bebas_Neue({
  weight: "400"
});

export default function Home() {
  return (
    <>
        <nav className="flex justify-between p-2 bg-[rgba(14,13,13,0.9)] sticky top-0 z-[100] h-20">
          <Link href={"/"}>
            <Image src={'Logo.svg'} alt="Logo EVolve" width={64} height={64}></Image>
          </Link>
          <div className="flex items-center gap-8">
              <Link href={'/login'} className="px-6 py-3 text-[var(--yellow)] text-xl font-semibold rounded-lg hover:bg-[var(--darkeryellow)] hover:text-white">ZALOGUJ SIĘ</Link>
              <Link href={'/register'} className="px-6 py-3 bg-[var(--yellow)] text-xl font-semibold rounded-lg hover:bg-[var(--darkeryellow)]">ZAREJESTRUJ SIĘ</Link>
          </div>
        </nav>

        <main className="bg-black">
            <div className="h-screen w-full bg-cover scale-x-[-1] opacity-50 mt-[-5rem]" style={{backgroundImage: "url('BackgroundImage.jpg')"}}></div>
            <div className="h-screen w-full opacity-15 absolute top-0 bg-[linear-gradient(90deg,_rgba(190,140,2,1)_0%,_rgba(0,212,255,0)_100%)]"></div>
            <div className="h-screen w-full absolute top-0 pt-[17rem] p-16">
              <div className="w-2/3 flex flex-col gap-8 animate-fadein">
                <h1 className={`${bebasNeue.className} text-8xl `}>ŁADOWANIE JEDNYM <br /> KLIKNIĘCIEM</h1>
                <p className="text-2xl w-[45ch] text-justify">Nasza aplikacja pozwala na ładowanie, ładowanie i ładowanie, Dzięki czemu jesteśmy najlepszą opcja na rynku. ALE to nie wszystko, ponieważ oferujemy również ładowanie!</p>
                <div className="flex flex-col w-1/2 gap-4">
                  <button className="px-6 py-3 bg-[var(--yellow)] text-xl font-semibold rounded-lg hover:bg-[var(--darkeryellow)] w-[18rem] h-16">ZAREJESTRUJ SIĘ</button>
                  <button className="px-6 py-3 text-[var(--yellow)] text-xl font-semibold hover:bg-[var(--darkeryellow)] hover:text-white rounded-lg w-[18rem] h-16 border-[var(--yellow)] border-[5px] hover:border-0">ZALOGUJ SIĘ</button>
                </div>
              </div>
            </div>
        </main>

        <section>
          <h1 className={`${bebasNeue.className} text-5xl text-center my-4`}>NASZE PUNKTY ŁADOWANIA</h1>
        </section>

    </>



  );
};
