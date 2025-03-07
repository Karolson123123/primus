"use server";

import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * Akcja sprawdzająca uprawnienia administratora
 * @returns { success: string } - Komunikat sukcesu jeśli użytkownik ma uprawnienia administratora
 * @returns { error: string } - Komunikat błędu jeśli użytkownik nie ma uprawnień
 */
export const admin = async () => {
    // Pobierz aktualną rolę użytkownika
    const role = await currentRole();

    // Sprawdź czy użytkownik ma rolę administratora
    if (role === UserRole.ADMIN) {
        return { success: "Masz uprawnienia administratora!" };
    }

    return { error: "Brak uprawnień administratora!" };
}