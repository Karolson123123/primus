"use server";

import * as z from "zod";
import { LoginSchema } from "@/schema";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { generateVerificationToken, generateTwoFactorToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import bcrypt from "bcrypt-edge";

/**
 * Akcja logowania użytkownika
 * Obsługuje proces uwierzytelniania, weryfikacji email i dwuetapowej weryfikacji
 * 
 * @param values - Dane logowania (email, hasło, kod weryfikacyjny)
 * @returns Obiekt z informacją o sukcesie/błędzie lub statusie 2FA
 */
export const login = async (values: z.infer<typeof LoginSchema>) => {
    // Walidacja danych wejściowych
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Nieprawidłowe dane logowania" };
    }

    const { email, password, code } = validatedFields.data;
    
    // Sprawdzenie czy użytkownik istnieje
    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Konto z podanym adresem email nie istnieje" };
    }
    
    // Weryfikacja hasła
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        return { error: "Nieprawidłowe hasło" };
    }

    // Weryfikacja adresu email
    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email);
        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token,
        );
        return { success: "Link weryfikacyjny został wysłany na podany adres email" };
    }

    // Obsługa weryfikacji dwuetapowej
    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            // Weryfikacja kodu 2FA
            const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

            if (!twoFactorToken || twoFactorToken.token !== code) {
                return { error: "Nieprawidłowy kod weryfikacyjny" };
            }

            if (new Date(twoFactorToken.expires) < new Date()) {
                return { error: "Kod weryfikacyjny wygasł" };
            }
            
            // Usunięcie wykorzystanego tokenu
            await db.twoFactorToken.delete({
                where: { id: twoFactorToken.id }
            });

            // Aktualizacja potwierdzenia 2FA
            const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
            if (existingConfirmation) {
                await db.twoFactorConfirmation.delete({
                    where: { id: existingConfirmation.id }
                });
            }

            await db.twoFactorConfirmation.create({
                data: { userId: existingUser.id }
            });
        } else {
            // Wysłanie nowego kodu 2FA
            const twoFactorToken = await generateTwoFactorToken(existingUser.email);
            await sendTwoFactorTokenEmail(
                twoFactorToken.email,
                twoFactorToken.token
            );
            return { twoFactor: true };
        }
    }

    // Logowanie użytkownika
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch(error.type) {
                case "CredentialsSignin":
                    return { error: "Nieprawidłowe dane logowania" };
                default:
                    return { error: "Wystąpił błąd podczas logowania" };
            }
        }
        throw error;
    }
};

