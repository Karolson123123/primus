"use server";

import { signOut } from "@/auth";

/**
 * Akcja wylogowania użytkownika
 * Kończy aktualną sesję i usuwa dane uwierzytelniające
 * 
 * @returns Promise<void>
 * @throws Error w przypadku niepowodzenia wylogowania
 */
export const logout = async () => {
    try {
        await signOut();
    } catch (error) {
        throw new Error("Wystąpił błąd podczas wylogowywania");
    }
};