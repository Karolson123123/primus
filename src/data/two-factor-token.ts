import { db } from "@/lib/db";

/**
 * Pobiera token dwuskładnikowej autentykacji na podstawie tokenu
 * @param token - Token uwierzytelniający
 * @returns Token dwuskładnikowy lub null w przypadku błędu
 */
export const getTwoFactorTokenByToken = async (token: string) => {
    try {
        const twoFactorToken = await db.twoFactorToken.findUnique({
            where: { token }
        });

        return twoFactorToken;
    } catch {
        return null;
    }
};

/**
 * Pobiera token dwuskładnikowej autentykacji na podstawie adresu email
 * @param email - Adres email użytkownika
 * @returns Token dwuskładnikowy lub null w przypadku błędu
 */
export const getTwoFactorTokenByEmail = async (email: string) => {
    try {
        const twoFactorToken = await db.twoFactorToken.findFirst({
            where: { email }
        });

        return twoFactorToken;
    } catch {
        return null;
    }
}