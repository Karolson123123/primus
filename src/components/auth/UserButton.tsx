"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "./LogoutButton";
import { UserContent } from "./UserContent";

/**
 * Interfejs właściwości przycisku użytkownika
 * @property hidden - Flaga określająca czy przycisk ma być ukryty
 */
interface UserButtonProps {
    hidden?: boolean;
}

/**
 * Komponent przycisku użytkownika z menu rozwijanych opcji
 * Wyświetla avatar użytkownika i menu z dostępnymi akcjami
 */
export const UserButton = ({ hidden = false }: UserButtonProps) => {
    // Pobieranie danych aktualnie zalogowanego użytkownika
    const user = useCurrentUser();

    if (hidden) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback className="bg-[var(--yellow)]">
                        <FaUser className="text-[var(--cardblack)] h-7" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[var(--cardblack)] border-none mt-5 flex flex-col items-center justify-center p-3 gap-3 z-[100] w-[190px]">
                
                    
                        <DropdownMenuItem className="w-full ">
                            <div className="flex items-center justify-center gap-2 hover:bg-[var(--black)] h-12 w-full p-3 rounded-lg">
                                <Link href="/client" className="text-[var(--text-color)]">Ustawienia konta</Link>
                            </div>
                        </DropdownMenuItem>
                    
                    <hr className="text-[var(--yellow)] h-1 w-20"/>
                    
                        <DropdownMenuItem className="w-full">
                        <div className="flex items-center justify-center gap-2 hover:bg-[var(--black)] h-12 w-full p-3 rounded-lg">
                            <Link href="/settings" className="text-[var(--text-color)]">Ustawienia aplikacji</Link>
                        </div>
                        </DropdownMenuItem>
                    
                    <hr className="text-[var(--yellow)] h-1 w-20"/>
                    <UserContent>
                    
                    
                        <DropdownMenuItem className="w-full">
                        <div className="flex items-center justify-center gap-2 hover:bg-[var(--black)] h-12 w-full p-3 rounded-lg">
                            <Link href="/vehicles" className="text-[var(--text-color)]">Pojazdy</Link>
                        </div>
                        </DropdownMenuItem>
                    
                    <hr className="text-[var(--yellow)] h-1 w-20"/>
                    
                        <DropdownMenuItem className="w-full">
                        <div className="flex items-center justify-center gap-2 hover:bg-[var(--black)] h-12 w-full p-3 rounded-lg">
                            <Link href="/payments" className="text-[var(--text-color)]">Historia płatności</Link>
                        </div>
                        </DropdownMenuItem>
                    
                    <hr className="text-[var(--yellow)] h-1 w-20"/>
                    
                        <DropdownMenuItem className="w-full">
                        <div className="flex items-center justify-center gap-2 hover:bg-[var(--black)] h-12 w-full p-3 rounded-lg">
                            <Link href="/charging-sessions" className="text-[var(--text-color)]">Historia ładowań</Link>
                        </div>
                        </DropdownMenuItem>
                    
                    <hr className="text-[var(--yellow)] h-1 w-20"/>
                    
                    
                        <DropdownMenuItem className="w-full">
                        <div className="flex items-center justify-center gap-2 hover:bg-[var(--black)] h-12 w-full p-3 rounded-lg">
                            <Link href="/charging" className="text-[var(--text-color)]">Ładowanie</Link>
                        </div>    
                        </DropdownMenuItem>
                    
                    <hr className="text-[var(--yellow)] h-1 w-20"/>
                    </UserContent>
                
                    <DropdownMenuItem className="w-full">
                    <div className="flex items-center justify-center gap-2 hover:bg-[var(--black)] h-12 w-full p-3 rounded-lg">
                        <Link href="/stations" className="text-[var(--text-color)]">Stacje</Link>
                    </div>
                    </DropdownMenuItem>
                
                <hr className="text-[var(--yellow)] h-1 w-20"/>
                <LogoutButton >
                    <DropdownMenuItem>
                        <ExitIcon className="h-6 w-4 mr-2" />
                        Wyloguj się
                    </DropdownMenuItem>
                </LogoutButton>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};