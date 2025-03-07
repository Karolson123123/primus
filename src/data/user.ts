import { db } from "@/lib/db";

/**
 * Pobiera użytkownika na podstawie adresu email
 * @param email - Adres email użytkownika
 * @returns Dane użytkownika lub null w przypadku błędu
 */
export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({ where: { email } });
        return user;
    } catch {
        return null;
    }
};

/**
 * Pobiera użytkownika na podstawie ID
 * @param id - Identyfikator użytkownika
 * @returns Dane użytkownika lub null w przypadku błędu
 */
export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({ where: { id } });
        return user;
    } catch {
        return null;
    }
};