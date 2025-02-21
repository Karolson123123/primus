"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "./ui/badge";

interface ChargingSession {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    vehicle_id: number;
    start_time: string;
    end_time: string | null;
    energy_used_kWh: number;
    total_cost: number;
    status: string;
}

interface ChargingSessionInfoProps {
    sessions?: ChargingSession[];
    label: string;
    isLoading?: boolean;
}

export const ChargingSessionInfo = ({
    sessions,
    label,
    isLoading = false,
}: ChargingSessionInfoProps) => {
    if (isLoading) {
        return (
            <Card className="bg-[var(--cardblack)] w-[90%]">
                <CardHeader>
                    <p className="text-2xl font-semibold text-center text-white">
                        {label}
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-700 rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-[var(--cardblack)] w-[90%]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center text-white">
                    {label}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions?.map((session) => (
                    <div key={session.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Status
                            </p>
                            <Badge 
                                variant={
                                    session.status === 'active' ? "default" :
                                    session.status === 'completed' ? "success" : "destructive"
                                }
                            >
                                {session.status}
                            </Badge>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Start Time
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {new Date(session.start_time).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Energy Used
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {session.energy_used_kWh} kWh
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                Total Cost
                            </p>
                            <p className="text-white truncate text-xs max-w-[180px] font-mono p-1 bg-gray-700 rounded-md">
                                {session.total_cost} 
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};