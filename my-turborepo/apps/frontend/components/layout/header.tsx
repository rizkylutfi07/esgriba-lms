"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-background border-b z-10 sticky top-0">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Trigger (hidden on desktop ideally, but keeping simple for now) */}
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
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
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none">Rizky Lutfi</p>
                        <p className="text-xs text-muted-foreground">Student</p>
                    </div>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>RL</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
