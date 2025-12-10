"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CourseCard } from "@/components/course/course-card";
import { BookOpen, Trophy, Clock, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function DashboardPage() {
    const router = useRouter();
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.getCurrentUser(),
    });

    // Commented out the redirect logic to allow users to navigate freely
    // useEffect(() => {
    //     if (!isUserLoading && user) {
    //         if (user.role === 'GURU') {
    //             router.push('/dashboard/guru');
    //         } else if (user.role === 'SISWA') {
    //             router.push('/dashboard/siswa');
    //         }
    //     }
    // }, [user, isUserLoading, router]);

    const { data: mapelList } = useQuery({ queryKey: ['mapel'], queryFn: () => api.getMapel() });
    const { data: tugasList } = useQuery({ queryKey: ['tugas'], queryFn: () => api.getTugas() });
    const { data: guruCount } = useQuery({
        queryKey: ['guru'],
        queryFn: async () => {
            const res = await api.getGuru();
            return Array.isArray(res) ? res.length : 0;
        }
    });

    const stats = [
        { label: "Mata Pelajaran Aktif", value: mapelList?.length?.toString() || "0", icon: BookOpen, color: "blue" as const },
        { label: "Tugas", value: tugasList?.length?.toString() || "0", icon: BookOpen, color: "orange" as const, trend: "Active" },
        { label: "Guru Pengajar", value: guruCount?.toString() || "0", icon: GraduationCap, color: "emerald" as const }, // Replaced Attendance with Guru count for now
        { label: "Rata-rata Nilai", value: "88", icon: Trophy, color: "emerald" as const, trend: "+2.5%" }, // Nilai API complex, keeping mock
    ];

    // Mock data for School Context - This will be replaced by API calls
    // const stats = [
    //     { label: "Mata Pelajaran Aktif", value: "8", icon: BookOpen, color: "blue" as const },
    //     { label: "Tugas Belum Selesai", value: "3", icon: BookOpen, color: "orange" as const, trend: "Due Soon" }, // Reusing BookOpen as placeholder for Assignment
    //     { label: "Kehadiran", value: "95%", icon: Clock, color: "green" as const, trend: "Excellent" },
    //     { label: "Rata-rata Nilai", value: "88", icon: Trophy, color: "emerald" as const, trend: "+2.5%" },
    // ];

    const courses = [
        {
            title: "Matematika Wajib",
            instructor: "Budi Santoso, S.Pd",
            progress: 75,
            totalLessons: 32,
            completedLessons: 24,
            imageSrc: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop", // Math like image
            duration: "Senin, 08:00",
            category: "MIPA"
        },
        {
            title: "Bahasa Indonesia",
            instructor: "Siti Aminah, M.Pd",
            progress: 90,
            totalLessons: 28,
            completedLessons: 25,
            imageSrc: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2573&auto=format&fit=crop", // Books
            duration: "Selasa, 10:00",
            category: "Bahasa"
        },
        {
            title: "Fisika Dasar",
            instructor: "Dr. Rahmat Hidayat",
            progress: 45,
            totalLessons: 24,
            completedLessons: 10,
            imageSrc: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=2670&auto=format&fit=crop", // Physics
            duration: "Rabu, 08:00",
            category: "MIPA"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Halo, Rizky! 👋</h1>
                    <p className="text-muted-foreground mt-1">Selamat datang kembali di Esgriba LMS.</p>
                </div>
                <div>
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                        Lihat Jadwal
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Continue Learning Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Mata Pelajaran Hari Ini</h2>
                        <Button variant="link" className="text-primary gap-1">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mapelList?.slice(0, 2).map((mapel: any) => (
                            <CourseCard
                                key={mapel.id}
                                title={mapel.name}
                                instructor={mapel.teacher?.name || "No Instructor"}
                                progress={0}
                                totalLessons={12}
                                completedLessons={0}
                                imageSrc="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop"
                                duration={mapel.code}
                                category="Mempel"
                            />
                        ))}
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Tugas Terdekat</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tugasList?.slice(0, 2).map((tugas: any) => (
                                <CourseCard
                                    key={tugas.id}
                                    title={tugas.title}
                                    instructor="Tugas"
                                    progress={0}
                                    totalLessons={1}
                                    completedLessons={0}
                                    imageSrc="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2674&auto=format&fit=crop"
                                    duration={`Due: ${new Date(tugas.dueDate).toLocaleDateString()}`}
                                    category="Tugas"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar / Additional Widgets */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Jadwal Minggu Ini</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="text-center min-w-[3.5rem]">
                                    <span className="block text-xs font-bold text-slate-400 uppercase">SEN</span>
                                    <span className="block text-xl font-bold text-slate-900">14</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm line-clamp-1">Matematika Wajib</h4>
                                    <p className="text-xs text-muted-foreground mt-1">08:00 - 09:30 WIB</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="text-center min-w-[3.5rem]">
                                    <span className="block text-xs font-bold text-slate-400 uppercase">SEL</span>
                                    <span className="block text-xl font-bold text-slate-900">15</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm line-clamp-1">Bahasa Inggris</h4>
                                    <p className="text-xs text-muted-foreground mt-1">10:00 - 11:30 WIB</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full mt-4 text-xs font-medium h-9">
                            Lihat Selengkapnya
                        </Button>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-xl shadow-lg text-white">
                        <h3 className="font-bold text-lg mb-2">Pengumuman Sekolah</h3>
                        <p className="text-blue-100 text-sm mb-4">Ujian Tengah Semester akan dilaksanakan mulai tanggal 20 Oktober 2024. Persiapkan diri Anda!</p>
                        <Button className="w-full bg-white text-primary hover:bg-blue-50 border-none">
                            Lihat Detail
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
