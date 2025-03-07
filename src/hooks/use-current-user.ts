import { useSession } from "next-auth/react";

/**
 * Hook zwracający dane aktualnie zalogowanego użytkownika
 * @returns Dane użytkownika lub undefined jeśli użytkownik nie jest zalogowany
 */
export const useCurrentUser = () => {
    const session = useSession();

    return session.data?.user;
}