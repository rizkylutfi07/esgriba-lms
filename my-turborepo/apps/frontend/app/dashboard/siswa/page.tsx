'use client';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, GraduationCap } from 'lucide-react';

export default function SiswaDashboard() {
  return (

    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Siswa</h1>
        <p className="text-gray-500 mt-1">Selamat datang di portal siswa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Jadwal Hari Ini</CardDescription>
            <Calendar className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Mata Pelajaran</CardDescription>
            <BookOpen className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Kehadiran</CardDescription>
            <GraduationCap className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portal Siswa</CardTitle>
          <CardDescription>Akses jadwal dan informasi akademik Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Lihat jadwal pelajaran, informasi kelas, dan data akademik melalui menu di sebelah kiri.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
