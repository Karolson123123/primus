import { PrismaClient } from "@prisma/client";

/**
 * Deklaracja globalna dla instancji PrismaClient
 * Zapobiega tworzeniu wielu połączeń podczas hot-reloadu w trybie deweloperskim
 */
declare global {
    var prisma: PrismaClient | undefined;
}

/**
 * Pojedyncza instancja klienta Prisma dla całej aplikacji
 * Wykorzystuje istniejącą instancję globalną lub tworzy nową
 */
export const db = globalThis.prisma || new PrismaClient();

// W trybie deweloperskim zapisuje instancję globalnie dla hot-reloadu
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;