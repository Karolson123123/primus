import { ExtendedUser } from "@/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "./ui/badge";

/**
 * Interfejs właściwości komponentu informacji o użytkowniku
 * @property user - Opcjonalne dane użytkownika
 * @property label - Etykieta wyświetlana jako nagłówek
 */
interface UserInfoProps {
    user?: ExtendedUser;
    label: string;
}

/**
 * Komponent wyświetlający informacje o użytkowniku
 * Prezentuje podstawowe dane użytkownika w formie karty
 */
export const UserInfo = ({ user, label }: UserInfoProps) => {
    return (
        <Card className="bg-[var(--cardblack)] w-[70%] border-[var(--yellow)] max-lg:w-full max-lg:mt-20">
            <CardHeader>
                <p className="text-2xl font-semibold text-center text-[--text-color]">
                    {label}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border border-[var(--yellow)] p-3 shadow-sm">
                    <p className="text-sm font-medium text-[--text-color]">
                        Identyfikator
                    </p>
                    <p className="text-[--text-color] truncate text-xs max-w-[180px] font-mono p-1 bg-[var(--background)] rounded-md">
                        {user?.id}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border border-[var(--yellow)] p-3 shadow-sm">
                    <p className="text-sm font-medium text-[--text-color]">
                       Nazwa
                    </p>
                    <p className="text-[--text-color] truncate text-xs max-w-[180px] font-mono p-1 bg-[var(--background)] rounded-md">
                        {user?.name}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border border-[var(--yellow)] p-3 shadow-sm">
                    <p className="text-sm font-medium text-[--text-color]">
                        Adres email
                    </p>
                    <p className="text-[--text-color] truncate text-xs max-w-[180px] font-mono p-1 bg-[var(--background)] rounded-md">
                        {user?.email}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border border-[var(--yellow)] p-3 shadow-sm">
                    <p className="text-sm font-medium text-[--text-color]">
                        Weryfikacja dwuetapowa
                    </p>
                    <Badge variant={user?.isTwoFactorEnabled ? "success" : "destructive"}>
                        {user?.isTwoFactorEnabled ? "WŁĄCZONA" : "WYŁĄCZONA"}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};