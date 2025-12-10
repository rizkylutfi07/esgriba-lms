import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MathContent } from "../../components/MathContent";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
import { Checkbox } from "../../components/ui/checkbox";
import {
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit,
  BookOpen,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import questionBankService, {
  QuestionBank,
  CreateQuestionBankPayload,
  QuestionBankFilters,
} from "../../lib/services/questionBankService";
import masterDataService from "../../lib/services/masterDataService";
import { useToast } from "../../hooks/use-toast";
import { Textarea } from "../../components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function QuestionBankPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<QuestionBank[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBank | null>(
    null
  );
  const [deleteQuestion, setDeleteQuestion] = useState<QuestionBank | null>(
    null
  );
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    lastPage: 1,
    currentPage: 1,
    perPage: 50,
  });

  // Filters
  const [filters, setFilters] = useState<QuestionBankFilters>({
    per_page: 50,
    page: 1,
  });

  // Form state
  const [formData, setFormData] = useState<CreateQuestionBankPayload>({
    subject_id: 0,
    category: "",
    question_text: "",
    question_type: "multiple_choice",
    expected_answer: "",
    difficulty_level: 1,
    points: 10,
    explanation: "",
    options: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      // Load teachers only for admin
      const promises = [
        masterDataService.subjects.getAll(),
        questionBankService.getCategories(),
      ];

      if (user?.role === "admin") {
        promises.push(masterDataService.teachers.getAll());
      }

      const results = await Promise.all(promises);
      const [subjectsData, categoriesData, teachersData] = results;

      setSubjects(subjectsData);
      setCategories(categoriesData);
      if (teachersData) {
        setTeachers(teachersData);
      }

      // Set default subject if available
      if (subjectsData.length > 0 && !formData.subject_id) {
        setFormData((prev) => ({ ...prev, subject_id: subjectsData[0].id }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data awal",
        variant: "destructive",
      });
    }
  };

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await questionBankService.getQuestions(filters);

      // Handle both paginated and non-paginated responses
      if (response.data && Array.isArray(response.data)) {
        setQuestions(response.data);
        // Set pagination metadata if available
        if (response.total) {
          setPagination({
            total: response.total,
            lastPage:
              response.last_page ||
              Math.ceil(response.total / (filters.per_page || 50)),
            currentPage: response.current_page || filters.page || 1,
            perPage: response.per_page || filters.per_page || 50,
          });
        }
      } else {
        // Non-paginated response
        setQuestions(Array.isArray(response) ? response : []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat soal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Prepare data based on question type
      const submitData: any = {
        ...formData,
        // Untuk essay, kirim array kosong atau undefined untuk options
        options:
          formData.question_type === "essay"
            ? []
            : formData.options?.filter((opt) => opt.text.trim() !== ""),
      };

      // Only include teacher_id if admin and has valid value
      if (user?.role === "admin" && formData.teacher_id) {
        submitData.teacher_id = formData.teacher_id;
      } else {
        // Remove teacher_id if not admin or no value
        delete submitData.teacher_id;
      }

      if (editingQuestion) {
        await questionBankService.updateQuestion(
          editingQuestion.id,
          submitData
        );
        toast({
          title: "Sukses",
          description: "Soal berhasil diperbarui",
        });
      } else {
        await questionBankService.createQuestion(submitData);
        toast({
          title: "Sukses",
          description: "Soal berhasil ditambahkan",
        });
      }
      setShowDialog(false);
      resetForm();
      loadQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan soal",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteQuestion) return;

    try {
      await questionBankService.deleteQuestion(deleteQuestion.id);
      toast({
        title: "Sukses",
        description: "Soal berhasil dihapus",
      });
      setDeleteQuestion(null);
      loadQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus soal",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;

    try {
      await questionBankService.bulkDeleteQuestions(selectedQuestions);
      toast({
        title: "Sukses",
        description: `${selectedQuestions.length} soal berhasil dihapus`,
      });
      setSelectedQuestions([]);
      setShowBulkDeleteDialog(false);
      loadQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus soal",
        variant: "destructive",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((q) => q.id));
    }
  };

  const toggleSelectQuestion = (id: number) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter((qId) => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleDuplicate = async (question: QuestionBank) => {
    try {
      await questionBankService.duplicateQuestion(question.id);
      toast({
        title: "Sukses",
        description: "Soal berhasil diduplikasi",
      });
      loadQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menduplikasi soal",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (question: QuestionBank) => {
    setEditingQuestion(question);
    setFormData({
      subject_id: question.subject_id,
      category: question.category,
      question_text: question.question_text,
      question_type: question.question_type,
      expected_answer: question.expected_answer || "",
      difficulty_level: question.difficulty_level,
      points: question.points,
      explanation: question.explanation || "",
      teacher_id: question.created_by, // Set current creator
      options:
        question.options?.map((opt) => ({
          text: opt.text,
          is_correct: opt.is_correct,
        })) || [],
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      subject_id: subjects.length > 0 ? subjects[0].id : 0,
      category: "",
      question_text: "",
      question_type: "multiple_choice",
      expected_answer: "",
      difficulty_level: 1,
      points: 10,
      explanation: "",
      options: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
    });
  };

  const updateOption = (
    index: number,
    field: "text" | "is_correct",
    value: string | boolean
  ) => {
    const newOptions = [...formData.options!];
    if (field === "is_correct" && value === true) {
      // Only one correct answer for multiple choice
      newOptions.forEach((opt, i) => {
        opt.is_correct = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setFormData({ ...formData, options: newOptions });
  };

  const difficultyLabels = { 1: "Mudah", 2: "Sedang", 3: "Sulit" };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bank Soal</h1>
          <p className="text-muted-foreground mt-1">
            Kelola bank soal untuk digunakan pada ujian
          </p>
        </div>
        <div className="flex gap-2">
          {selectedQuestions.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus ({selectedQuestions.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              // Pass subject_id if filtered
              const url = filters.subject_id
                ? `/question-bank/import?subject_id=${filters.subject_id}`
                : "/question-bank/import";
              navigate(url);
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Soal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`grid grid-cols-1 ${
              user?.role === "admin" ? "md:grid-cols-5" : "md:grid-cols-4"
            } gap-4`}
          >
            <div>
              <Label>Cari Soal</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari teks soal..."
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
                value={filters.subject_id?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    subject_id: value === "all" ? undefined : parseInt(value),
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {user?.role === "admin" && (
              <div>
                <Label>Pembuat Soal (Guru)</Label>
                <Select
                  value={filters.creator_id?.toString() || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      creator_id: value === "all" ? undefined : parseInt(value),
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Guru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Guru</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Tingkat Kesulitan</Label>
              <Select
                value={filters.difficulty_level?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    difficulty_level:
                      value === "all"
                        ? undefined
                        : (parseInt(value) as 1 | 2 | 3),
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="1">Mudah</SelectItem>
                  <SelectItem value="2">Sedang</SelectItem>
                  <SelectItem value="3">Sulit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipe Soal</Label>
              <Select
                value={filters.question_type || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    question_type: value === "all" ? undefined : (value as any),
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="multiple_choice">Pilihan Ganda</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada soal di bank</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Soal Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <Checkbox
                        checked={
                          selectedQuestions.length === questions.length &&
                          questions.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                      Tipe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Pertanyaan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                      Mapel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                      Pembuat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                      Tingkat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                      Poin
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {questions.map((question, index) => (
                    <tr
                      key={question.id}
                      className={`hover:bg-muted/30 transition ${
                        selectedQuestions.includes(question.id)
                          ? "bg-blue-500/10 dark:bg-blue-500/20"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() =>
                            toggleSelectQuestion(question.id)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            question.question_type === "essay"
                              ? "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                              : "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          }`}
                        >
                          {question.question_type === "essay" ? "Essay" : "PG"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm max-w-md">
                          <MathContent
                            content={
                              question.question_text.length > 100
                                ? question.question_text.substring(0, 100) +
                                  "..."
                                : question.question_text
                            }
                            className="line-clamp-2"
                          />
                        </div>
                        {question.options && question.options.length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {question.options.map((opt, idx) =>
                              opt.is_correct ? (
                                <span
                                  key={idx}
                                  className="text-green-600 dark:text-green-400 font-medium"
                                >
                                  ✓ {String.fromCharCode(65 + idx)}
                                </span>
                              ) : null
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {question.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {question.subject?.name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {question.creator?.name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            question.difficulty_level === 1
                              ? "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                              : question.difficulty_level === 2
                              ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                              : "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                          }`}
                        >
                          {difficultyLabels[question.difficulty_level]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {question.points}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(question)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(question)}
                            title="Duplikasi"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteQuestion(question)}
                            title="Hapus"
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && questions.length > 0 && pagination.total > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan{" "}
                  {(pagination.currentPage - 1) * pagination.perPage + 1} -{" "}
                  {Math.min(
                    pagination.currentPage * pagination.perPage,
                    pagination.total
                  )}{" "}
                  dari {pagination.total} soal
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">
                    Per halaman:
                  </Label>
                  <Select
                    value={filters.per_page?.toString() || "50"}
                    onValueChange={(value) => {
                      setFilters({
                        ...filters,
                        per_page: parseInt(value),
                        page: 1,
                      });
                      setSelectedQuestions([]); // Clear selection on page size change
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      ...filters,
                      page: Math.max(1, (filters.page || 1) - 1),
                    });
                    setSelectedQuestions([]); // Clear selection on page change
                  }}
                  disabled={!filters.page || filters.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.lastPage) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.lastPage <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.lastPage - 2
                      ) {
                        pageNum = pagination.lastPage - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.currentPage === pageNum
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setFilters({ ...filters, page: pageNum });
                            setSelectedQuestions([]); // Clear selection on page change
                          }}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      ...filters,
                      page: Math.min(
                        pagination.lastPage,
                        (filters.page || 1) + 1
                      ),
                    });
                    setSelectedQuestions([]); // Clear selection on page change
                  }}
                  disabled={
                    !filters.page || filters.page >= pagination.lastPage
                  }
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk{" "}
              {editingQuestion ? "mengubah" : "menambah"} soal ke bank
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mata Pelajaran *</Label>
                <Select
                  value={formData.subject_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 ? (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        Tidak ada mata pelajaran
                      </div>
                    ) : (
                      subjects.map((subject) => (
                        <SelectItem
                          key={subject.id}
                          value={subject.id.toString()}
                        >
                          {subject.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {subjects.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Belum ada mata pelajaran. Hubungi admin.
                  </p>
                )}
              </div>

              <div>
                <Label>Kategori *</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Contoh: Trigonometri"
                  list="categories-list"
                />
                {categories.length > 0 && (
                  <datalist id="categories-list">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Ketik atau pilih dari kategori yang ada
                </p>
              </div>

              {user?.role === "admin" && (
                <div>
                  <Label>Ditugaskan untuk Guru (Opsional)</Label>
                  <Select
                    value={formData.teacher_id?.toString() || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        teacher_id:
                          value === "none" ? undefined : parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih guru (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Tidak ada (atas nama admin)
                      </SelectItem>
                      {teachers
                        .filter(
                          (t) =>
                            !formData.subject_id ||
                            t.subjects?.some(
                              (s: any) => s.id === formData.subject_id
                            )
                        )
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Soal akan ditampilkan atas nama guru yang dipilih
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipe Soal *</Label>
                <Select
                  value={formData.question_type}
                  onValueChange={(value: any) => {
                    // Reset options based on question type
                    let newOptions: Array<{
                      text: string;
                      is_correct: boolean;
                    }> = [];
                    if (value === "multiple_choice") {
                      newOptions = [
                        { text: "", is_correct: false },
                        { text: "", is_correct: false },
                        { text: "", is_correct: false },
                        { text: "", is_correct: false },
                      ];
                    }
                    // essay tidak perlu options
                    setFormData({
                      ...formData,
                      question_type: value,
                      options: newOptions,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      Pilihan Ganda
                    </SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Kesulitan *</Label>
                <Select
                  value={formData.difficulty_level.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      difficulty_level: parseInt(value) as 1 | 2 | 3,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Mudah</SelectItem>
                    <SelectItem value="2">Sedang</SelectItem>
                    <SelectItem value="3">Sulit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Poin *</Label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Pertanyaan *</Label>
              <Textarea
                value={formData.question_text}
                onChange={(e) =>
                  setFormData({ ...formData, question_text: e.target.value })
                }
                placeholder="Tulis pertanyaan di sini..."
                rows={4}
              />
            </div>

            {formData.question_type === "essay" && (
              <div>
                <Label>Jawaban yang Diharapkan (Opsional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Sebagai acuan guru saat menilai jawaban siswa
                </p>
                <Textarea
                  value={formData.expected_answer || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expected_answer: e.target.value,
                    })
                  }
                  placeholder="Contoh jawaban yang benar..."
                  rows={4}
                />
              </div>
            )}

            {formData.question_type === "multiple_choice" && (
              <div className="space-y-2">
                <Label>Pilihan Jawaban *</Label>
                {formData.options!.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        updateOption(index, "text", e.target.value)
                      }
                      placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={option.is_correct ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateOption(index, "is_correct", !option.is_correct)
                      }
                    >
                      {option.is_correct ? "✓ Benar" : "Tandai Benar"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {formData.question_type === "essay" && (
              <div className="bg-blue-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Info:</strong> Soal essay tidak memerlukan pilihan
                  jawaban. Siswa akan menjawab dengan mengetik jawaban mereka
                  sendiri.
                </p>
              </div>
            )}

            <div>
              <Label>Penjelasan (Opsional)</Label>
              <Textarea
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder="Penjelasan jawaban..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editingQuestion ? "Simpan" : "Tambah"} Soal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteQuestion}
        onOpenChange={() => setDeleteQuestion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Soal?</AlertDialogTitle>
            <AlertDialogDescription>
              Soal yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus
              soal ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Bulk Delete Confirmation */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus {selectedQuestions.length} Soal?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus {selectedQuestions.length} soal yang
              dipilih secara permanen. Data yang dihapus tidak dapat
              dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
