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
    Users,
    School,
    GraduationCap,
    Clock
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function Sidebar() {
    const pathname = usePathname();

    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.getCurrentUser(),
    });

    const role = user?.role; // 'ADMIN', 'GURU', 'SISWA'

    let dashboardHref = "/dashboard";
    if (role === 'GURU') {
        dashboardHref = "/dashboard/guru";
    } else if (role === 'SISWA') {
        dashboardHref = "/dashboard/siswa";
    }

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: dashboardHref,
            color: "text-sky-500",
            roles: ['ADMIN', 'GURU', 'SISWA'],
        },
        // Admin Routes
        {
            label: "Data Guru",
            icon: User,
            href: "/dashboard/admin/guru",
            color: "text-orange-500",
            roles: ['ADMIN'],
        },
        {
            label: "Data Siswa",
            icon: Users,
            href: "/dashboard/admin/siswa",
            color: "text-green-500",
            roles: ['ADMIN'],
        },
        {
            label: "Data Kelas",
            icon: School,
            href: "/dashboard/admin/kelas",
            color: "text-blue-500",
            roles: ['ADMIN'],
        },
        {
            label: "Data Mapel",
            icon: BookOpen,
            href: "/dashboard/admin/mapel",
            color: "text-violet-500",
            roles: ['ADMIN'],
        },
        {
            label: "Jadwal Pelajaran",
            icon: BookOpen,
            href: "/dashboard/admin/jadwal",
            color: "text-violet-500",
            roles: ['ADMIN'],
        },

        // CBT Routes - Admin/Guru
        {
            label: "Bank Soal CBT",
            icon: BookOpen,
            href: "/dashboard/admin/cbt/bank-soal",
            color: "text-cyan-500",
            roles: ['ADMIN', 'GURU'],
        },
        {
            label: "Ujian CBT",
            icon: GraduationCap,
            href: "/dashboard/admin/cbt/ujian",
            color: "text-indigo-500",
            roles: ['ADMIN', 'GURU'],
        },

        // Learning/Teaching Routes
        {
            label: "Mata Pelajaran", // Classes/Subjects
            icon: BookOpen,
            href: "/dashboard/courses",
            color: "text-violet-500",
            roles: ['GURU', 'SISWA'],
        },
        {
            label: "Jadwal Pelajaran", // Schedule
            icon: Clock,
            href: "/dashboard/schedule",
            color: "text-pink-700",
            roles: ['GURU', 'SISWA'],
        },
        {
            label: "Tugas", // Assignments
            icon: BookOpen,
            href: "/dashboard/assignments",
            color: "text-orange-700",
            roles: ['GURU', 'SISWA'],
        },
        {
            label: "Nilai", // Grades
            icon: GraduationCap,
            href: "/dashboard/grades",
            color: "text-emerald-500",
            roles: ['GURU', 'SISWA'], // Guru inputs, Siswa views
        },

        // CBT Routes - Student
        {
            label: "Ujian CBT",
            icon: GraduationCap,
            href: "/dashboard/siswa/cbt",
            color: "text-indigo-500",
            roles: ['SISWA'],
        },

        {
            label: "Settings",
            icon: Settings,
            href: "/dashboard/settings",
            roles: ['ADMIN', 'GURU', 'SISWA'],
        },
    ];

    const filteredRoutes = routes.filter(route =>
        !route.roles || route.roles.includes(role || '')
    );

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        Esgriba LMS
                    </h1>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => (
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
            {/* <div className="px-3 py-2">
                <div className="p-3 bg-white/5 rounded-lg mb-4">
                    <h3 className="text-sm font-semibold mb-2 text-white">Upgrade Plan</h3>
                    <p className="text-xs text-zinc-400 mb-3">Get unlimited access to all courses.</p>
                    <button className="w-full bg-primary text-white text-xs py-2 rounded-md hover:bg-primary/90 transition">
                        Upgrade
                    </button>
                </div>
            </div> */}
        </div>
    );
}
