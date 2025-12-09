'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, Users } from 'lucide-react';

export default function GuruDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Guru</h1>
          <p className="text-gray-500 mt-1">Selamat datang di portal guru</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Jadwal Mengajar</CardDescription>
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
              <CardDescription>Total Siswa</CardDescription>
              <Users className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portal Guru</CardTitle>
            <CardDescription>Akses informasi mengajar dan kelas Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Lihat jadwal mengajar, informasi kelas, dan data siswa melalui menu di sebelah kiri.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
