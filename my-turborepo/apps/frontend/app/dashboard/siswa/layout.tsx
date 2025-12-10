"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.getCurrentUser(),
        retry: false
    });

    useEffect(() => {
        // Allow SISWA and ADMIN
        if (!isLoading && (isError || !user || !['SISWA', 'ADMIN'].includes(user.role))) {
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

    // Only render children if user is SISWA or ADMIN
    if (user?.role === 'SISWA' || user?.role === 'ADMIN') {
        return <>{children}</>;
    }

    // Return null while redirecting
    return null;
}
