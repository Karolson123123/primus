"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";



interface LoggedInProps {
    children: React.ReactNode;
};

export const AdminContent = ({
    children,
}: LoggedInProps)  => {
    const role = useCurrentRole();

    if (role == UserRole.ADMIN) {
        return (
            <>
                {children}
            </>
        )
    }

    

    
};