import { useSession } from "next-auth/react";

/**
 * Hook zwracający aktualną rolę zalogowanego użytkownika
 * @returns Rola użytkownika lub undefined jeśli użytkownik nie jest zalogowany
 */
export const useCurrentRole = () => {
    const session = useSession();

    return session.data?.user?.role;
}