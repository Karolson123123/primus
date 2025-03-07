"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";

/**
 * Interfejs właściwości komponentu użytkownika
 * @property children - Elementy do wyrenderowania dla zalogowanych użytkowników
 */
interface UserContentProps {
    children: React.ReactNode;
}

/**
 * Komponent warunkowego renderowania treści dla zalogowanych użytkowników
 * Wyświetla zawartość tylko dla użytkowników z rolą USER
 */
export const UserContent = ({
    children,
}: UserContentProps) => {
    // Pobranie roli aktualnie zalogowanego użytkownika
    const role = useCurrentRole();

    // Renderowanie treści tylko dla zwykłych użytkowników
    if (role === UserRole.USER) {
        return <>{children}</>;
    }

    // Dla innych ról nie renderuj niczego
    return null;
};