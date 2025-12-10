import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Users,
  FileText,
  Activity,
  Target,
  TrendingUp,
  BookOpen,
  GraduationCap,
  School,
} from "lucide-react";
import api from "../../lib/api";
import { useToast } from "../../hooks/use-toast";

interface DashboardStats {
  total_teachers: number;
  total_students: number;
  total_classes: number;
  total_subjects: number;
  total_tests: number;
  active_tests: number;
  total_attempts: number;
  average_score: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/dashboard/admin");
      setStats(response.data);
    } catch (error: any) {
      console.error("Error loading stats:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal memuat statistik dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Ujian",
      value: stats?.total_tests || 0,
      icon: FileText,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient:
        "from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50",
    },
    {
      title: "Ujian Aktif",
      value: stats?.active_tests || 0,
      icon: Activity,
      gradient: "from-pink-500 to-rose-500",
      bgGradient:
        "from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Memuat data dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="modern-card p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg floating">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Dashboard Admin
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Kelola sistem CBT dengan mudah dan efisien
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="modern-card hover:scale-105 transition-transform duration-300 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Update terbaru
                </p>
              </CardContent>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="modern-card p-6">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Kelola Guru",
              icon: Users,
              link: "/teachers",
              gradient: "from-blue-500 to-indigo-500",
            },
            {
              label: "Kelola Siswa",
              icon: GraduationCap,
              link: "/students",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              label: "Kelola Kelas",
              icon: School,
              link: "/classes",
              gradient: "from-emerald-500 to-green-500",
            },
            {
              label: "Kelola Mapel",
              icon: BookOpen,
              link: "/subjects",
              gradient: "from-orange-500 to-amber-500",
            },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <a
                key={action.label}
                href={action.link}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}
                >
                  <ActionIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
