"use client";

import { useCurrentRole } from "@/hooks/use-current-role";

/**
 * Interfejs określający props komponentu
 * @property children - Elementy potomne do wyrenderowania
 */
interface GuestContentProps {
    children: React.ReactNode;
}

/**
 * Komponent warunkowego renderowania treści dla niezalogowanych użytkowników
 * Wyświetla zawartość tylko dla gości (użytkowników bez przypisanej roli)
 */
export const GuestContent = ({
    children,
}: GuestContentProps) => {
    // Pobranie roli aktualnie zalogowanego użytkownika
    const role = useCurrentRole();

    // Renderowanie treści tylko dla niezalogowanych użytkowników
    if (!role) {
        return <>{children}</>;
    }

    // Dla zalogowanych użytkowników nie renderuj niczego
    return null;
};