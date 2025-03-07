import { db } from "@/lib/db";

/**
 * Pobiera konto użytkownika na podstawie jego ID
 * @param userId - ID użytkownika
 * @returns Obiekt konta lub null w przypadku błędu
 */
export const getAccountByUserId = async (userId: string) => {
    try {
        const account = await db.account.findFirst({
            where: { userId }
        });
        return account;
    } catch {
        return null;
    }
}