import ResetForm from "@/components/auth/ResetForm";
import Logo from "@/components/Logo";
import Link from "next/link";

/**
 * Strona resetowania hasła
 * Wyświetla formularz umożliwiający zresetowanie hasła poprzez email
 */
export default function ResetPage() {
    return (
        <>
            {/* Logo w lewym górnym rogu */}
            <div className="absolute top-4 left-4 z-10">
                <Logo />
            </div>

            {/* Główny kontener z formularzem resetowania hasła */}
            <div className="grid place-items-center bg-[var(--black)] min-h-screen p-4">
                <main className="p-4 md:p-8 bg-[var(--cardblack)] rounded-lg 
                    w-[95%] md:w-[70%] lg:w-[50%] 
                    min-h-[400px] md:min-h-[450px] 
                    flex flex-col justify-around"
                >
                    <h1 className="text-center font-semibold text-2xl md:text-3xl mt-4">
                        Zapomniałeś hasła?
                    </h1>
                    <ResetForm />
                    <Link 
                        href={"/login"} 
                        className="text-center text-sm md:text-base mb-4 hover:text-[var(--yellow)] transition-colors"
                    >
                        Powrót do logowania
                    </Link>
                </main>
            </div>
        </>
    );
}
