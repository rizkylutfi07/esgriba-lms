'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-muted/40 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out md:ml-64">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
