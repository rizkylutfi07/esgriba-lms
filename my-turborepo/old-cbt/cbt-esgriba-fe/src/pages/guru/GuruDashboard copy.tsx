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
  Plus,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
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
    // Only load dashboard if authenticated and has token
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
      // Don't show error if it's authentication related (will be handled by interceptor)
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Guru</h1>
          <p className="text-gray-500 mt-1">
            Kelola ujian dan pantau hasil siswa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/question-bank")}>
            <FileText className="w-4 h-4 mr-2" />
            Bank Soal
          </Button>
          <Button onClick={() => navigate("/tests/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Ujian Baru
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Ujian</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-2xl font-bold">
              {summary?.total_tests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.active_tests || 0} ujian aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-2xl font-bold">
              {summary?.total_attempts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.completed_attempts || 0} selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm font-medium">
              Rata-rata Nilai
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-2xl font-bold">
              {summary?.average_score ? summary.average_score.toFixed(1) : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Dari semua ujian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm font-medium">
              Tingkat Kelulusan
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-2xl font-bold">
              {summary?.pass_rate ? summary.pass_rate.toFixed(1) : "0"}%
            </div>
            <p className="text-xs text-muted-foreground">Siswa lulus</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ujian Terbaru</CardTitle>
              <CardDescription>
                Daftar ujian yang baru dibuat atau diperbarui
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate("/tests")}>
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada ujian</p>
              <Button
                className="mt-4"
                onClick={() => navigate("/tests/create")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Ujian Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTests.map((test: any) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/tests/${test.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{test.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {test.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {test.kelas}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {test.duration} menit
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        test.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {test.is_active ? "Aktif" : "Draft"}
                    </span>
                    {test.total_questions > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {test.total_questions} soal
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
