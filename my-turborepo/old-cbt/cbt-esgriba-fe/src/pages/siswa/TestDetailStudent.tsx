import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  Clock,
  FileText,
  Calendar,
  Award,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Info,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface TestDetail {
  id: number;
  title: string;
  description: string;
  subject: string;
  kelas: string;
  duration: number;
  passing_score: number;
  total_points?: number;
  total_questions?: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_by: number;
  server_time?: string;
  teacher?: {
    id: number;
    name: string;
  };
}

interface PreviousAttempt {
  id: number;
  score: number;
  is_passed: boolean;
  finished_at: string;
  status: string;
}

interface InProgressAttempt {
  id: number;
  status: string;
  started_at: string;
}

export default function TestDetailStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<TestDetail | null>(null);
  const [previousAttempt, setPreviousAttempt] =
    useState<PreviousAttempt | null>(null);
  const [inProgressAttempt, setInProgressAttempt] =
    useState<InProgressAttempt | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchTestDetail();
  }, [id]);

  const fetchTestDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tests/${id}`);
      setTest(response.data.test || response.data);

      // Check if student has attempted this test
      try {
        const attemptsResponse = await api.get(`/attempts?test_id=${id}`);
        console.log("Attempts response:", attemptsResponse.data);

        // Handle Laravel pagination
        let attempts = [];
        if (
          attemptsResponse.data.data &&
          Array.isArray(attemptsResponse.data.data)
        ) {
          attempts = attemptsResponse.data.data;
        } else if (Array.isArray(attemptsResponse.data)) {
          attempts = attemptsResponse.data;
        }

        console.log("Processed attempts:", attempts);

        if (attempts && attempts.length > 0) {
          // Check for in_progress attempt
          const inProgress = attempts.find(
            (attempt: any) => attempt.status === "in_progress"
          );
          if (inProgress) {
            console.log("Found in-progress attempt:", inProgress);
            setInProgressAttempt(inProgress);
          }

          // Only show completed attempts, not in_progress
          const completedAttempt = attempts.find(
            (attempt: any) => attempt.status === "completed"
          );
          if (completedAttempt) {
            console.log("Found completed attempt:", completedAttempt);
            setPreviousAttempt(completedAttempt);
          }
        } else {
          console.log("No attempts found for this test");
          // Reset states when no attempts
          setInProgressAttempt(null);
          setPreviousAttempt(null);
        }
      } catch (error) {
        console.log("Error fetching attempts:", error);
        // Reset states on error
        setInProgressAttempt(null);
        setPreviousAttempt(null);
      }
    } catch (error: any) {
      console.error("Failed to fetch test detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      setStarting(true);
      navigate(`/tests/${id}/take`);
    } catch (error) {
      console.error("Failed to start test:", error);
    } finally {
      setStarting(false);
      setShowStartDialog(false);
    }
  };

  const getTimeStatus = () => {
    if (!test) return null;

    // Gunakan server_time untuk sinkronisasi waktu
    const now = test.server_time ? new Date(test.server_time) : new Date();
    const startTime = new Date(test.start_time);
    const endTime = new Date(test.end_time);

    if (now < startTime) {
      return {
        status: "upcoming",
        message: `Akan dimulai ${formatDistanceToNow(startTime, {
          addSuffix: true,
          locale: idLocale,
        })}`,
        color: "blue",
      };
    } else if (now > endTime) {
      return {
        status: "finished",
        message: "Ujian telah berakhir",
        color: "gray",
      };
    } else {
      return {
        status: "active",
        message: `Berakhir ${formatDistanceToNow(endTime, {
          addSuffix: true,
          locale: idLocale,
        })}`,
        color: "green",
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 mx-auto"></div>
          </div>
          <p className="text-lg font-medium text-slate-600 animate-pulse">
            Memuat detail ujian...
          </p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ujian tidak ditemukan</AlertDescription>
        </Alert>
      </div>
    );
  }

  const timeStatus = getTimeStatus();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-10">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/tests")}
          className="mb-2 hover:bg-slate-100 transition-colors gap-2"
        >
          ← Kembali ke Daftar Ujian
        </Button>

        {/* Enhanced Title Card */}
        <Card className="border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]"></div>
          <CardContent className="relative p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                  {test.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={`${
                      test.is_active
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-500"
                    } text-white border-0`}
                  >
                    {test.is_active ? "✓ Aktif" : "○ Tidak Aktif"}
                  </Badge>
                  {timeStatus && (
                    <Badge
                      className={`border-0 text-white
                        ${
                          timeStatus.color === "green"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : ""
                        }
                        ${
                          timeStatus.color === "blue"
                            ? "bg-blue-400 hover:bg-blue-500"
                            : ""
                        }
                        ${
                          timeStatus.color === "gray"
                            ? "bg-gray-400 hover:bg-gray-500"
                            : ""
                        }
                      `}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {timeStatus.message}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Attempt Alert */}
      {inProgressAttempt && (
        <Alert className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Clock className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900 mb-1">
                Ujian Sedang Berlangsung
              </p>
              <p className="text-blue-700 text-sm">
                Anda memiliki ujian yang sedang berlangsung. Klik tombol di
                bawah untuk melanjutkan.
              </p>
              <Button
                size="sm"
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={() => navigate(`/tests/${id}/take`)}
              >
                <PlayCircle className="w-4 h-4" />
                Lanjutkan Ujian Sekarang
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Previous Attempt Alert */}
      {previousAttempt && !inProgressAttempt && (
        <Alert
          className={`border-2 shadow-lg ${
            previousAttempt.is_passed
              ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50"
              : "border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                previousAttempt.is_passed ? "bg-green-500" : "bg-amber-500"
              }`}
            >
              {previousAttempt.is_passed ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <AlertCircle className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-semibold mb-1 ${
                  previousAttempt.is_passed
                    ? "text-green-900"
                    : "text-amber-900"
                }`}
              >
                {previousAttempt.is_passed
                  ? "🎉 Selamat! Anda Lulus"
                  : "📝 Hasil Ujian Sebelumnya"}
              </p>
              <p
                className={`text-sm ${
                  previousAttempt.is_passed
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                Nilai Anda:{" "}
                <strong className="text-lg">
                  {Number(previousAttempt.score).toFixed(1)}
                </strong>{" "}
                -{previousAttempt.is_passed ? " LULUS ✓" : " BELUM LULUS"}
              </p>
              {previousAttempt.status === "completed" && (
                <Button
                  variant="link"
                  size="sm"
                  className={`p-0 h-auto mt-2 ${
                    previousAttempt.is_passed
                      ? "text-green-600 hover:text-green-700"
                      : "text-amber-600 hover:text-amber-700"
                  }`}
                  onClick={() => navigate(`/results/${previousAttempt.id}`)}
                >
                  Lihat Detail Hasil →
                </Button>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Test Info */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            Informasi Ujian
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">
                  Mata Pelajaran
                </p>
                <p className="font-bold text-blue-900 text-lg">
                  {test.subject}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-medium mb-1">
                  Durasi Ujian
                </p>
                <p className="font-bold text-emerald-900 text-lg">
                  {test.duration} menit
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
              <div className="p-2 bg-amber-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium mb-1">
                  Jumlah Soal
                </p>
                <p className="font-bold text-amber-900 text-lg">
                  {test.total_questions || 0} soal
                </p>
              </div>
            </div>
          </div>

          {test.teacher && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl">
                <div className="p-2 bg-slate-600 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Dibuat oleh
                  </p>
                  <p className="font-bold text-slate-900">
                    {test.teacher.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Info className="h-5 w-5 text-indigo-600" />
            </div>
            Petunjuk Pengerjaan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">
                Pastikan koneksi internet Anda <strong>stabil</strong> sebelum
                memulai ujian
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">
                Waktu pengerjaan adalah <strong>{test.duration} menit</strong>{" "}
                sejak ujian dimulai
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">
                Jawaban akan <strong>tersimpan otomatis</strong> setiap kali
                Anda menjawab
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">
                Anda dapat <strong>mengubah jawaban</strong> selama waktu belum
                habis
              </span>
            </div>
            <div className="flex justify-center p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <img
                src="/penyemangat.png"
                alt="Penyemangat"
                className="w-full max-w-md object-contain rounded-md shadow-md"
              />
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">
                <strong>Jangan refresh</strong> atau tutup halaman saat
                mengerjakan ujian
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">
                Setelah submit, Anda <strong>tidak dapat mengubah</strong>{" "}
                jawaban lagi
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        {!test.is_active ? (
          <Alert variant="destructive" className="max-w-md border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              Ujian ini belum diaktifkan oleh guru
            </AlertDescription>
          </Alert>
        ) : previousAttempt ? (
          <Alert className="max-w-md border-2 border-green-300 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-900 text-base">
              Anda sudah menyelesaikan ujian ini. Lihat hasil di atas.
            </AlertDescription>
          </Alert>
        ) : timeStatus?.status === "upcoming" ? (
          <Alert className="max-w-md border-2 border-blue-300 bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900 text-base">
              Ujian belum dimulai. Tunggu hingga waktu yang ditentukan.
            </AlertDescription>
          </Alert>
        ) : timeStatus?.status === "finished" ? (
          <Alert variant="destructive" className="max-w-md border-2">
            <XCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              Ujian telah berakhir dan tidak dapat dikerjakan lagi.
            </AlertDescription>
          </Alert>
        ) : inProgressAttempt ? (
          <Button
            size="lg"
            className="min-w-[240px] h-14 text-lg gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => navigate(`/tests/${id}/take`)}
          >
            <Clock className="h-6 w-6 animate-pulse" />
            Lanjutkan Ujian
          </Button>
        ) : (
          <Button
            size="lg"
            className="min-w-[240px] h-14 text-lg gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => setShowStartDialog(true)}
            disabled={starting}
          >
            <PlayCircle className="h-6 w-6" />
            Mulai Ujian Sekarang
          </Button>
        )}
      </div>

      {/* Start Confirmation Dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mulai Ujian?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  Anda akan memulai ujian: <strong>{test.title}</strong>
                </p>
                <p>
                  Waktu pengerjaan: <strong>{test.duration} menit</strong>
                </p>
                <p className="text-yellow-600 font-medium">
                  ⚠️ Timer akan dimulai segera setelah Anda klik "Mulai"
                </p>
                {previousAttempt && (
                  <p className="text-blue-600 font-medium">
                    ℹ️ Nilai sebelumnya:{" "}
                    {Number(previousAttempt.score).toFixed(1)}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={starting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartTest}
              disabled={starting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {starting ? "Memulai..." : "Ya, Mulai Sekarang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
