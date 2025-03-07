"use server";

import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";

/**
 * Akcja weryfikacji adresu email użytkownika
 * Sprawdza poprawność tokenu i aktualizuje status weryfikacji
 * 
 * @param token - Token weryfikacyjny do sprawdzenia
 * @returns Obiekt z informacją o sukcesie lub błędzie
 */
export const newVerification = async (token: string) => {
    // Sprawdzenie czy token istnieje w bazie
    const existingToken = await getVerificationTokenByToken(token);
    if (!existingToken) {
        return { error: "Token weryfikacyjny jest nieprawidłowy" };
    }

    // Sprawdzenie czy token nie wygasł
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        return { error: "Token weryfikacyjny wygasł" };
    }

    // Sprawdzenie czy użytkownik istnieje
    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
        return { error: "Nie znaleziono użytkownika powiązanego z tym tokenem" };
    }

    // Aktualizacja statusu weryfikacji użytkownika
    await db.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.email
        }
    });

    // Usunięcie wykorzystanego tokenu
    await db.verificationToken.delete({
        where: { id: existingToken.id }
    });

    return { success: "Adres email został pomyślnie zweryfikowany" };
};