"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.getCurrentUser(),
        retry: false
    });

    useEffect(() => {
        // Allow both ADMIN and GURU to access admin routes
        // GURU needs access to CBT pages (Bank Soal, Ujian)
        if (!isLoading && (isError || !user || (user.role !== 'ADMIN' && user.role !== 'GURU'))) {
            router.push('/dashboard');
        }
    }, [user, isLoading, isError, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Allow both ADMIN and GURU to access
    if (user?.role === 'ADMIN' || user?.role === 'GURU') {
        return <>{children}</>;
    }

    // Return null while redirecting
    return null;
}
