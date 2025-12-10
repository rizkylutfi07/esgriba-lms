import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Award,
  CheckCircle,
} from "lucide-react";
import reportService, {
  DashboardSummary,
} from "../../lib/services/reportService";
import testService from "../../lib/services/testService";
import { useToast } from "../../hooks/use-toast";
import { useAuthStore } from "../../store/authStore";
import { Badge } from "../../components/ui/badge";

export default function SiswaDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, isAuthenticated, user } = useAuthStore();
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadDashboard();
    }
  }, [isAuthenticated, token]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);

      // Fetch student summary stats
      const summaryData = await reportService.getStudentDashboard();
      setSummary(summaryData.summary || summaryData);

      const testsData = await testService.getTests({
        status: "active",
        per_page: 5,
      });
      setAvailableTests(testsData.data || testsData);
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

  const statCards = [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 mx-auto"></div>
          </div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400 animate-pulse">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity className="w-6 h-6" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Siswa Aktif
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Selamat Datang, {user?.name || "Siswa"}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Semangat belajar hari ini! Ayo kerjakan ujian yang tersedia.
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="modern-card hover:scale-105 transition-transform duration-300 overflow-hidden group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>

              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-700/50 px-2 py-1 rounded-full border border-slate-200/50 dark:border-slate-600/50">
                    Update Terbaru
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stat.value}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Tests with Enhanced Design */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardContent className="p-6 dark:bg-slate-900/50">
          {availableTests.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <BookOpen className="w-16 h-16 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Belum Ada Ujian
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Tidak ada ujian tersedia saat ini. Silakan cek kembali nanti.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableTests.slice(0, 5).map((test: any) => (
                <div
                  key={test.id}
                  className="group relative overflow-hidden rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-500 transition-colors duration-300">
                          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {test.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {test.subject && (
                              <Badge
                                variant="outline"
                                className="gap-1.5 bg-white dark:bg-slate-900 dark:text-slate-300 dark:border-slate-600"
                              >
                                <BookOpen className="w-3 h-3" />
                                {test.subject}
                              </Badge>
                            )}
                            {test.kelas && (
                              <Badge
                                variant="outline"
                                className="gap-1.5 bg-white dark:bg-slate-900 dark:text-slate-300 dark:border-slate-600"
                              >
                                <Award className="w-3 h-3" />
                                {test.kelas}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 ml-11">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          {test.duration} menit
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          {new Date(test.start_time).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/tests/${test.id}`)}
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold px-6"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Kerjakan Sekarang
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivational Footer */}
      {availableTests.length > 0 && (
        <Card className="border-0 bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-red-900/40 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                Tetap Semangat! 💪
              </p>
            </div>
            <p className="text-purple-700 dark:text-purple-200">
              Kerjakan ujian dengan tenang dan percaya diri. Setiap usaha adalah
              langkah menuju kesuksesan!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
