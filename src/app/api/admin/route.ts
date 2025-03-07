import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Endpoint sprawdzający uprawnienia administratora
 * @returns Response 200 jeśli użytkownik jest adminem, 403 jeśli nie ma uprawnień
 */
export async function GET() {
    // Pobranie roli aktualnie zalogowanego użytkownika
    const role = await currentRole();
    
    // Sprawdzenie czy użytkownik ma rolę administratora
    if (role === UserRole.ADMIN) {
        return new NextResponse(null, { status: 200 });
    }

    // Zwrócenie błędu braku dostępu dla innych ról
    return new NextResponse(null, { status: 403 });
}


