import { useEffect, useState } from "react";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Activity,
} from "lucide-react";
import reportService, {
  DashboardSummary,
} from "../../lib/services/reportService";
import { useToast } from "../../hooks/use-toast";
import { useAuthStore } from "../../store/authStore";

export default function GuruDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadDashboard();
    }
  }, [isAuthenticated, token]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await reportService.getTeacherDashboard();
      setSummary(data.summary);
      setRecentTests(data.recent_tests || []);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Gagal memuat dashboard",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Ujian",
      value: summary?.total_tests || 0,
      subValue: `${summary?.active_tests || 0} ujian aktif`,
      icon: BookOpen,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50",
    },
    {
      title: "Total Peserta",
      value: summary?.total_attempts || 0,
      subValue: `${summary?.completed_attempts || 0} selesai`,
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50",
    },
    {
      title: "Rata-rata Nilai",
      value: summary?.average_score ? summary.average_score.toFixed(1) : "0",
      subValue: "Dari semua ujian",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50",
    },
    {
      title: "Tingkat Kelulusan",
      value: `${summary?.pass_rate ? summary.pass_rate.toFixed(1) : "0"}%`,
      subValue: "Siswa lulus",
      icon: CheckCircle,
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="modern-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg floating">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                Dashboard Guru
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Kelola ujian dan pantau hasil siswa
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate("/question-bank")}
              className="flex-1 md:flex-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              Bank Soal
            </Button>
            <Button 
              onClick={() => navigate("/tests/create")}
              className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Ujian
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                  {stat.subValue}
                </p>
              </CardContent>
            </div>
          );
        })}
      </div>

      {/* Recent Tests */}
      <div className="modern-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ujian Terbaru</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Daftar ujian yang baru dibuat atau diperbarui</p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/tests")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            Lihat Semua
          </Button>
        </div>

        <div className="space-y-4">
          {recentTests.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada ujian</p>
              <Button
                variant="link"
                className="mt-2 text-blue-600"
                onClick={() => navigate("/tests/create")}
              >
                Buat Ujian Pertama
              </Button>
            </div>
          ) : (
            recentTests.map((test: any) => (
              <div
                key={test.id}
                className="group relative p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/tests/${test.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${test.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {test.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700/50">
                          <BookOpen className="w-3.5 h-3.5" />
                          {test.subject}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700/50">
                          <Users className="w-3.5 h-3.5" />
                          {test.kelas}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700/50">
                          <Clock className="w-3.5 h-3.5" />
                          {test.duration}m
                        </span>
                        {Number(test.allowed_students_count || 0) > 0 && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                            <Shield className="w-3.5 h-3.5" /> Remidi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 pl-14 sm:pl-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        test.is_active
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      {test.is_active ? "Aktif" : "Draft"}
                    </span>
                    {test.total_questions > 0 && (
                      <span className="text-xs text-slate-400">
                        {test.total_questions} soal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
