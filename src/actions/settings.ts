"use server";

import * as z from "zod";

import { db } from "@/lib/db";
import { SettingsSchema } from "@/schema";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

// Funkcja do aktualizacji ustawień użytkownika
export const settings = async (
    values: z.infer<typeof SettingsSchema>
) => {
    // Pobierz aktualnie zalogowanego użytkownika
    const user = await currentUser();
    if (!user) {
        return { error: "Nieautoryzowane" }
    }

    // Pobierz użytkownika z bazy danych na podstawie ID
    const dbUser = await getUserById(user.id);
    
    if (!dbUser) {
        return { error: "Nieautoryzowane" }
    }

    // Jeśli użytkownik korzysta z OAuth, wyczyść odpowiednie pola
    if (user.isOAuth) {
        values.email = undefined;
        values.password = undefined;
        values.newPassword = undefined;
        values.isTwoFactorEnabled = undefined;
    }

    // Sprawdź, czy email został zmieniony
    if (values.email && values.email !== user.email) {
        const existingUser = await getUserByEmail(values.email);
    
        if (existingUser && existingUser.id !== user.id) {
            return { error: "Email zajęty" }
        }

        // Wygeneruj token weryfikacyjny i wyślij email weryfikacyjny
        const verificationToken = await generateVerificationToken(
            values.email
        );

        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token,
        )

        return { success: "Email weryfikacyjny wysłany" }
    }

    // Sprawdź poprawność hasła i zaktualizuj hasło
    if (values.password && values.newPassword && dbUser.password) {
        const passwordsMatch = await bcrypt.compare(
            values.password,
            dbUser.password,
        );

        if (!passwordsMatch) {
            return { error: "Błędne hasło" }
        }

        const hashedPassword = await bcrypt.hash(
            values.newPassword,
            10,
        );

        values.password = hashedPassword
        values.newPassword = undefined
    }

    // Zaktualizuj dane użytkownika w bazie danych
    await db.user.update({
        where: { id: dbUser.id},
        data: {
            ...values,
        }
    });

    return { success: "Zmieniono dane" }
}
