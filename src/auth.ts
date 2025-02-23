import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import NextAuth, { type DefaultSession } from "next-auth"
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

import { SignJWT } from 'jose';

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


const generateJWT = async (userId: string) => {
    console.log("GenerateJWT - Starting for user:", userId);
    
    if (!process.env.JWT_SECRET) {
        console.error("GenerateJWT - Missing JWT_SECRET");
        throw new Error("JWT_SECRET is not configured");
    }
    
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        // Add more claims to the token
        const token = await new SignJWT({
            sub: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
            type: 'access_token',
            jti: crypto.randomUUID() // Add unique identifier
        })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(secret);
        
        console.log("GenerateJWT - Token generated with claims for user:", userId);
        return token;
    } catch (error) {
        console.error("GenerateJWT - Error:", error);
        throw error;
    }
};

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
       async linkAccount({ user }){
        await db.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() }
        })
       }
    },
    callbacks: {
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
        
        // Update the JWT callback to handle token refresh and validation
        async jwt({ token, user, account, trigger }) {
            // Debug logging
            console.log("JWT Callback - Starting state:", {
                trigger,
                hasToken: !!token,
                hasUser: !!user,
                hasAccount: !!account,
                tokenIsOAuth: token?.isOAuth,
                accountProvider: account?.provider,
                provider: token?.provider
            });

            // Initial sign in with user data
            if (user) {
                const existingUser = await getUserById(user.id);
                if (!existingUser) return token;

                const apiToken = await generateJWT(user.id);
                const provider = account?.provider || 'credentials';
                
                return {
                    ...token,
                    isOAuth: provider !== 'credentials',  // Simplify OAuth check
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

            // For all subsequent requests
            return {
                ...token,
                isOAuth: token.provider !== 'credentials',  // Ensure isOAuth matches provider
                provider: token.provider || 'credentials'    // Ensure provider is always set
            };
        },

        async session({ token, session }) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as "ADMIN" | "USER";
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
                session.user.name = token.name;
                session.user.email = token.email;
                // Simplify isOAuth logic to directly use token provider
                session.user.isOAuth = token.provider !== 'credentials';
                session.user.apiToken = token.apiToken as string;

                console.log("Session Callback - Final state:", {
                    userId: session.user.id,
                    provider: token.provider || 'credentials',
                    isOAuth: session.user.isOAuth,
                    tokenIsOAuth: token.isOAuth
                });
            }

            return session;
        }
    },
    adapter: PrismaAdapter(db),
    session: {strategy: "jwt"},
    ...authConfig
});


