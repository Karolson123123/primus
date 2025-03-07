import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes";

/**
 * Middleware autentykacji Next.js
 * Zarządza dostępem do stron na podstawie stanu uwierzytelnienia
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Sprawdzanie typu trasy
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    
    // Zezwalaj na wszystkie żądania API związane z autoryzacją
    if (isApiAuthRoute) return null;

    // Przekieruj zalogowanych użytkowników z tras autoryzacji
    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return null;
    }

    // Przekieruj niezalogowanych użytkowników do strony logowania
    if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/login", nextUrl));
    }

    return null;
})

/**
 * Konfiguracja matchera dla middleware
 * Określa, które ścieżki powinny być obsługiwane
 */
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}