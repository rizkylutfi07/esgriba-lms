'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Home, Users, GraduationCap, BookOpen, Calendar, 
  School, Building, LogOut, Menu, FileText, ClipboardList, 
  CheckSquare, Award
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const role = pathname.split('/')[2]; // admin, guru, or siswa

  const getMenuItems = () => {
    const commonItems = [
      { href: `/dashboard/${role}`, icon: Home, label: 'Dashboard' },
    ];

    if (role === 'admin') {
      return [
        ...commonItems,
        { href: `/dashboard/admin/users`, icon: Users, label: 'Users' },
        { href: `/dashboard/admin/siswa`, icon: GraduationCap, label: 'Siswa' },
        { href: `/dashboard/admin/guru`, icon: Users, label: 'Guru' },
        { href: `/dashboard/admin/kelas`, icon: School, label: 'Kelas' },
        { href: `/dashboard/admin/jurusan`, icon: Building, label: 'Jurusan' },
        { href: `/dashboard/admin/mapel`, icon: BookOpen, label: 'Mapel' },
        { href: `/dashboard/admin/jadwal`, icon: Calendar, label: 'Jadwal' },
        { href: `/dashboard/admin/tahun-ajaran`, icon: Calendar, label: 'Tahun Ajaran' },
      ];
    } else if (role === 'guru') {
      return [
        ...commonItems,
        { href: `/dashboard/guru/materi`, icon: FileText, label: 'Materi' },
        { href: `/dashboard/guru/tugas`, icon: ClipboardList, label: 'Tugas' },
        { href: `/dashboard/guru/jadwal`, icon: Calendar, label: 'Jadwal Mengajar' },
        { href: `/dashboard/guru/kelas`, icon: School, label: 'Kelas' },
      ];
    } else {
      return [
        ...commonItems,
        { href: `/dashboard/siswa/materi`, icon: FileText, label: 'Materi' },
        { href: `/dashboard/siswa/tugas`, icon: ClipboardList, label: 'Tugas' },
        { href: `/dashboard/siswa/nilai`, icon: Award, label: 'Nilai' },
        { href: `/dashboard/siswa/jadwal`, icon: Calendar, label: 'Jadwal' },
      ];
    }
  };

  const menuItems = getMenuItems();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Esgriba LMS</h1>
            <p className="text-sm text-gray-500 capitalize">{role} Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
