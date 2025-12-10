import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import questionPackageService, {
  QuestionPackage,
  CreatePackagePayload,
} from "../../lib/services/questionPackageService";
import masterDataService from "../../lib/services/masterDataService";

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface TeacherSubject {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
  email?: string;
  subjects?: TeacherSubject[];
}

const difficultyLabels = {
  easy: "Mudah",
  medium: "Sedang",
  hard: "Sulit",
};

const difficultyColors = {
  easy: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  medium:
    "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  hard: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export default function QuestionPackages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [packages, setPackages] = useState<QuestionPackage[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<QuestionPackage | null>(
    null
  );
  const [formData, setFormData] = useState<CreatePackagePayload>({
    name: "",
    description: "",
    subject_id: 0,
    difficulty_level: "medium",
    teacher_id: undefined,
  });

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadPackages();
  }, [selectedSubject, selectedDifficulty, selectedTeacher, searchQuery]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadTeachers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin && selectedTeacher !== "all") {
      setSelectedTeacher("all");
    }
  }, [isAdmin, selectedTeacher]);

  const filteredTeachers = useMemo(() => {
    if (!isAdmin) return [];

    if (selectedSubject === "all") {
      return teachers;
    }

    const subjectId = Number.parseInt(selectedSubject, 10);
    if (Number.isNaN(subjectId)) return teachers;

    return teachers.filter((teacher) =>
      (teacher.subjects || []).some((subject) => subject.id === subjectId)
    );
  }, [isAdmin, teachers, selectedSubject]);

  useEffect(() => {
    if (!isAdmin) return;

    if (selectedTeacher === "all") return;

    const teacherId = Number.parseInt(selectedTeacher, 10);
    if (Number.isNaN(teacherId)) {
      setSelectedTeacher("all");
      return;
    }

    const exists = filteredTeachers.some((teacher) => teacher.id === teacherId);
    if (!exists) {
      setSelectedTeacher("all");
    }
  }, [filteredTeachers, isAdmin, selectedTeacher]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedSubject !== "all")
        params.subject_id = Number.parseInt(selectedSubject, 10);
      if (selectedDifficulty !== "all")
        params.difficulty_level = selectedDifficulty;
      if (searchQuery) params.search = searchQuery;
      if (isAdmin && selectedTeacher !== "all")
        params.teacher_id = Number.parseInt(selectedTeacher, 10);

      const response = await questionPackageService.getAll(params);
      setPackages(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat paket soal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await masterDataService.subjects.getAll();
      setSubjects(response);

      // Set default subject in form when creating package
      if (response.length > 0) {
        setFormData((prev) => ({
          ...prev,
          subject_id: prev.subject_id || response[0].id,
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat mata pelajaran",
        variant: "destructive",
      });
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await masterDataService.teachers.getAll();
      const normalized = (response || []).map((teacher: any) => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        subjects: Array.isArray(teacher.subjects)
          ? teacher.subjects.map((subject: any) => ({
              id: subject.id,
              name: subject.name ?? subject.subject_name ?? "",
            }))
          : [],
      }));
      setTeachers(normalized);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data guru",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = (pkg?: QuestionPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description || "",
        subject_id: pkg.subject_id,
        difficulty_level: pkg.difficulty_level,
        teacher_id: pkg.created_by, // Set to current creator
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        description: "",
        subject_id: subjects[0]?.id ?? 0,
        difficulty_level: "medium",
        teacher_id: undefined,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingPackage(null);
    setFormData({
      name: "",
      description: "",
      subject_id: subjects[0]?.id ?? 0,
      difficulty_level: "medium",
      teacher_id: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama paket harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject_id) {
      toast({
        title: "Error",
        description: "Mata pelajaran harus dipilih",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPackage) {
        await questionPackageService.update(editingPackage.id, formData);
        toast({
          title: "Berhasil",
          description: "Paket soal berhasil diperbarui",
        });
      } else {
        await questionPackageService.create(formData);
        toast({ title: "Berhasil", description: "Paket soal berhasil dibuat" });
      }
      handleCloseDialog();
      loadPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menyimpan paket soal",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (pkg: QuestionPackage) => {
    try {
      await questionPackageService.duplicate(pkg.id);
      toast({
        title: "Berhasil",
        description: "Paket soal berhasil diduplikasi",
      });
      loadPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menduplikasi paket soal",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (pkg: QuestionPackage) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.name}"?`)) {
      return;
    }

    try {
      await questionPackageService.delete(pkg.id);
      toast({ title: "Berhasil", description: "Paket soal berhasil dihapus" });
      loadPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menghapus paket soal",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paket Soal</h1>
          <p className="text-muted-foreground mt-1">
            Kelola paket soal untuk memudahkan pembuatan ujian
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Buat Paket Baru
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div
            className={`grid grid-cols-1 ${
              isAdmin ? "md:grid-cols-4" : "md:grid-cols-3"
            } gap-4`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari paket soal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkat</SelectItem>
                <SelectItem value="easy">Mudah</SelectItem>
                <SelectItem value="medium">Sedang</SelectItem>
                <SelectItem value="hard">Sulit</SelectItem>
              </SelectContent>
            </Select>
            {isAdmin && (
              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Guru" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Guru</SelectItem>
                  {filteredTeachers.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      Tidak ada guru untuk mapel ini
                    </SelectItem>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {teacher.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package List - Responsive */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 mx-auto"></div>
            </div>
            <p className="text-lg font-medium text-muted-foreground animate-pulse">
              Memuat paket soal...
            </p>
          </div>
        </div>
      ) : packages.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="inline-flex p-6 bg-muted rounded-full mb-4">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Tidak ada paket soal ditemukan
            </h3>
            <p className="text-muted-foreground mb-6">
              Belum ada paket soal yang tersedia saat ini
            </p>
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-5 h-5" />
              Buat Paket Pertama
            </Button>
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
                    <TableRow className="bg-muted/50 hover:bg-muted">
                      <TableHead className="font-bold">Nama Paket</TableHead>
                      <TableHead className="font-bold">
                        Mata Pelajaran
                      </TableHead>
                      <TableHead className="font-bold">Tingkat</TableHead>
                      <TableHead className="font-bold text-center">
                        Total Soal
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        Total Poin
                      </TableHead>
                      <TableHead className="font-bold">Dibuat Oleh</TableHead>
                      <TableHead className="font-bold text-right">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg, index) => (
                      <TableRow
                        key={pkg.id}
                        className={`hover:bg-muted/30 transition-colors ${
                          index % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        {/* Nama Paket */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold line-clamp-1">
                                {pkg.name}
                              </div>
                              {pkg.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {pkg.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Mata Pelajaran */}
                        <TableCell>
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                            {pkg.subject?.name}
                          </span>
                        </TableCell>

                        {/* Tingkat */}
                        <TableCell>
                          <Badge
                            className={`${
                              difficultyColors[pkg.difficulty_level]
                            } border-0`}
                          >
                            {difficultyLabels[pkg.difficulty_level]}
                          </Badge>
                        </TableCell>

                        {/* Total Soal */}
                        <TableCell className="text-center">
                          <span className="font-semibold">
                            {pkg.questions?.length || 0}
                          </span>
                        </TableCell>

                        {/* Total Poin */}
                        <TableCell className="text-center">
                          <span className="font-semibold">
                            {pkg.questions?.reduce(
                              (sum, q) => sum + (q.points || 0),
                              0
                            ) || 0}
                          </span>
                        </TableCell>

                        {/* Dibuat Oleh */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {pkg.creator?.name}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
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
                                onClick={() =>
                                  navigate(`/question-packages/${pkg.id}`)
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Kelola Paket
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenDialog(pkg)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(pkg)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Duplikat
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(pkg)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className="border-0 shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header with Title and Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm line-clamp-2">
                          {pkg.name}
                        </h3>
                        {pkg.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`${
                          difficultyColors[pkg.difficulty_level]
                        } border-0 flex-shrink-0`}
                      >
                        {difficultyLabels[pkg.difficulty_level]}
                      </Badge>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">
                          Mata Pelajaran
                        </span>
                        <span className="font-medium text-blue-700 dark:text-blue-400 truncate">
                          {pkg.subject?.name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">
                          Dibuat Oleh
                        </span>
                        <span className="font-medium truncate">
                          {pkg.creator?.name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">
                          Total Soal
                        </span>
                        <span className="font-semibold">
                          {pkg.questions?.length || 0} soal
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">
                          Total Poin
                        </span>
                        <span className="font-semibold">
                          {pkg.questions?.reduce(
                            (sum, q) => sum + (q.points || 0),
                            0
                          ) || 0}{" "}
                          poin
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/question-packages/${pkg.id}`)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Kelola
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog(pkg)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(pkg)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplikat
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(pkg)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Paket Soal" : "Buat Paket Soal Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi informasi paket soal di bawah ini
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Paket *</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Paket Soal Matematika BAB 1"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat tentang paket soal ini..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Mata Pelajaran *</Label>
                <Select
                  value={
                    formData.subject_id
                      ? formData.subject_id.toString()
                      : undefined
                  }
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      subject_id: Number.parseInt(value, 10),
                    })
                  }
                  disabled={subjects.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Tingkat Kesulitan *</Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, difficulty_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Mudah</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="hard">Sulit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="teacher">
                    Ditugaskan untuk Guru (Opsional)
                  </Label>
                  <Select
                    value={formData.teacher_id?.toString() || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        teacher_id:
                          value === "none"
                            ? undefined
                            : Number.parseInt(value, 10),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih guru (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Tidak ada (dibuat oleh admin)
                      </SelectItem>
                      {teachers
                        .filter((teacher) => {
                          // Filter guru berdasarkan mapel yang dipilih
                          if (!formData.subject_id) return true;
                          return (teacher.subjects || []).some(
                            (subject) => subject.id === formData.subject_id
                          );
                        })
                        .map((teacher) => (
                          <SelectItem
                            key={teacher.id}
                            value={teacher.id.toString()}
                          >
                            {teacher.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Jika dipilih, paket soal akan ditampilkan sebagai dibuat
                    oleh guru tersebut
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Batal
              </Button>
              <Button type="submit">
                {editingPackage ? "Simpan" : "Buat Paket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
