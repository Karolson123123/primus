import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { LoginSchema } from "@/schema";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";

/**
 * Konfiguracja uwierzytelniania NextAuth
 * Zawiera dostawców logowania oraz logikę autoryzacji
 */
export default {
    providers: [
        // Logowanie przez GitHub
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        // Logowanie przez Google
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        // Logowanie przez email i hasło
        Credentials({
            /**
             * Funkcja autoryzująca użytkownika
             * @param credentials - Dane logowania (email, hasło)
             * @returns Dane użytkownika lub null w przypadku błędu
             */
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials);

                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;
                    
                    const user = await getUserByEmail(email);
                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(
                        password, 
                        user.password
                    );

                    if (passwordsMatch) return user;
                }

                return null;
            }
        })
    ],
} satisfies NextAuthConfig