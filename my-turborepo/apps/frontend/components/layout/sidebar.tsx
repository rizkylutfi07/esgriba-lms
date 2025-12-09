'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    School,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        // Simple client-side role check from consistent localStorage use in Login
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setRole(user.role?.toLowerCase());
        }
    }, []);

    const adminLinks = [
        { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/admin/users', label: 'Users Management', icon: Users },
        { href: '/dashboard/admin/classes', label: 'Classes', icon: School },
        { href: '/dashboard/admin/subjects', label: 'Subjects', icon: BookOpen },
        { href: '/dashboard/admin/schedule', label: 'Schedule', icon: Calendar },
    ];

    const guruLinks = [
        { href: '/dashboard/guru', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/guru/classes', label: 'My Classes', icon: Users },
        { href: '/dashboard/guru/materials', label: 'Materials', icon: BookOpen },
        { href: '/dashboard/guru/assignments', label: 'Assignments', icon: FileText },
        { href: '/dashboard/guru/schedule', label: 'Schedule', icon: Calendar },
    ];

    const siswaLinks = [
        { href: '/dashboard/siswa', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/siswa/schedule', label: 'My Schedule', icon: Calendar },
        { href: '/dashboard/siswa/materials', label: 'Materials', icon: BookOpen },
        { href: '/dashboard/siswa/assignments', label: 'Assignments', icon: FileText },
        { href: '/dashboard/siswa/grades', label: 'Grades', icon: GraduationCap },
    ];

    let links = siswaLinks;
    if (role === 'admin') links = adminLinks;
    if (role === 'guru') links = guruLinks;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r transition-transform duration-300 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center border-b px-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">E</div>
                        <span>Esgriba</span>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto md:hidden" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col h-[calc(100vh-64px)] justify-between py-6">
                    <nav className="space-y-1 px-3">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-3">
                        <div className="mb-4 px-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                System
                            </p>
                        </div>
                        <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                window.location.href = '/login';
                            }}
                            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
