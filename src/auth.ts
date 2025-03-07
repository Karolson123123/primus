import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import NextAuth, { type DefaultSession } from "next-auth"
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { SignJWT } from 'jose';

/**
 * Interfejs pojazdu użytkownika
 */
interface Vehicle {
    id: number;
    license_plate: string;
    brand: string;
    battery_capacity_kWh: number;
    battery_condition: number;
    max_charging_powerkWh: number;
    created_at: string;
    user_id: number;
}

/**
 * Generuje token JWT dla użytkownika
 * @param userId - ID użytkownika
 * @returns Token JWT
 */
const generateJWT = async (userId: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Brak skonfigurowanego klucza JWT");
    }
    
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({
            sub: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Ważny 24h
            type: 'access_token',
            jti: crypto.randomUUID()
        })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(secret);
        
        return token;
    } catch (error) {
        throw error;
    }
};

/**
 * Rozszerzony typ użytkownika z dodatkowymi polami
 */
export type ExtendedUser = DefaultSession["user"] & {
    role: "ADMIN" | "USER",
    isTwoFactorEnabled: boolean,
    isOAuth: boolean, 
    vehicles: Vehicle[],
    apiToken?: string  
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}

export const { 
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    pages: {
        signIn: "/login",
        error: "/auth/error"
    },
    events: {
        // Aktualizacja daty weryfikacji email po połączeniu konta
        async linkAccount({ user }){
            await db.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            })
        }
    },
    callbacks: {
        // Sprawdzanie czy użytkownik może się zalogować
        async signIn({ user, account }) {
            if (account?.provider !== "credentials") return true;

            const existingUser = await getUserById(user.id);
            if (!existingUser?.emailVerified) return false;
            
            if (existingUser.isTwoFactorEnabled) {
                const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
                if (!twoFactorConfirmation) return false;
                
                await db.twoFactorConfirmation.delete({
                    where: { id: twoFactorConfirmation.id }
                });
            }
            
            return true;  
        },
        
        // Rozszerzanie tokenu JWT o dodatkowe dane
        async jwt({ token, user, account }) {
            if (user) {
                const existingUser = await getUserById(user.id);
                if (!existingUser) return token;

                const apiToken = await generateJWT(user.id);
                const provider = account?.provider || 'credentials';
                
                return {
                    ...token,
                    isOAuth: provider !== 'credentials',
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                    isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
                    apiToken,
                    sub: user.id,
                    tokenCreated: Date.now(),
                    provider
                };
            }

            return {
                ...token,
                isOAuth: token.provider !== 'credentials',
                provider: token.provider || 'credentials'
            };
        },

        // Aktualizacja danych sesji na podstawie tokenu
        async session({ token, session }) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as "ADMIN" | "USER";
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.isOAuth = token.provider !== 'credentials';
                session.user.apiToken = token.apiToken as string;
            }

            return session;
        }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig
});

