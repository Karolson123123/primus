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
        async jwt({ token, user }) {
            // Initial token creation
            if (user) {
                try {
                    const existingUser = await getUserById(user.id);
                    const apiToken = await generateJWT(user.id);
                    
                    console.log("JWT Callback - New token creation:", {
                        userId: user.id,
                        role: existingUser?.role || "USER",
                        hasApiToken: !!apiToken
                    });

                    return {
                        ...token,
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: existingUser?.role || "USER",
                        apiToken,
                        sub: user.id,
                        tokenCreated: Date.now(),
                        isTwoFactorEnabled: existingUser?.isTwoFactorEnabled,
                        isOAuth: !!user.email
                    };
                } catch (error) {
                    console.error("JWT Callback - Error:", error);
                    return token;
                }
            }

            // Handle missing apiToken or role in existing session
            if (!token.apiToken || !token.role) {
                try {
                    const existingUser = await getUserById(token.sub);
                    const apiToken = await generateJWT(token.sub);
                    
                    console.log("JWT Callback - Restoring missing data:", {
                        userId: token.sub,
                        restoredRole: existingUser?.role || "USER",
                        hasNewApiToken: !!apiToken
                    });

                    return {
                        ...token,
                        role: existingUser?.role || "USER",
                        apiToken,
                        tokenCreated: Date.now()
                    };
                } catch (error) {
                    console.error("JWT Callback - Restoration error:", error);
                }
            }

            // Regular token refresh check
            const shouldRefresh = token.tokenCreated && 
                Date.now() - token.tokenCreated > 23 * 60 * 60 * 1000;

            if (shouldRefresh && token.sub) {
                try {
                    const existingUser = await getUserById(token.sub);
                    const apiToken = await generateJWT(token.sub);
                    
                    console.log("JWT Callback - Token refresh:", {
                        userId: token.sub,
                        currentRole: token.role,
                        hasNewApiToken: !!apiToken
                    });

                    return {
                        ...token,
                        role: existingUser?.role || token.role || "USER",
                        apiToken,
                        tokenCreated: Date.now()
                    };
                } catch (error) {
                    console.error("JWT Callback - Refresh error:", error);
                }
            }

            return token;
        },

        async session({ token, session }) {
            console.log("Session Callback - Token received:", JSON.stringify(token));
            
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as "ADMIN" | "USER";
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.isOAuth = token.isOAuth as boolean;
                session.user.apiToken = token.apiToken as string;

                // Add debug logging for token validation
                console.log("Session Callback - Token validation:", {
                    userId: session.user.id,
                    tokenPresent: !!session.user.apiToken,
                    tokenStart: session.user.apiToken?.substring(0, 20) + '...',
                    timestamp: new Date().toISOString()
                });

                console.log("Session Callback - Updated user data:", {
                    id: session.user.id,
                    email: session.user.email,
                    apiToken: session.user.apiToken ? "present" : "missing"
                });
            }

            return session;
        }
    },
    adapter: PrismaAdapter(db),
    session: {strategy: "jwt"},
    ...authConfig
});


