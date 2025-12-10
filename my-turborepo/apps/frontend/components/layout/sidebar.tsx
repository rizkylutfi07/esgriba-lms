"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    MessageSquare,
    Settings,
    LogOut,
    User,
    GraduationCap,
    Clock
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            color: "text-sky-500",
        },
        {
            label: "Mata Pelajaran", // Classes/Subjects
            icon: BookOpen,
            href: "/dashboard/courses",
            color: "text-violet-500",
        },
        {
            label: "Jadwal Pelajaran", // Schedule
            icon: Clock, // Using Clock for Schedule
            href: "/dashboard/schedule",
            color: "text-pink-700",
        },
        {
            label: "Tugas", // Assignments
            icon: BookOpen, // Using BookOpen as proxy or maybe FileText if available? Let's stick to existing imports or add FileText
            href: "/dashboard/assignments",
            color: "text-orange-700",
        },
        {
            label: "Nilai", // Grades
            icon: GraduationCap,
            href: "/dashboard/grades",
            color: "text-emerald-500",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/dashboard/settings",
        },
    ];
    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        Esgriba LMS
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div className="p-3 bg-white/5 rounded-lg mb-4">
                    <h3 className="text-sm font-semibold mb-2 text-white">Upgrade Plan</h3>
                    <p className="text-xs text-zinc-400 mb-3">Get unlimited access to all courses.</p>
                    <button className="w-full bg-primary text-white text-xs py-2 rounded-md hover:bg-primary/90 transition">
                        Upgrade
                    </button>
                </div>
            </div>
        </div>
    );
}
