import { UserRole } from "@prisma/client";
import * as z from "zod";

/**
 * Schema dla ustawień użytkownika
 * Zawiera walidację danych profilowych i ustawień bezpieczeństwa
 */
export const SettingsSchema = z.object({
    name: z.optional(z.string()),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(1, "Obecne hasło jest wymagane")),
    newPassword: z.optional(z.string().min(6, "Minimum 6 znaków")),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    isTwoFactorEnabled: z.optional(z.boolean()),
});

/**
 * Schema dla logowania
 * Sprawdza poprawność danych logowania wraz z kodem 2FA
 */
export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email jest wymagany"
    }),
    password: z.string().min(1, {
        message: "Hasło jest wymagane"
    }),
    code: z.optional(z.string()),
});

/**
 * Schema dla rejestracji
 * Waliduje dane nowego użytkownika
 */
export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email jest wymagany"
    }),
    password: z.string().min(6, {
        message: "Hasło musi mieć co najmniej 6 znaków"
    }),
    name: z.string().min(1, {
        message: "Nazwa użytkownika jest wymagana"
    })
});

/**
 * Schema dla resetowania hasła
 * Sprawdza poprawność adresu email
 */
export const ResetSchema = z.object({
    email: z.string().email({
        message: "Email jest wymagany"
    }),
});

/**
 * Schema dla nowego hasła
 * Waliduje wymagania dla nowego hasła
 */
export const NewPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Hasło musi mieć co najmniej 6 znaków"
    }),
});