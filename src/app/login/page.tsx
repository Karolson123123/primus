"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useEffect } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function Login() {
    useEffect(() => {
        const hasReloaded = sessionStorage.getItem("hasReloaded");
        if (!hasReloaded) {
            sessionStorage.setItem("hasReloaded", "true");
            window.location.reload();
        } else {
            sessionStorage.removeItem("hasReloaded");
        }
    }, []);
    
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
                        Logowanie
                    </h1>
                    <LoginForm />
                    <Link 
                        href={"/register"} 
                        className="text-center text-sm md:text-base mb-4 hover:text-[var(--yellow)] transition-colors"
                    >
                        Nie masz jeszcze konta? <b>Zarejestruj się</b>
                    </Link>
                </main>
            </div>
        </>
    );
}
