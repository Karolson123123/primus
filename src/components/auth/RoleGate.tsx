"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";
import { FormError } from "../FormError";

/**
 * Interfejs właściwości komponentu kontroli dostępu
 * @property children - Elementy do wyrenderowania dla uprawnionych użytkowników
 * @property allowedRole - Rola wymagana do wyświetlenia zawartości
 */
interface RoleGateProps {
    children: React.ReactNode;
    allowedRole: UserRole;
};

/**
 * Komponent kontroli dostępu oparty na rolach użytkowników
 * Wyświetla zawartość tylko dla użytkowników z odpowiednią rolą
 */
export const RoleGate = ({
    children,
    allowedRole,
}: RoleGateProps) => {
    // Pobranie roli aktualnie zalogowanego użytkownika
    const role = useCurrentRole();

    // Sprawdzenie uprawnień i wyświetlenie komunikatu błędu jeśli brak dostępu
    if (role !== allowedRole) {
        return (
            <FormError 
                message="Nie masz uprawnień, żeby widzieć zawartość tej strony" 
            />
        );
    }

    // Renderowanie zawartości dla uprawnionych użytkowników
    return <>{children}</>;
};