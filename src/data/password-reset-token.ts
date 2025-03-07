import { db } from "@/lib/db";

/**
 * Pobiera token resetowania hasła na podstawie tokenu
 * @param token - Token resetowania hasła
 * @returns Token resetowania hasła lub null w przypadku błędu
 */
export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await db.passwordResetToken.findUnique({
            where: { token }
        });

        return passwordResetToken;
    } catch {
        return null;
    }
};

/**
 * Pobiera token resetowania hasła na podstawie adresu email
 * @param email - Adres email użytkownika
 * @returns Token resetowania hasła lub null w przypadku błędu
 */
export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const passwordResetToken = await db.passwordResetToken.findFirst({
            where: { email }
        });

        return passwordResetToken;
    } catch {
        return null;
    }
}

