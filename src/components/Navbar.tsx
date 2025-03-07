"use client";

import { UserButton } from "@/components/auth/UserButton";
import Logo from "@/components/Logo";
import NavButton from "@/components/NavButton";
import { useState, useEffect } from 'react';
import { UserContent } from "./auth/UserContent";
import { AdminContent } from "./auth/AdminContent";
import { GuestContent } from "./auth/GuestContent";
import { Button } from "./ui/button";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./auth/LogoutButton";

/**
 * Komponent nawigacji responsywnej
 * Wyświetla różne układy dla wersji mobilnej i desktopowej
 */
export const Navbar = () => {
    // Stan przechowujący szerokość okna przeglądarki
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setIsClosing(false);
        }, 300); // Duration matches animation
    };

    // Efekt nasłuchujący zmiany rozmiaru okna
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Renderowanie wersji mobilnej
    if (windowWidth < 1024) {
        return (
            <>
                <nav className="fixed top-0 left-0 right-0 h-16 bg-[--cardblack] 
                    backdrop-blur-md z-[102] flex justify-between items-center w-full px-4
                    border-b border-[var(--yellow)]"
                >
                    <Logo />
                    <div className="flex items-center gap-2 ">
                        <ThemeToggle/>
                        <button
                            onClick={() => isMenuOpen ? handleClose() : setIsMenuOpen(true)}
                            className="text-[var(--yellow)] focus:outline-none"
                        >
                            {isMenuOpen ? (
                                <X className="h-8 w-8" />
                            ) : (
                                <Menu className="h-8 w-8" />
                            )}
                        </button>
                    </div>
                </nav>

                {(isMenuOpen || isClosing) && (
                    <div className={`fixed inset-0 bg-[--cardblack] z-[101] pt-20 px-6 overflow-y-auto
                        ${isClosing ? 'animate-fade-out-right' : 'animate-fade-in-right'}`}
                    >
                        <div className="flex flex-col">
                            <Link 
                                href="/" 
                                className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4"
                                onClick={handleClose}
                            >
                                Strona główna
                            </Link>
                            <hr className="border-[var(--yellow)] opacity-30" />
                            <Link 
                                href="/discounts" 
                                className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4"
                                onClick={handleClose}
                            >
                                Promocje
                            </Link>
                            <hr className="border-[var(--yellow)] opacity-30" />
                            <Link 
                                href="/map" 
                                className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4"
                                onClick={handleClose}
                            >
                                Mapa
                            </Link>
                            <hr className="border-[var(--yellow)] opacity-30" />
                            
                            <UserContent>
                                <div className="flex flex-col">
                                    <Link href="/client" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Ustawienia konta
                                    </Link>
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/settings" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Ustawienia aplikacji
                                    </Link>
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/stations" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Stacje
                                    </Link>
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/charging" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Ładowanie
                                    </Link>
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/charging-sessions" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Historia ładowań
                                    </Link>
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/payments" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Historia płatności
                                    </Link>
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/vehicles" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Pojazdy
                                    </Link>
                                    <LogoutButton/>
                                </div>
                                
                            </UserContent>
                            
                            <AdminContent>
                                <div className="flex flex-col">
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/client" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Ustawienia konta
                                    </Link>
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/settings" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Ustawienia aplikacji
                                    </Link>
                                    <hr className="border-[var(--yellow)] opacity-30" />
                                    <Link href="/stations" className="text-[--text-color] hover:text-[var(--yellow)] transition text-xl py-4" onClick={handleClose}>
                                        Stacje
                                    </Link>
                                    <LogoutButton/>
                                </div>
                            </AdminContent>

                            <GuestContent>
                                <hr className="border-[var(--yellow)] opacity-30 mb-4" />
                                <Link href="/login" onClick={handleClose}>
                                    <Button className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] w-full text-xl py-6">
                                        Zaloguj się
                                    </Button>
                                </Link>
                            </GuestContent>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Renderowanie wersji desktopowej
    return (
        <nav className="flex sticky top-0 h-20 bg-[var(--cardblack)] z-[60] 
            justify-between items-center w-full p-2 pointer-events-auto"
        >
            <Logo />
            
            <div className="flex items-center gap-8">
                <NavButton text="Strona główna" href="/" />
                <NavButton text="Promocje" href="/discounts" />
                <NavButton text="Mapa" href="/map" />
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <UserContent>
                    <UserButton />
                </UserContent>
                <AdminContent>
                    <UserButton />
                </AdminContent>
                <GuestContent>
                    <Link href="/login">
                        <Button className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]">
                            Zaloguj się
                        </Button>
                    </Link>
                </GuestContent>
            </div>
        </nav>
    );
};