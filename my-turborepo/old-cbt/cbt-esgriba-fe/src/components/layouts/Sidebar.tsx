import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  Home,
  Users,
  GraduationCap,
  School,
  BookOpen,
  DoorOpen,
  Calendar,
  FileText,
  UserCog,
  ChevronDown,
  ChevronRight,
  Package,
  Activity,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";

interface MenuItem {
  title: string;
  icon: any;
  path?: string;
  children?: MenuItem[];
  roles?: string[];
}

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([
    "Menu Utama",
    "Menu Lainnya",
  ]);

  const menuItems: MenuItem[] = [
    {
      title: "Menu Utama",
      icon: null,
      children: [{ title: "Beranda", icon: Home, path: "/" }],
    },
    {
      title: "CBT",
      icon: FileText,
      children: [
        { title: "Daftar Ujian", icon: FileText, path: "/tests" },
        {
          title: "Buat Ujian",
          icon: FileText,
          path: "/tests/create",
          roles: ["admin", "guru"],
        },
        {
          title: "Bank Soal",
          icon: BookOpen,
          path: "/question-bank",
          roles: ["admin", "guru"],
        },
        {
          title: "Paket Soal",
          icon: Package,
          path: "/question-packages",
          roles: ["admin", "guru"],
        },
        {
          title: "Monitoring Ujian",
          icon: Activity,
          path: "/monitoring",
          roles: ["admin", "guru"],
        },
        {
          title: "Cetak Kartu Ujian",
          icon: CreditCard,
          path: "/exam-cards",
          roles: ["admin", "guru"],
        },
      ],
    },
    {
      title: "Menu Lainnya",
      icon: null,
      children: [
        {
          title: "Data Sekolah",
          icon: School,
          children: [
            {
              title: "Mata Pelajaran",
              icon: BookOpen,
              path: "/subjects",
              roles: ["admin"],
            },
            {
              title: "Data Guru",
              icon: UserCog,
              path: "/teachers",
              roles: ["admin"],
            },
            {
              title: "Data Kelas",
              icon: School,
              path: "/classes",
              roles: ["admin"],
            },
            {
              title: "Data Siswa",
              icon: Users,
              path: "/students",
              roles: ["admin"],
            },
          ],
        },
        {
          title: "Akademik",
          icon: GraduationCap,
          children: [
            {
              title: "Jurusan",
              icon: GraduationCap,
              path: "/majors",
              roles: ["admin"],
            },
            {
              title: "Sesi",
              icon: GraduationCap,
              path: "/sessions",
              roles: ["admin"],
            },
            {
              title: "Ruangan",
              icon: DoorOpen,
              path: "/rooms",
              roles: ["admin"],
            },
            {
              title: "Tahun Pelajaran",
              icon: Calendar,
              path: "/academic-years",
              roles: ["admin"],
            },
          ],
        },
      ],
    },
  ];

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return user && roles.includes(user.role);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!hasAccess(item.roles)) return null;

    const isOpen = openMenus.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    if (level === 0 && !item.icon) {
      // Section Header
      return (
        <div key={item.title} className="mb-4">
          <div
            className="px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide cursor-pointer flex items-center justify-between hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            onClick={() => toggleMenu(item.title)}
          >
            {item.title}
            {hasChildren &&
              (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
          </div>
          {isOpen && item.children && (
            <div className="mt-1 space-y-1">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleMenu(item.title)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              level > 1 ? "pl-6" : ""
            } hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:shadow-sm text-slate-700 dark:text-slate-200`}
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <Icon
                  size={18}
                  className="text-slate-500 dark:text-slate-400"
                />
              )}
              <span>{item.title}</span>
            </div>
            {isOpen ? (
              <ChevronDown
                size={16}
                className="text-slate-400 dark:text-slate-500"
              />
            ) : (
              <ChevronRight
                size={16}
                className="text-slate-400 dark:text-slate-500"
              />
            )}
          </button>
          {isOpen && item.children && (
            <div className="mt-1 ml-3 space-y-1">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        to={item.path || "#"}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive(item.path)
            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
            : "text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:shadow-sm"
        } ${level > 1 ? "pl-6" : ""}`}
      >
        {Icon && (
          <Icon
            size={18}
            className={
              isActive(item.path)
                ? "text-white"
                : "text-slate-500 dark:text-slate-400"
            }
          />
        )}
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <aside className="w-72 glass border-r border-slate-200/50 dark:border-slate-700/50 dark:bg-slate-900/90 h-screen flex flex-col overflow-hidden">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src="/logo website.png"
              alt="Logo SMKS PGRI Banyuputih"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              CBT System
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SMKS PGRI Banyuputih
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200/50 flex-shrink-0 space-y-3">
        <div className="modern-card p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                System Active
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All services running
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        {user?.role !== "siswa" && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Theme
            </span>
            <ModeToggle />
          </div>
        )}
      </div>
    </aside>
  );
}
