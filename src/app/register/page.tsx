import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import Logo from "@/components/Logo";

export default function Register() {
    return (
        <>
            <div className="absolute top-4 left-4 z-10">
                <Logo />
            </div>
            <div className="grid place-items-center bg-[var(--black)] min-h-screen p-4">
                <main className="p-4 md:p-8 bg-[var(--cardblack)] rounded-lg 
                    w-[95%] md:w-[70%] lg:w-[50%] 
                    min-h-[400px] md:min-h-[450px] 
                    flex flex-col justify-around"
                >
                    <h1 className="text-center font-semibold text-2xl md:text-3xl mt-4">
                        Rejestracja
                    </h1>
                    <RegisterForm />
                    <Link 
                        href={"/login"} 
                        className="text-center text-sm md:text-base mb-4 hover:text-[var(--yellow)] transition-colors"
                    >
                        Masz już konto? <b>Zaloguj się</b>
                    </Link>
                </main>
            </div>
        </>
    );
}
