"use server";

import * as z from "zod";
import { NewPasswordSchema } from "@/schema";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * Akcja zmiany hasła użytkownika
 * Weryfikuje token resetu hasła i aktualizuje hasło w bazie danych
 * 
 * @param values - Nowe hasło do ustawienia
 * @param token - Token resetowania hasła
 * @returns Obiekt z informacją o sukcesie lub błędzie
 */
export const newPassword = async (
    values: z.infer<typeof NewPasswordSchema>,
    token?: string | null,
) => {
    // Sprawdzenie czy token istnieje
    if (!token) {
        return { error: "Brak tokenu resetowania hasła" };
    }

    // Walidacja nowego hasła
    const validatedFields = NewPasswordSchema.safeParse(values)
    if (!validatedFields.success) {
        return { error: "Nieprawidłowy format hasła" };
    }

    const { password } = validatedFields.data;
    
    // Weryfikacja tokenu resetowania hasła
    const existingToken = await getPasswordResetTokenByToken(token);
    if (!existingToken) {
        return { error: "Nieprawidłowy token resetowania hasła" };
    }

    // Sprawdzenie ważności tokenu
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        return { error: "Token resetowania hasła wygasł" };
    }

    // Weryfikacja istnienia użytkownika
    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
        return { error: "Nie znaleziono użytkownika o podanym adresie email" };
    }

    // Hashowanie i aktualizacja hasła
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
    });

    // Usunięcie wykorzystanego tokenu
    await db.passwordResetToken.delete({
        where: { id: existingToken.id }
    });

    return { success: "Hasło zostało pomyślnie zmienione" };
}

