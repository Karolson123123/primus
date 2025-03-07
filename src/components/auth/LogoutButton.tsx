"use client";

import { logout } from "@/actions/logout";
import { Button } from "../ui/button";

/**
 * Interfejs właściwości przycisku wylogowania
 * @property children - Opcjonalna zawartość przycisku
 */
interface LogoutButtonProps {
    children?: React.ReactNode;
}

/**
 * Komponent przycisku wylogowania
 * Obsługuje proces wylogowania użytkownika i odświeżenie strony
 */
export const LogoutButton = ({
    children
}: LogoutButtonProps) => {
    /**
     * Obsługa kliknięcia przycisku wylogowania
     * Wywołuje akcję wylogowania i odświeża stronę po 2 sekundach
     */
    const onClick = () => {
        logout();
        setTimeout(() => {  
            window.location.reload();
        }, 2000);
    };
    
    return (
        <Button 
            onClick={onClick} 
            className="cursor-pointer hover:bg-[var(--darkeryellow)]"
        >
            {children || "Wyloguj"}
        </Button>
    );
};