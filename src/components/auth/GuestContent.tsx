"use client";

import { useCurrentRole } from "@/hooks/use-current-role";




interface LoggedInProps {
    children: React.ReactNode;
};

export const GuestContent = ({
    children,
}: LoggedInProps)  => {
    const role = useCurrentRole();

    if (!role) {
        return (
            <>
                {children}
            </>
        )
    }

    

    
};