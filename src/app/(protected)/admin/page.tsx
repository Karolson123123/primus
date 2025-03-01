"use client";

import { admin } from "@/actions/admin";
import { AdminContent } from "@/components/auth/AdminContent";
import { RoleGate } from "@/components/auth/RoleGate";
import { FormSuccess } from "@/components/FormSuccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import { StationForm } from "@/components/StationForm";

export default function AdminPage() {
    const onServerActionClick = () => {
        admin()
            .then((data) => {
                if (data.error) {
                    toast.error(data.error);
                }

                if (data.success) {
                    toast.success(data.success)
                }
            })
    }

    const onApiRouteClick = () => {
        fetch("/api/admin")
            .then((response) => {
                if (response.ok) {
                    toast.success("gitgit")
                } else {
                    toast.error("niegit");
                }
            }) 
    }
    return(
        <>
            <Card className="bg-[var(--cardblack)] w-[90%]">
                <CardHeader>
                    <p className="text-2xl font-semibold text-center text-white">Admin</p>
                </CardHeader>
                <CardContent className=" space-y-4">
                    <RoleGate allowedRole={UserRole.ADMIN}>
                        <FormSuccess message="Masz uprawnienia"/>
                    </RoleGate>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-mg">
                        <p  className="test-sm font-medium text-white">
                            Admin-only API Route
                        </p>
                        <Button onClick={onApiRouteClick}>
                            Click to test
                        </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-mg">
                        <p  className="test-sm font-medium text-white">
                            Admin-only Server Action
                        </p>
                        <Button onClick={onServerActionClick}>
                            Click to test
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <StationForm></StationForm>
        </>
    )
};
