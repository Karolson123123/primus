"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";

/**
 * Interfejs określający props komponentu
 * @property children - Elementy potomne do wyrenderowania
 */
interface AdminContentProps {
    children: React.ReactNode;
}

/**
 * Komponent warunkowego renderowania treści dla administratorów
 * Wyświetla zawartość tylko jeśli zalogowany użytkownik ma rolę administratora
 */
export const AdminContent = ({
    children,
}: AdminContentProps) => {
    // Pobranie roli aktualnie zalogowanego użytkownika
    const role = useCurrentRole();

    // Renderowanie treści tylko dla administratorów
    if (role === UserRole.ADMIN) {
        return <>{children}</>;
    }

    // Dla innych ról nie renderuj niczego
    return null;
};