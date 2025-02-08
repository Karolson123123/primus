"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useEffect } from "react";


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
        <div className="grid place-items-center bg-[var(--black)] h-screen">
            <main className="p-8 bg-[var(--cardblack)]  rounded-lg  w-[50%] h-[50%] flex flex-col justify-around" >
                <h1 className="text-center font-semibold text-3xl ">Logowanie</h1>
                <LoginForm></LoginForm>
                
            </main>
        </div>
    )
};
