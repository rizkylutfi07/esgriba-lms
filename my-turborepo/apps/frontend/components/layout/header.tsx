"use client";

import { Bell, Search, Menu, LogOut } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function Header() {
    const router = useRouter();

    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.getCurrentUser(),
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-background border-b z-10 sticky top-0">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Trigger (hidden on desktop ideally, but keeping simple for now) */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search courses..."
                        className="w-full md:w-[300px] pl-9 bg-slate-50 border-none focus-visible:ring-1"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
                <div className="flex items-center gap-2 border-l pl-4 ml-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}`} alt={user?.name} />
                                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name || 'Loading...'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email || ''}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground capitalize">
                                        {user?.role?.toLowerCase() || ''}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
