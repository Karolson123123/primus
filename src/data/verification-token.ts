import { db } from "@/lib/db";

/**
 * Pobiera token weryfikacyjny na podstawie tokenu
 * @param token - Token weryfikacyjny do sprawdzenia
 * @returns Token weryfikacyjny lub null w przypadku błędu
 */
export const getVerificationTokenByToken = async (
    token: string
) => {
    try {
        const verificationToken = await db.verificationToken.findUnique({
            where: { token }
        });

        return verificationToken;
    } catch {
        return null;
    }
}

/**
 * Pobiera token weryfikacyjny na podstawie adresu email
 * @param email - Adres email użytkownika
 * @returns Token weryfikacyjny lub null w przypadku błędu
 */
export const getVerificationTokenByEmail = async (
    email: string
) => {
    try {
        const verificationToken = await db.verificationToken.findFirst({
            where: { email }
        });

        return verificationToken;
    } catch {
        return null;
    }
}
