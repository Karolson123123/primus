import { auth } from "@/auth";

/**
 * Pobiera dane aktualnie zalogowanego użytkownika
 * @returns Dane użytkownika lub undefined jeśli użytkownik nie jest zalogowany
 */
export const currentUser = async () => {
    const session = await auth();
    return session?.user;
};

/**
 * Pobiera rolę aktualnie zalogowanego użytkownika
 * @returns Rola użytkownika lub undefined jeśli użytkownik nie jest zalogowany
 */
export const currentRole = async () => {
    const session = await auth();
    return session?.user?.role;
};