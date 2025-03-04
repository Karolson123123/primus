"use client";

import { UserButton } from "@/components/auth/UserButton";
import Logo from "@/components/Logo";
import NavButton from "@/components/NavButton";
import NavButtonPhone from "@/components/NavButtonPhone";
import { useState, useEffect } from 'react';

export const Navbar = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    if (windowWidth < 1024) {
        return (
        <div className="h-20 fixed w-screen flex items-end z-[50]">
            {/* Mobile Navigation */}
            <nav className="flex fixed bottom-0 h-20 bg-[rgba(14,13,13,0.95)] 
            backdrop-blur-md z-[1000000] justify-around items-center w-full p-2 
            pointer-events-auto">
                <NavButtonPhone href="/map" src="/Map.svg" />
                <NavButtonPhone href="/" src="/Home.svg" />
                <NavButtonPhone href="/discounts" src="/Percent.svg" />
            </nav>
        </div>
        )
    }
    return (
        <nav className="flex sticky top-0 h-20 bg-[rgba(14,13,13,0.9)] z-[60] 
        justify-between items-center w-full p-2 pointer-events-auto"
        >
                {/* Desktop Navigation */}
                <Logo />
                <div className="flex items-center gap-8">
                    <NavButton text="Strona Główna" href="/" />
                    <NavButton text="Przeceny" href="/discounts" />
                    <NavButton text="Mapa" href="/map" />
                </div>
                <UserButton />
            </nav>
    );
};