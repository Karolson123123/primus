"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger

} from "@/components/ui/dropdown-menu";


import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar";

import { FaUser } from "react-icons/fa";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "./LogoutButton";
import { Button } from "../ui/button";
import { ExitIcon } from "@radix-ui/react-icons"
import Link from "next/link";
import { UserContent } from "./UserContent";
import { AdminContent } from "./AdminContent";


export const UserButton = () => {
    const user = useCurrentUser();

    return (
        <>
            <DropdownMenu >
                <DropdownMenuTrigger>
                    <Avatar>
                        <AvatarImage src={user?.image || ""}/>
                        <AvatarFallback className="bg-[var(--yellow)]">
                            <FaUser className="text-[var(--black)] h-7"  />
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <UserContent>
                    <DropdownMenuContent className="bg-[var(--black)] border-none mt-5 flex flex-col items-center justify-center p-3 gap-3" >
                        <Button>
                            <DropdownMenuItem>
                                <Link href="/client">Ustawienia konta</Link>
                            </DropdownMenuItem>
                        </Button>
                        <hr className="text-[var(--yellow)] h-1 w-20"/>
                        <Button>
                            <DropdownMenuItem>
                                Pojazdy
                            </DropdownMenuItem>
                        </Button>
                        <hr className="text-[var(--yellow)] h-1 w-20"/>
                        <Button>
                            <DropdownMenuItem>
                            Historia transakcji
                            </DropdownMenuItem>
                        </Button>
                        <hr className="text-[var(--yellow)] h-1 w-20"/>
                        
                        <LogoutButton>
                            <DropdownMenuItem>
                                <ExitIcon className="h-6 w-4 mr-2"/>
                                Wyloguj się
                            </DropdownMenuItem>
                        </LogoutButton>
                    </DropdownMenuContent>
                </UserContent>
                <AdminContent>
                    <DropdownMenuContent className="bg-[var(--black)] border-none mt-5 flex flex-col items-center justify-center p-3 gap-3" >
                        <Button>
                            <DropdownMenuItem>
                                <Link href="/client">Ustawienia konta</Link>
                            </DropdownMenuItem>
                        </Button>
                        <hr className="text-[var(--yellow)] h-1 w-20"/>
                        <Button>
                            <DropdownMenuItem>
                                Ustawienia stacji ładowania
                            </DropdownMenuItem>
                        </Button>
                        
                        <hr className="text-[var(--yellow)] h-1 w-20"/>
                        
                        <LogoutButton>
                            <DropdownMenuItem>
                                <ExitIcon className="h-6 w-4 mr-2"/>
                                Wyloguj się
                            </DropdownMenuItem>
                        </LogoutButton>
                    </DropdownMenuContent>
                </AdminContent>
            </DropdownMenu>
        
        </>
    )
}