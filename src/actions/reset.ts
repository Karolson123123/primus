"use server";

import * as z from "zod";
import { ResetSchema } from "@/schema";
import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";


/**
 * Akcja resetowania hasła użytkownika
 * Generuje token resetowania i wysyła email z linkiem do zmiany hasła
 * 
 * @param values - Dane resetowania (email)
 * @returns Obiekt z informacją o sukcesie lub błędzie
 */
export const reset = async (values: z.infer<typeof ResetSchema>) => {
    // Walidacja adresu email
    const validatedFields = ResetSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Nieprawidłowy format adresu email" };
    }

    const { email } = validatedFields.data;

    // Sprawdzenie czy użytkownik istnieje
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
        return { error: "Nie znaleziono konta o podanym adresie email" };
    }

    // Generowanie i wysyłanie tokenu resetowania hasła
    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token,
    );

    return { 
        success: "Link do zresetowania hasła został wysłany na podany adres email" 
    };
}