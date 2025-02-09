"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { UserButton } from "@/components/auth/UserButton";
import Logo from "@/components/Logo";

export const Navbar = () => {
    const pathname = usePathname();
    
    return (
        <nav className="flex sticky top-0 h-20 bg-[--black] z-[100]  justify-between items-center  backdrop-blur-[8px] w-full p-2" style={{boxShadow: "0 2px 15px rgba(0, 0, 0, 0.5)"}}>
            <Logo></Logo>
            <div className="flex gap-x-2">
                <Button 
                    asChild
                    variant={pathname === "/server" ? "default" : "outline"}
                > 
                    <Link href="/server">Server</Link>
                </Button>

                <Button 
                    asChild
                    variant={pathname === "/client" ? "default" : "outline"}
                > 
                    <Link href="/client">Client</Link>
                </Button>

                <Button 
                    asChild
                    variant={pathname === "/admin" ? "default" : "outline"}
                > 
                    <Link href="/admin">Admin</Link>
                </Button>

                <Button 
                    asChild
                    variant={pathname === "/settings" ? "default" : "outline"}
                > 
                    <Link href="/settings">Settings</Link>
                </Button>

            </div>
            <UserButton/>
        </nav>
    )
}