import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";
import testService, { Test, TestFilters } from "../lib/services/testService";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
import {
  BookOpen,
  Users,
  PlayCircle,
  Edit,
  Copy,
  Trash2,
  Search,
  Plus,
  Calendar,
  Eye,
  Shield,
  ClipboardCheck,
  MoreVertical,
  Clock,
  Activity,
  XCircle,
  Globe,
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
} from "../components/ui/alert-dialog";

export default function TestList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isTeacher = user?.role === "guru" || user?.role === "admin";

  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTest, setDeleteTest] = useState<Test | null>(null);

  // Data untuk dropdown
  const [subjects, setSubjects] = useState<any[]>([]);

  const [filters, setFilters] = useState<TestFilters>({
    per_page: 20,
    page: 1,
  });

  useEffect(() => {
    loadTests();
    loadSubjects();
    // loadClasses(); // removed: classes filter not used yet
  }, [filters]);

  const loadTests = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await testService.getTests(filters);
      setTests(data.data || data);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal memuat daftar ujian",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  // Note: class list fetch removed as the filter is not rendered yet

  const handleDelete = async () => {
    if (!deleteTest) return;

    try {
      await testService.deleteTest(deleteTest.id);
      toast({
        title: "Sukses",
        description: "Ujian berhasil dihapus",
      });
      setDeleteTest(null);
      loadTests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus ujian",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (test: Test) => {
    try {
      const response = await testService.duplicateTest(test.id);

      // Tambahkan ujian baru ke list jika ada data dari response
      const newTest = response.data || response;
      if (newTest && newTest.id) {
        setTests((prev) => [newTest, ...prev]);
      }

      toast({
        title: "Sukses",
        description: "Ujian berhasil diduplikasi",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menduplikasi ujian",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (test: Test) => {
    // Check if test is expired and not active
    const isExpired = new Date(test.end_time) < new Date();
    if (!test.is_active && isExpired) {
      toast({
        title: "Tidak Bisa Publikasi",
        description:
          "Ujian sudah berakhir. Silakan perbarui waktu ujian terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    const newStatus = !test.is_active;

    // Optimistic update: Update UI immediately
    setTests((currentTests) =>
      currentTests.map((t) =>
        t.id === test.id ? { ...t, is_active: newStatus } : t
      )
    );

    try {
      const response = await testService.togglePublish(test.id);

      // Update dengan data dari server jika ada
      if (response?.data) {
        setTests((currentTests) =>
          currentTests.map((t) =>
            t.id === test.id ? { ...t, ...response.data } : t
          )
        );
      }

      toast({
        title: "Sukses",
        description: newStatus
          ? "Ujian berhasil dipublikasikan"
          : "Ujian berhasil di-nonaktifkan",
      });
    } catch (error: any) {
      // Revert if failed
      setTests((currentTests) =>
        currentTests.map((t) =>
          t.id === test.id ? { ...t, is_active: test.is_active } : t
        )
      );

      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal mengubah status ujian",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-2 sm:p-3 space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Daftar Ujian</h1>
          <p className="text-muted-foreground mt-1">
            {isTeacher ? "Kelola ujian Anda" : "Ujian yang tersedia untuk Anda"}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => navigate("/tests/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Ujian
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Cari Ujian</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul atau deskripsi..."
                  className="pl-8"
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value, page: 1 })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Mata Pelajaran</Label>
              <Select
                value={filters.subject || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    subject: value === "all" ? undefined : value,
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status: value === "all" ? undefined : (value as any),
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="upcoming">Akan Datang</SelectItem>
                  <SelectItem value="finished">Selesai</SelectItem>
                  {isTeacher && <SelectItem value="draft">Draft</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test List - Responsive */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 mx-auto"></div>
            </div>
            <p className="text-lg font-medium text-muted-foreground animate-pulse">
              Memuat daftar ujian...
            </p>
          </div>
        </div>
      ) : tests.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="inline-flex p-6 bg-muted rounded-full mb-4">
              <BookOpen className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Tidak ada ujian ditemukan
            </h3>
            <p className="text-muted-foreground mb-6">
              Belum ada ujian yang tersedia saat ini
            </p>
            {isTeacher && (
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => navigate("/tests/create")}
              >
                <Plus className="w-5 h-5" />
                Buat Ujian Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="border-0 shadow-md hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted rounded-lg">
                      <TableHead className="font-bold">Judul Ujian</TableHead>
                      <TableHead className="font-bold">Mapel & Kelas</TableHead>
                      <TableHead className="font-bold">
                        Tanggal & Waktu
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        Status
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tests.map((test, index) => (
                      <TableRow
                        key={test.id}
                        className={`hover:bg-muted/30 transition-colors ${
                          index % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        {/* Judul Ujian */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-semibold line-clamp-1">
                                {test.title}
                              </div>
                              {Number(
                                (test as any).allowed_students_count || 0
                              ) > 0 && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                  <Shield className="w-3 h-3" /> Remidi
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Mapel & Kelas */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400">
                              <BookOpen className="w-3.5 h-3.5" />
                              {test.subject}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-purple-700 dark:text-purple-400">
                              <Users className="w-3.5 h-3.5" />
                              {test.kelas}
                            </div>
                          </div>
                        </TableCell>

                        {/* Tanggal & Waktu */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>
                                {new Date(test.start_time).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 text-green-600 dark:text-green-400" />
                              {new Date(test.start_time).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}{" "}
                              -{" "}
                              {new Date(test.end_time).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              test.is_active
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                            }`}
                          >
                            {test.is_active ? "✓ Aktif" : "○ Draft"}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          {isTeacher ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/tests/${test.id}`)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/tests/${test.id}/results`)
                                  }
                                >
                                  <ClipboardCheck className="w-4 h-4 mr-2" />
                                  Penilaian
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/monitoring`)}
                                >
                                  <Activity className="w-4 h-4 mr-2" />
                                  Monitoring
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/tests/${test.id}/edit`)
                                  }
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDuplicate(test)}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplikat
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleTogglePublish(test)}
                                  disabled={
                                    !test.is_active &&
                                    new Date(test.end_time) < new Date()
                                  }
                                  className={
                                    test.is_active
                                      ? "text-red-600 focus:text-red-600"
                                      : "text-green-600 focus:text-green-600"
                                  }
                                >
                                  {test.is_active ? (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Nonaktifkan
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="w-4 h-4 mr-2" />
                                      Publikasi
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteTest(test)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button
                              onClick={() => navigate(`/tests/${test.id}`)}
                              size="sm"
                              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Mulai Ujian
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {tests.map((test) => (
              <Card
                key={test.id}
                className="border-0 shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header with Title and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm line-clamp-2">
                          {test.title}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                          test.is_active
                            ? "bg-green-500 text-white"
                            : "bg-gray-400 text-white"
                        }`}
                      >
                        {test.is_active ? "Aktif" : "Draft"}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{test.subject}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                        <Users className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{test.kelas}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>
                          {new Date(test.start_time).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        {new Date(test.start_time).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        {new Date(test.end_time).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Badges */}
                    {Number((test as any).allowed_students_count || 0) > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-medium w-fit">
                        <Shield className="w-3 h-3" /> Remidi
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {isTeacher ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <MoreVertical className="w-4 h-4 mr-2" />
                              Menu
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => navigate(`/tests/${test.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/tests/${test.id}/results`)
                              }
                            >
                              <ClipboardCheck className="w-4 h-4 mr-2" />
                              Penilaian
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/monitoring/`)}
                            >
                              <Activity className="w-4 h-4 mr-2" />
                              Monitoring
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => navigate(`/tests/${test.id}/edit`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(test)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplikat
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleTogglePublish(test)}
                              disabled={
                                !test.is_active &&
                                new Date(test.end_time) < new Date()
                              }
                              className={
                                test.is_active
                                  ? "text-red-600 focus:text-red-600"
                                  : "text-green-600 focus:text-green-600"
                              }
                            >
                              {test.is_active ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <Globe className="w-4 h-4 mr-2" />
                                  Publikasi
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTest(test)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          onClick={() => navigate(`/tests/${test.id}`)}
                          size="sm"
                          className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Mulai Ujian
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTest} onOpenChange={() => setDeleteTest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ujian?</AlertDialogTitle>
            <AlertDialogDescription>
              Ujian yang dihapus tidak dapat dikembalikan. Semua data soal dan
              hasil ujian akan hilang. Yakin ingin menghapus ujian "
              {deleteTest?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
