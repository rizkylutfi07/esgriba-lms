"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    color?: "blue" | "green" | "emerald" | "orange";
}

const colorMap = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    orange: "bg-orange-500/10 text-orange-500",
}

export function StatsCard({ label, value, icon: Icon, trend, color = "blue" }: StatsCardProps) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                        {label}
                    </p>
                    <h2 className="text-3xl font-bold">{value}</h2>
                    {trend && (
                        <p className="text-xs text-green-500 font-medium mt-1">
                            {trend} from last month
                        </p>
                    )}
                </div>
                <div className={cn("p-4 rounded-full", colorMap[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}
