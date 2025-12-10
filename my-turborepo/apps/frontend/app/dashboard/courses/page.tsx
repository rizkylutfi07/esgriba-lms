"use client";

import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "@/components/course/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function CoursesPage() {
    const { data: mapelList, isLoading, error } = useQuery({
        queryKey: ['mapel'],
        queryFn: () => api.getMapel(),
    });

    const categories = ["Semua", "MIPA", "Bahasa", "IPS", "Seni", "Olahraga"];

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-red-500">
                Failed to load subjects. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Daftar Mata Pelajaran</h1>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari mata pelajaran..."
                            className="pl-9 bg-white"
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map((cat, i) => (
                    <Button key={i} variant={i === 0 ? "default" : "outline"} className="rounded-full text-xs h-8">
                        {cat}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mapelList?.map((mapel: any) => (
                    <CourseCard
                        key={mapel.id}
                        title={mapel.name}
                        instructor={mapel.teacher?.name || "No Instructor"}
                        progress={0} // Backend doesn't provide progress yet, strictly speaking
                        totalLessons={12} // Mock for layout
                        completedLessons={0}
                        imageSrc="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop"
                        duration={mapel.code}
                        category="General"
                    />
                ))}
            </div>
        </div>
    );
}
