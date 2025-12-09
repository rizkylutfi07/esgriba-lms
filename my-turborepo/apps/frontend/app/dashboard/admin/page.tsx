'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
  });

  const { data: siswa } = useQuery({
    queryKey: ['siswa'],
    queryFn: () => api.get('/siswa'),
  });

  const { data: guru } = useQuery({
    queryKey: ['guru'],
    queryFn: () => api.get('/guru'),
  });

  const { data: kelas } = useQuery({
    queryKey: ['kelas'],
    queryFn: () => api.get('/kelas'),
  });

  const stats = [
    {
      title: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Siswa',
      value: siswa?.length || 0,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Guru',
      value: guru?.length || 0,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Kelas',
      value: kelas?.length || 0,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Selamat datang di sistem manajemen sekolah</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>{stat.title}</CardDescription>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Sistem</CardTitle>
            <CardDescription>Informasi umum sistem manajemen sekolah</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Sistem ini menyediakan manajemen lengkap untuk data siswa, guru, kelas, 
              mata pelajaran, jadwal, dan tahun ajaran. Gunakan menu di sebelah kiri 
              untuk navigasi.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
