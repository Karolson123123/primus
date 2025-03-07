"use server";

import * as z from "zod";
import { RegisterSchema } from "@/schema";
import bcrypt from "bcrypt-edge";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

/**
 * Akcja rejestracji nowego użytkownika
 * Obsługuje proces tworzenia konta i wysyłania emaila weryfikacyjnego
 * 
 * @param values - Dane rejestracji (email, hasło, nazwa)
 * @returns Obiekt z informacją o sukcesie lub błędzie
 */
export const register = async (values: z.infer<typeof RegisterSchema>) => {
    // Walidacja danych wejściowych
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Nieprawidłowe dane rejestracji" };
    }

    const { email, password, name } = validatedFields.data;

    // Sprawdzenie czy użytkownik już istnieje
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return { error: "Konto z tym adresem email już istnieje" };
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Utworzenie nowego użytkownika
    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // Generowanie i wysyłanie tokenu weryfikacyjnego
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
    );

    return { success: "Konto zostało utworzone. Sprawdź swoją skrzynkę email aby dokończyć rejestrację." };
}