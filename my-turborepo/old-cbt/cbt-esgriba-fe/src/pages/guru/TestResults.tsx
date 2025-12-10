import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  ArrowLeft,
  Eye,
  Search,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Edit,
} from "lucide-react";
import apiClient from "../../lib/api";
import { useToast } from "../../hooks/use-toast";
import * as XLSX from "xlsx";
import EssayGradingModal from "../../components/EssayGradingModal";
import MathContent from "../../components/MathContent";
import { CheckCircle2, XCircle } from "lucide-react";

interface TestAttempt {
  id: number;
  student: {
    id: number;
    name: string;
    nis: string;
    class?: {
      name: string;
    };
  };
  score: number;
  max_score: number;
  percentage: number;
  status: "completed" | "in_progress" | "blocked";
  started_at: string;
  finished_at: string;
  duration_minutes: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  answers?: any[];
}

interface TestData {
  id: number;
  title: string;
  subject: {
    name: string;
  };
  total_questions: number;
  duration_minutes: number;
  passing_score: number;
  created_at: string;
}

interface Statistics {
  total_attempts: number;
  completed: number;
  in_progress: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_rate: number;
  average_duration: number;
}

export default function TestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(
    null
  );
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEssayModal, setShowEssayModal] = useState(false);
  const [essayAttemptId, setEssayAttemptId] = useState<number | null>(null);
  const [essayStudentName, setEssayStudentName] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [testId]);

  // Transform backend data to frontend format
  const transformAttemptData = (
    rawAttempts: any[],
    testTotalQuestions: number
  ): TestAttempt[] => {
    return rawAttempts.map((attempt: any) => {
      // Use data from backend calculation
      const correctCount = attempt.correct_answers || 0;
      const wrongCount = attempt.wrong_answers || 0;
      const totalPoints = attempt.total_points || 0;
      const maxPoints = attempt.max_points || testTotalQuestions;
      const percentage = attempt.percentage || 0;
      const totalAnswered = attempt.total_answered || 0;
      const unanswered = testTotalQuestions - totalAnswered;

      return {
        id: attempt.id,
        student: {
          id: attempt.user_id || 0,
          name: attempt.student_name || "Unknown",
          nis: attempt.student_nis || "-",
          class: attempt.class_name ? { name: attempt.class_name } : undefined,
        },
        score: totalPoints,
        max_score: maxPoints,
        percentage: percentage,
        status: attempt.status || "completed",
        started_at: attempt.started_at || "",
        finished_at: attempt.finished_at || "",
        duration_minutes: attempt.duration_minutes || 0,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        unanswered: unanswered,
      };
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load test data
      const testResponse = await apiClient.get(`/tests/${testId}`);
      setTestData(testResponse.data.data || testResponse.data);

      // Load attempts from results endpoint
      const attemptsResponse = await apiClient.get(`/tests/${testId}/results`);
      console.log("Attempts response:", attemptsResponse.data);

      // Handle response
      let attemptsData = [];
      if (Array.isArray(attemptsResponse.data.data)) {
        attemptsData = attemptsResponse.data.data;
      } else if (Array.isArray(attemptsResponse.data)) {
        attemptsData = attemptsResponse.data;
      } else {
        attemptsData = [];
      }

      console.log("Processed attempts data:", attemptsData);

      // Get test data to know total questions
      const testInfo = testResponse.data.data || testResponse.data;
      const totalQuestions = testInfo.total_questions || 0;

      // Transform attempts data
      const transformedAttempts = transformAttemptData(
        attemptsData,
        totalQuestions
      );
      console.log("Transformed attempts:", transformedAttempts);

      setAttempts(transformedAttempts);

      // Calculate statistics
      calculateStatistics(transformedAttempts);
    } catch (error: any) {
      console.error("Error loading test results:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load test results",
        variant: "destructive",
      });

      // Set empty array on error to prevent undefined issues
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: TestAttempt[]) => {
    // Ensure data is array
    if (!Array.isArray(data) || data.length === 0) {
      setStatistics({
        total_attempts: 0,
        completed: 0,
        in_progress: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        pass_rate: 0,
        average_duration: 0,
      });
      return;
    }

    const completed = data.filter((a) => a.status === "completed");

    if (completed.length === 0) {
      setStatistics({
        total_attempts: data.length,
        completed: 0,
        in_progress: data.filter((a) => a.status === "in_progress").length,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        pass_rate: 0,
        average_duration: 0,
      });
      return;
    }

    const scores = completed.map((a) => a.percentage || 0);
    const durations = completed.map((a) => a.duration_minutes || 0);
    const passed = completed.filter(
      (a) => a.percentage >= (testData?.passing_score || 75)
    );

    setStatistics({
      total_attempts: data.length,
      completed: completed.length,
      in_progress: data.filter((a) => a.status === "in_progress").length,
      average_score:
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0,
      highest_score: scores.length > 0 ? Math.max(...scores) : 0,
      lowest_score: scores.length > 0 ? Math.min(...scores) : 0,
      pass_rate:
        completed.length > 0 ? (passed.length / completed.length) * 100 : 0,
      average_duration:
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
    });
  };

  const filteredAttempts = (Array.isArray(attempts) ? attempts : []).filter(
    (attempt) => {
      const matchesSearch =
        attempt.student?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        attempt.student?.nis?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || attempt.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Selesai</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500">Sedang Mengerjakan</Badge>;
      case "blocked":
        return <Badge className="bg-red-500">Diblokir</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreBadge = (percentage: number, passingScore: number) => {
    if (percentage >= passingScore) {
      return <Badge className="bg-green-500">Lulus</Badge>;
    }
    return <Badge className="bg-red-500">Tidak Lulus</Badge>;
  };

  const viewAttemptDetail = async (attempt: TestAttempt) => {
    try {
      // Load full attempt details with answers
      const response = await apiClient.get(`/attempts/${attempt.id}`);
      console.log("Attempt detail:", response.data);

      // Transform the data to match the expected structure
      const detailData = {
        ...response.data,
        student: {
          name: response.data.user?.name || "",
          nis: response.data.user?.nisn || response.data.user?.nis || "",
          class:
            response.data.user?.class_name || response.data.user?.kelas || "",
        },
        score: response.data.total_points || 0,
        max_score: response.data.max_points || 100,
        percentage: response.data.percentage || 0,
        correct_answers: response.data.correct_answers || 0,
        wrong_answers: response.data.wrong_answers || 0,
        unanswered: response.data.unanswered || 0,
        answers: response.data.answers || [],
      };

      setSelectedAttempt(detailData);
      setShowDetailDialog(true);
    } catch (error: any) {
      console.error("Failed to load attempt details:", error);
      toast({
        title: "Error",
        description: "Gagal memuat detail jawaban",
        variant: "destructive",
      });
    }
  };

  const openEssayGrading = (attempt: TestAttempt) => {
    setEssayAttemptId(attempt.id);
    setEssayStudentName(attempt.student.name);
    setShowEssayModal(true);
  };

  const handleEssayGradeSubmitted = () => {
    // Reload data after essay grading
    loadData();
  };

  const exportToExcel = () => {
    const data = filteredAttempts.map((attempt, index) => ({
      No: index + 1,
      NIS: attempt.student.nis,
      Nama: attempt.student.name,
      Kelas: attempt.student.class?.name || "-",
      Status: attempt.status === "completed" ? "Selesai" : "Sedang Mengerjakan",
      Nilai: Math.round(attempt.percentage),
      "Benar (PG)": attempt.correct_answers,
      "Salah (PG)": attempt.wrong_answers,
      "Tidak Dijawab": attempt.unanswered,
      Keterangan:
        attempt.percentage >= (testData?.passing_score || 75)
          ? "Lulus"
          : "Tidak Lulus",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Ujian");

    // Set column widths
    ws["!cols"] = [
      { wch: 5 }, // No
      { wch: 15 }, // NIS
      { wch: 25 }, // Nama
      { wch: 15 }, // Kelas
      { wch: 20 }, // Status
      { wch: 12 }, // Nilai
      { wch: 12 }, // Skor
      { wch: 8 }, // Benar
      { wch: 8 }, // Salah
      { wch: 15 }, // Tidak Dijawab
      { wch: 15 }, // Durasi
      { wch: 20 }, // Mulai
      { wch: 20 }, // Selesai
      { wch: 15 }, // Keterangan
    ];

    const fileName = `Hasil_${testData?.title.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Success",
      description: "Data hasil ujian berhasil diekspor",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">Test not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            className="bg-blue-300 dark:bg-blue-800 hover:bg-blue-600 dark:hover:bg-blue-700"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tests")}
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Kembali</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
              {testData.title}
            </h1>
          </div>
        </div>
        <Button onClick={exportToExcel} size="sm" className="w-full sm:w-auto">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export Excel</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4"></div>
      )}

      {/* Additional Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Rata-rata Nilai
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {Math.round(statistics.average_score)}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Nilai Tertinggi
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {Math.round(statistics.highest_score)}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 md:col-span-1">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Nilai Terendah
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {Math.round(statistics.lowest_score)}
                  </p>
                </div>
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama atau NIS siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 text-sm sm:text-base">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="in_progress">Sedang Mengerjakan</SelectItem>
                <SelectItem value="blocked">Diblokir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table - Desktop View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Daftar Hasil Ujian ({filteredAttempts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Benar/Salah (PG)</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-gray-500 py-8"
                    >
                      Tidak ada data hasil ujian
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttempts.map((attempt, index) => (
                    <TableRow key={attempt.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{attempt.student.nis}</TableCell>
                      <TableCell className="font-medium">
                        {attempt.student.name}
                      </TableCell>
                      <TableCell>
                        {attempt.student.class?.name || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-md">
                          {Math.round(attempt.percentage)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">
                            {attempt.correct_answers}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-600 font-medium">
                            {attempt.wrong_answers}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Pilihan Ganda
                        </div>
                      </TableCell>
                      <TableCell>
                        {attempt.status === "completed" &&
                          getScoreBadge(
                            attempt.percentage,
                            testData.passing_score
                          )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewAttemptDetail(attempt)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                          {attempt.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEssayGrading(attempt)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Essay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Results Cards - Mobile View */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            Daftar Hasil Ujian ({filteredAttempts.length})
          </h2>
        </div>
        {filteredAttempts.length === 0 ? (
          <Card>
            <CardContent className="text-center text-gray-500 py-8">
              Tidak ada data hasil ujian
            </CardContent>
          </Card>
        ) : (
          filteredAttempts.map((attempt, index) => (
            <Card key={attempt.id} className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                {/* Header with No and Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </span>
                    {getStatusBadge(attempt.status)}
                  </div>
                  {attempt.status === "completed" &&
                    getScoreBadge(attempt.percentage, testData.passing_score)}
                </div>

                {/* Student Info */}
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Nama Siswa</p>
                    <p className="font-semibold text-sm">
                      {attempt.student.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">NIS</p>
                      <p className="text-sm font-medium">
                        {attempt.student.nis}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kelas</p>
                      <p className="text-sm font-medium">
                        {attempt.student.class?.name || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score and Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Skor</p>
                    <p className="text-lg font-bold text-blue-600">
                      {Math.round(attempt.percentage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Benar/Salah (PG)</p>
                    <div className="flex items-center gap-1">
                      <span className="text-green-600 font-semibold text-sm">
                        {attempt.correct_answers}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600 font-semibold text-sm">
                        {attempt.wrong_answers}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => viewAttemptDetail(attempt)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detail
                  </Button>
                  {attempt.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEssayGrading(attempt)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Essay
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Detail Hasil Ujian
            </DialogTitle>
            <DialogDescription className="text-sm">
              Rincian jawaban dan penilaian siswa
            </DialogDescription>
          </DialogHeader>

          {selectedAttempt && (
            <div className="space-y-3 sm:space-y-4">
              {/* Student Info */}
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Nama Siswa
                      </p>
                      <p className="font-semibold text-sm sm:text-base">
                        {selectedAttempt.student.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">NIS</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {selectedAttempt.student.nis}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Skor</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        {selectedAttempt.score}/{selectedAttempt.max_score}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        ({Math.round(selectedAttempt.percentage)})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Jawaban Benar
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-green-600">
                        {selectedAttempt.correct_answers}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Jawaban Salah
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-red-600">
                        {selectedAttempt.wrong_answers}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Tidak Dijawab
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-gray-600">
                        {selectedAttempt.unanswered}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Durasi</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {selectedAttempt.duration_minutes} menit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answers per Question */}
              {selectedAttempt.answers &&
                selectedAttempt.answers.length > 0 && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg">
                        Jawaban Per Soal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                      {selectedAttempt.answers.map(
                        (answer: any, index: number) => (
                          <div
                            key={answer.id}
                            className={`border rounded-lg p-3 sm:p-4 ${
                              answer.is_correct
                                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                                : answer.question?.question_type === "essay"
                                ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Soal {index + 1}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {answer.question?.question_type ===
                                  "multiple_choice"
                                    ? "Pilihan Ganda"
                                    : "Essay"}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {answer.question?.points || 0} poin
                                </Badge>
                              </div>
                              {answer.question?.question_type ===
                                "multiple_choice" && (
                                <div className="flex items-center gap-2">
                                  {answer.is_correct ? (
                                    <Badge className="bg-green-500 text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Benar
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-500 text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Salah
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {answer.question?.question_type === "essay" && (
                                <Badge className="bg-blue-500 text-xs">
                                  {answer.points_earned || 0}/
                                  {answer.question?.points || 0} poin
                                </Badge>
                              )}
                            </div>

                            {/* Question Text */}
                            <div className="mb-3">
                              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Pertanyaan:
                              </p>
                              <div className="text-xs sm:text-sm">
                                <MathContent
                                  content={answer.question?.question_text || ""}
                                />
                              </div>
                            </div>

                            {/* Multiple Choice Answer */}
                            {answer.question?.question_type ===
                              "multiple_choice" && (
                              <div className="space-y-2">
                                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Pilihan Jawaban:
                                </p>
                                {answer.question?.options?.map(
                                  (option: any) => {
                                    const isStudentAnswer =
                                      option.id === answer.option_id;
                                    const isCorrectAnswer = option.is_correct;

                                    return (
                                      <div
                                        key={option.id}
                                        className={`p-2 sm:p-3 rounded border ${
                                          isStudentAnswer && isCorrectAnswer
                                            ? "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700"
                                            : isStudentAnswer
                                            ? "bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700"
                                            : isCorrectAnswer
                                            ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                                            : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                        }`}
                                      >
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                          {isStudentAnswer && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              Jawaban Siswa
                                            </Badge>
                                          )}
                                          {isCorrectAnswer && (
                                            <Badge
                                              variant="outline"
                                              className="bg-green-50 dark:bg-green-900 text-xs"
                                            >
                                              ✓ Jawaban Benar
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-xs sm:text-sm">
                                          <MathContent
                                            content={option.option_text}
                                          />
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}

                            {/* Essay Answer */}
                            {answer.question?.question_type === "essay" && (
                              <div className="space-y-2">
                                {answer.question?.expected_answer && (
                                  <div className="bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800 p-2 sm:p-3 rounded">
                                    <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                                      Jawaban yang Diharapkan:
                                    </p>
                                    <p className="text-xs sm:text-sm text-green-900 dark:text-green-100 whitespace-pre-wrap break-words">
                                      {answer.question.expected_answer}
                                    </p>
                                  </div>
                                )}
                                <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800 p-2 sm:p-3 rounded">
                                  <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                                    Jawaban Siswa:
                                  </p>
                                  <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap break-words">
                                    {answer.answer_text || (
                                      <span className="italic text-gray-500 dark:text-gray-400">
                                        Tidak dijawab
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Essay Grading Modal */}
      {testId && essayAttemptId && (
        <EssayGradingModal
          isOpen={showEssayModal}
          onClose={() => setShowEssayModal(false)}
          testId={testId}
          attemptId={essayAttemptId}
          studentName={essayStudentName}
          onGradeSubmitted={handleEssayGradeSubmitted}
        />
      )}
    </div>
  );
}
