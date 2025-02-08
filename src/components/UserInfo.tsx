import { ExtendedUser } from "@/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "./ui/badge";
interface UserInfoProps {
    user? : ExtendedUser;
    label: string;
};

export const UserInfo = ({
    user,
    label,

}: UserInfoProps) => {
    return (
        <Card className="bg-[var(--cardblack)] w-[90%]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center text-white">
                    {label}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className=" text-sm font-medium text-white">
                        ID 
                    </p>
                    <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                        {user?.id}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className=" text-sm font-medium text-white">
                        Imie 
                    </p>
                    <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                        {user?.name}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className=" text-sm font-medium text-white">
                        Email 
                    </p>
                    <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                        {user?.email}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className=" text-sm font-medium text-white">
                        Rola 
                    </p>
                    <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                        {user?.role}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className=" text-sm font-medium text-white">
                        Weryfikacja dwuetapowa 
                    </p>
                    <Badge variant={user?.isTwoFactorEnabled ? "success" : "destructive"} >
                        {user?.isTwoFactorEnabled ? "ON" : "OFF"}
                    </Badge>
                </div>

            </CardContent>
        </Card>
    )
}