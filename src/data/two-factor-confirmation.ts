import { db } from "@/lib/db";

/**
 * Pobiera potwierdzenie dwuskładnikowej autentykacji dla użytkownika
 * @param userId - ID użytkownika
 * @returns Obiekt potwierdzenia lub null w przypadku błędu
 */
export const getTwoFactorConfirmationByUserId = async (
    userId: string
) => {
    try {
        const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
            where: { userId }
        });

        return twoFactorConfirmation;
    } catch {
        return null;
    }
}