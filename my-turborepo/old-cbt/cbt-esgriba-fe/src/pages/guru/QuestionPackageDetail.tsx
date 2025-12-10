import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { MathContent } from "../../components/MathContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "../../components/ui/label";
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
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "../../hooks/use-toast";
import { useAuthStore } from "../../store/authStore";
import questionPackageService, {
  QuestionPackage,
} from "../../lib/services/questionPackageService";
import questionBankService from "../../lib/services/questionBankService";
import masterDataService from "../../lib/services/masterDataService";

interface PackageImportQuestion {
  question_text: string;
  question_type?: string; // "PG" or "ESSAY"
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string;
  correct_answer: string;
  category: string;
  difficulty: string;
  points: number;
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

const difficultyTextMap: Record<string, 1 | 2 | 3> = {
  mudah: 1,
  sedang: 2,
  sulit: 3,
};

export default function QuestionPackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<QuestionPackage | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState<string>("");
  const [parsedImportQuestions, setParsedImportQuestions] = useState<
    PackageImportQuestion[]
  >([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isImportingQuestions, setIsImportingQuestions] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [showImportResult, setShowImportResult] = useState(false);
  const [isGeneratingDocxTemplate, setIsGeneratingDocxTemplate] =
    useState(false);
  const [selectedPackageQuestions, setSelectedPackageQuestions] = useState<
    number[]
  >([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Edit question states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    question_text: "",
    question_type: "multiple_choice" as "multiple_choice" | "essay",
    category: "",
    difficulty_level: 2 as 1 | 2 | 3,
    points: 10,
    options: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
    expected_answer: "",
  });
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false);

  useEffect(() => {
    loadPackageDetail();
    loadTeachers();
  }, [id]);

  const loadTeachers = async () => {
    if (user?.role === "admin") {
      try {
        const teachersData = await masterDataService.teachers.getAll();
        setTeachers(teachersData);
      } catch (error) {
        console.error("Failed to load teachers:", error);
      }
    }
  };

  const loadPackageDetail = async (silent = false, bustCache = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await questionPackageService.getOne(parseInt(id!), bustCache);
      console.log("Package data loaded:", data);
      console.log("Questions count:", data.questions?.length || 0);
      setPackageData(data);
    } catch (error: any) {
      console.error("Error loading package:", error);
      toast({
        title: "Error",
        description: "Gagal memuat detail paket",
        variant: "destructive",
      });
      navigate("/question-packages");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadAvailableQuestions = async () => {
    if (!packageData) return;

    try {
      const response = await questionBankService.getQuestions({
        subject_id: packageData.subject_id,
        per_page: 100,
      });

      // Filter out questions already in package
      const existingIds = packageData.questions?.map((q) => q.id) || [];
      const available = response.data.filter(
        (q: any) => !existingIds.includes(q.id)
      );
      setAvailableQuestions(available);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat soal",
        variant: "destructive",
      });
    }
  };

  const handleAddQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Pilih minimal 1 soal",
        variant: "destructive",
      });
      return;
    }

    try {
      await questionPackageService.addQuestions(
        parseInt(id!),
        selectedQuestions
      );

      // Reload package data silently (without loading screen)
      await loadPackageDetail(true);

      toast({
        title: "Sukses",
        description: `${selectedQuestions.length} soal berhasil ditambahkan`,
      });
      setShowAddDialog(false);
      setSelectedQuestions([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menambahkan soal",
        variant: "destructive",
      });
    }
  };

  const handleRemoveQuestion = async (questionId: number) => {
    if (!confirm("Yakin ingin menghapus soal ini dari paket?")) return;

    try {
      await questionPackageService.removeQuestion(parseInt(id!), questionId);

      // Reload package data silently (without loading screen)
      await loadPackageDetail(true);

      toast({
        title: "Sukses",
        description: "Soal berhasil dihapus dari paket",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus soal",
        variant: "destructive",
      });
    }
  };

  const togglePackageQuestionSelection = (questionId: number) => {
    setSelectedPackageQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAllPackageQuestions = () => {
    if (!packageData?.questions) return;

    if (selectedPackageQuestions.length === packageData.questions.length) {
      setSelectedPackageQuestions([]);
    } else {
      setSelectedPackageQuestions(packageData.questions.map((q) => q.id));
    }
  };

  const handleBulkRemoveQuestions = async () => {
    if (selectedPackageQuestions.length === 0) return;

    try {
      // Remove questions one by one
      for (const questionId of selectedPackageQuestions) {
        await questionPackageService.removeQuestion(parseInt(id!), questionId);
      }

      // Reload package data silently (without loading screen)
      await loadPackageDetail(true);

      toast({
        title: "Sukses",
        description: `${selectedPackageQuestions.length} soal berhasil dihapus dari paket`,
      });

      setSelectedPackageQuestions([]);
      setShowBulkDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus soal",
        variant: "destructive",
      });
    }
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleEditQuestion = async (question: any) => {
    try {
      // Load full question data from bank
      const fullQuestion = await questionBankService.getQuestion(question.id);

      setEditingQuestion(fullQuestion);

      // Populate form with question data
      const difficultyLevel = fullQuestion.difficulty_level || 2;

      if (fullQuestion.question_type === "essay") {
        setEditForm({
          question_text: fullQuestion.question_text,
          question_type: "essay",
          category: fullQuestion.category || "",
          difficulty_level: difficultyLevel as 1 | 2 | 3,
          points: fullQuestion.points || 10,
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
          ],
          expected_answer: fullQuestion.expected_answer || "",
        });
      } else {
        // Multiple choice
        const options = fullQuestion.options || [];
        const filledOptions = [
          ...options.map((opt: any) => ({
            text: opt.text || "",
            is_correct: opt.is_correct || false,
          })),
          ...Array(5 - options.length).fill({ text: "", is_correct: false }),
        ].slice(0, 5);

        setEditForm({
          question_text: fullQuestion.question_text,
          question_type: "multiple_choice",
          category: fullQuestion.category || "",
          difficulty_level: difficultyLevel as 1 | 2 | 3,
          points: fullQuestion.points || 10,
          options: filledOptions,
          expected_answer: "",
        });
      }

      setShowEditDialog(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data soal",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    // Validation
    if (!editForm.question_text.trim()) {
      toast({
        title: "Error",
        description: "Teks soal tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (editForm.question_type === "multiple_choice") {
      const filledOptions = editForm.options.filter(
        (opt) => opt.text.trim() !== ""
      );
      if (filledOptions.length < 2) {
        toast({
          title: "Error",
          description: "Minimal 2 pilihan jawaban harus diisi",
          variant: "destructive",
        });
        return;
      }

      const hasCorrectAnswer = filledOptions.some((opt) => opt.is_correct);
      if (!hasCorrectAnswer) {
        toast({
          title: "Error",
          description: "Harus ada minimal 1 jawaban yang benar",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Essay
      if (!editForm.expected_answer.trim()) {
        toast({
          title: "Error",
          description: "Kunci jawaban essay tidak boleh kosong",
          variant: "destructive",
        });
        return;
      }
    }

    setIsUpdatingQuestion(true);

    try {
      const updatePayload: any = {
        question_text: editForm.question_text,
        question_type: editForm.question_type,
        category: editForm.category,
        difficulty_level: editForm.difficulty_level,
        points: editForm.points,
      };

      if (editForm.question_type === "multiple_choice") {
        updatePayload.options = editForm.options
          .filter((opt) => opt.text.trim() !== "")
          .map((opt) => ({
            text: opt.text,
            is_correct: opt.is_correct,
          }));
      } else {
        updatePayload.expected_answer = editForm.expected_answer;
      }

      await questionBankService.updateQuestion(
        editingQuestion.id,
        updatePayload
      );

      // Reload package data silently with cache bust to ensure fresh statistics
      await loadPackageDetail(true, true);

      toast({
        title: "Sukses",
        description: "Soal berhasil diupdate",
      });

      setShowEditDialog(false);
      setEditingQuestion(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Gagal mengupdate soal",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingQuestion(false);
    }
  };

  const resetImportState = () => {
    setImportFile(null);
    setParsedImportQuestions([]);
    setImportSummary(null);
    setShowImportResult(false);
    setIsParsingFile(false);
    setIsImportingQuestions(false);
  };

  const handleImportDialogChange = (open: boolean) => {
    if (!open) {
      resetImportState();
    }
    setShowImportDialog(open);
  };

  const handleImportFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";
    setImportFile(file);
    setParsedImportQuestions([]);
    setImportSummary(null);
    setShowImportResult(false);
  };

  const normalizeCell = (value: any) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    return String(value).trim();
  };

  const validateImportRow = (
    rawRow: Record<string, any>,
    rowNumber: number
  ): PackageImportQuestion => {
    const errors: string[] = [];

    const questionText = normalizeCell(
      rawRow["Soal"] ?? rawRow["Question"] ?? rawRow["Pertanyaan"]
    ) as string;
    const optionA = normalizeCell(rawRow["Pilihan A"] ?? rawRow["Option A"]);
    const optionB = normalizeCell(rawRow["Pilihan B"] ?? rawRow["Option B"]);
    const optionC = normalizeCell(rawRow["Pilihan C"] ?? rawRow["Option C"]);
    const optionD = normalizeCell(rawRow["Pilihan D"] ?? rawRow["Option D"]);
    const optionE = normalizeCell(rawRow["Pilihan E"] ?? rawRow["Option E"]);
    const category = normalizeCell(
      rawRow["Kategori"] ?? rawRow["Category"]
    ) as string;
    const difficulty = normalizeCell(
      rawRow["Tingkat Kesulitan"] ?? rawRow["Kesulitan"] ?? rawRow["Difficulty"]
    )
      .toString()
      .toLowerCase();
    const pointsValue = normalizeCell(
      rawRow["Poin"] ?? rawRow["Points"] ?? rawRow["Point"]
    );
    const correctAnswer = normalizeCell(
      rawRow["Jawaban Benar"] ?? rawRow["Jawaban"] ?? rawRow["Answer"]
    )
      .toString()
      .toUpperCase();

    if (!questionText) {
      errors.push("Soal tidak boleh kosong");
    }
    if (!optionA) {
      errors.push("Pilihan A wajib diisi");
    }
    if (!optionB) {
      errors.push("Pilihan B wajib diisi");
    }
    if (!optionC) {
      errors.push("Pilihan C wajib diisi");
    }
    if (!optionD) {
      errors.push("Pilihan D wajib diisi");
    }

    if (!correctAnswer || !["A", "B", "C", "D", "E"].includes(correctAnswer)) {
      errors.push("Jawaban Benar harus salah satu dari A-E");
    }

    if (correctAnswer === "E" && !optionE) {
      errors.push("Pilihan E wajib diisi jika menjadi jawaban benar");
    }

    if (!category) {
      errors.push("Kategori tidak boleh kosong");
    }

    if (!difficulty || !difficultyTextMap[difficulty]) {
      errors.push("Tingkat kesulitan harus mudah, sedang, atau sulit");
    }

    const parsedPoints = Number(pointsValue);
    const hasValidPoints = Number.isFinite(parsedPoints) && parsedPoints > 0;
    if (!hasValidPoints) {
      errors.push("Poin harus berupa angka positif");
    }
    const points = hasValidPoints ? Math.round(parsedPoints) : 1;

    return {
      question_text: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      option_e: optionE,
      correct_answer: correctAnswer,
      category,
      difficulty,
      points,
      rowNumber,
      isValid: errors.length === 0,
      errors,
    };
  };

  const parseExcelFile = async (file: File) => {
    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    if (!rows || rows.length === 0) {
      throw new Error("Tidak ada data pada file.");
    }

    return rows.map((row, index) => validateImportRow(row, index + 2));
  };

  const parseDocxNomorFormat = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        "/question-packages/parse-docx",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Parsing failed");
      }

      console.log("=== SERVER PARSING COMPLETE ===");
      console.log(`Total questions: ${result.data.total}`);
      console.log(
        `Valid: ${result.data.valid}, Invalid: ${result.data.invalid}`
      );

      // Debug: Log what server found
      if (result.debug) {
        console.log("=== SERVER DEBUG INFO ===");
        console.log("Element types found:", result.debug.unique_element_types);
        console.log(
          "First 10 text segments:",
          result.debug.all_text.slice(0, 10)
        );
      }

      // Debug: Check if images are embedded in questions
      if (result.data.questions.length > 0) {
        console.log("=== IMAGE CHECK ===");
        result.data.questions.forEach((q: any, idx: number) => {
          const hasImgInQuestion = q.question_text?.includes("<img");
          const hasImgInOptions =
            q.option_a?.includes("<img") ||
            q.option_b?.includes("<img") ||
            q.option_c?.includes("<img") ||
            q.option_d?.includes("<img");

          if (hasImgInQuestion || hasImgInOptions) {
            console.log(`Question ${idx + 1}:`, {
              hasImageInQuestion: hasImgInQuestion,
              hasImageInOptions: hasImgInOptions,
              questionPreview: q.question_text?.substring(0, 200),
            });
          }
        });
      }

      const parsed: PackageImportQuestion[] = result.data.questions.map(
        (q: any) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          option_e: q.option_e,
          correct_answer: q.correct_answer,
          category: q.category || "Umum",
          difficulty: q.difficulty || "sedang",
          points: q.points,
          rowNumber: q.rowNumber,
          isValid: q.valid,
          errors: q.errors || [],
        })
      );

      return parsed;
    } catch (error: any) {
      console.error("Error parsing DOCX:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to parse DOCX file"
      );
    }
  };

  const parseImportFile = async () => {
    if (!importFile) return;

    setIsParsingFile(true);
    setParsedImportQuestions([]);
    setImportSummary(null);
    setShowImportResult(false);

    try {
      const extension = importFile.name.split(".").pop()?.toLowerCase() ?? "";
      let parsed: PackageImportQuestion[] = [];

      if (extension === "docx") {
        parsed = await parseDocxNomorFormat(importFile);
        if (parsed.length === 0) {
          throw new Error(
            "Tidak ditemukan soal pada file DOCX. Pastikan format mengikuti template [NOMOR]."
          );
        }
      } else if (extension === "xlsx" || extension === "xls") {
        parsed = await parseExcelFile(importFile);
      } else {
        throw new Error(
          "Format file tidak didukung. Gunakan file Excel (.xlsx/.xls) atau Word (.docx)."
        );
      }

      setParsedImportQuestions(parsed);
    } catch (error: any) {
      console.error("Error parsing import file", error);
      toast({
        title: "Gagal Membaca File",
        description:
          error?.message ||
          "Pastikan format file mengikuti template yang tersedia",
        variant: "destructive",
      });
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleImportQuestions = async () => {
    if (!packageData) return;

    if (!packageData.subject_id) {
      toast({
        title: "Paket Belum Lengkap",
        description: "Tentukan mata pelajaran untuk paket ini sebelum import",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = parsedImportQuestions.filter((q) => q.isValid);
    if (validQuestions.length === 0) {
      toast({
        title: "Tidak Ada Soal Valid",
        description: "Perbaiki data soal yang bermasalah terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsImportingQuestions(true);
    const createdQuestionIds: number[] = [];
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      for (const question of validQuestions) {
        try {
          const difficultyLevel = difficultyTextMap[question.difficulty];
          if (!difficultyLevel) {
            throw new Error("Tingkat kesulitan tidak valid");
          }

          // Determine question type and prepare payload
          const isEssay = question.question_type === "ESSAY";
          const questionPayload: any = {
            subject_id: packageData.subject_id,
            question_text: question.question_text,
            category: question.category,
            question_type: isEssay ? "essay" : "multiple_choice",
            difficulty_level: difficultyLevel,
            points: question.points,
          };

          // Include teacher_id if admin and has value
          if (user?.role === "admin" && teacherId) {
            questionPayload.teacher_id = parseInt(teacherId);
          }

          // Add options only for multiple choice questions
          if (!isEssay) {
            questionPayload.options = [
              {
                text: question.option_a,
                is_correct: question.correct_answer === "A",
              },
              {
                text: question.option_b,
                is_correct: question.correct_answer === "B",
              },
              {
                text: question.option_c,
                is_correct: question.correct_answer === "C",
              },
              {
                text: question.option_d,
                is_correct: question.correct_answer === "D",
              },
              ...(question.option_e
                ? [
                    {
                      text: question.option_e,
                      is_correct: question.correct_answer === "E",
                    },
                  ]
                : []),
            ];
          } else {
            // For essay questions, send the answer as expected_answer
            questionPayload.expected_answer = question.correct_answer;
          }

          const response = await questionBankService.createQuestion(
            questionPayload
          );

          const newQuestionId =
            response?.question?.id ?? response?.data?.question?.id;
          if (!newQuestionId) {
            throw new Error("ID soal baru tidak ditemukan dari response");
          }
          createdQuestionIds.push(newQuestionId);
          success++;
        } catch (error: any) {
          failed++;
          errors.push(
            `Baris ${question.rowNumber}: ${
              error?.response?.data?.message ||
              error?.message ||
              "Gagal menambahkan soal"
            }`
          );
        }
      }

      if (createdQuestionIds.length > 0) {
        try {
          await questionPackageService.addQuestions(
            packageData.id,
            createdQuestionIds
          );
        } catch (error: any) {
          failed += createdQuestionIds.length;
          success = Math.max(0, success - createdQuestionIds.length);
          errors.push(
            error?.response?.data?.message ||
              "Beberapa soal berhasil dibuat namun gagal ditambahkan ke paket"
          );
        }
      }

      setImportSummary({ success, failed, errors });
      setShowImportResult(true);

      // Auto close modal if all questions imported successfully
      if (success > 0 && failed === 0) {
        setTimeout(() => {
          handleImportDialogChange(false);
          toast({
            title: "Import Berhasil!",
            description: `${success} soal berhasil ditambahkan ke paket`,
            duration: 5000,
          });
        }, 1000);
      } else {
        toast({
          title: "Proses Import Selesai",
          description: `${success} soal berhasil ditambahkan${
            failed ? `, ${failed} soal gagal` : ""
          }`,
          ...(failed ? { variant: "destructive" as const } : {}),
        });
      }

      await loadPackageDetail(true);
    } finally {
      setIsImportingQuestions(false);
    }
  };

  const downloadDocxTemplate = async () => {
    setIsGeneratingDocxTemplate(true);
    try {
      // Fetch the existing template file from the public folder
      const response = await fetch(
        "/soal template/Template Soal CBT Esgriba.docx"
      );

      if (!response.ok) {
        throw new Error("Template file not found");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Template_Import_Paket_Soal.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Failed to download DOCX template", error);
      toast({
        title: "Gagal Mengunduh Template DOCX",
        description:
          error?.message || "Pastikan file template tersedia di folder public.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDocxTemplate(false);
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case "easy":
        return "Mudah";
      case "medium":
        return "Sedang";
      case "hard":
        return "Sulit";
      default:
        return "-";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Pilihan Ganda";
      case "essay":
        return "Essay";
      default:
        return type;
    }
  };

  const filteredAvailableQuestions = availableQuestions.filter((q) =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validImportCount = parsedImportQuestions.filter(
    (q) => q.isValid
  ).length;
  const invalidImportCount = parsedImportQuestions.length - validImportCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat detail paket...</p>
        </div>
      </div>
    );
  }

  if (!packageData) return null;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-2 md:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/question-packages")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Kembali</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-foreground line-clamp-2">
              {packageData.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {packageData.subject?.name}
              </Badge>
              <Badge
                className={`${getDifficultyColor(
                  packageData.difficulty_level
                )} text-xs`}
              >
                {getDifficultyLabel(packageData.difficulty_level)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedPackageQuestions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              className="flex-1 md:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">
                Hapus ({selectedPackageQuestions.length})
              </span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleImportDialogChange(true)}
            className="flex-1 md:flex-none"
          >
            <Upload className="w-4 h-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">Import</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowAddDialog(true);
              loadAvailableQuestions();
            }}
            className="flex-1 md:flex-none"
          >
            <Plus className="w-4 h-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">Tambah</span>
          </Button>
        </div>
      </div>

      {/* Package Info */}
      {packageData.description && (
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <p className="text-sm md:text-base text-foreground">
              {packageData.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              {packageData.questions?.length || 0}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              Total Soal
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {packageData.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              Total Poin
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600">
              {packageData.questions?.filter(
                (q) => q.question_type === "multiple_choice"
              ).length || 0}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              Pilihan Ganda
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-600">
              {packageData.questions?.filter((q) => q.question_type === "essay")
                .length || 0}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              Essay
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Soal ({packageData.questions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!packageData.questions || packageData.questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Belum ada soal dalam paket ini
              </p>
              <Button
                onClick={() => {
                  setShowAddDialog(true);
                  loadAvailableQuestions();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Soal Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <Checkbox
                        checked={
                          packageData.questions.length > 0 &&
                          selectedPackageQuestions.length ===
                            packageData.questions.length
                        }
                        onCheckedChange={toggleSelectAllPackageQuestions}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Tipe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pertanyaan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Poin
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {packageData.questions.map((question, index) => (
                    <tr
                      key={question.id}
                      className={`transition ${
                        selectedPackageQuestions.includes(question.id)
                          ? "bg-blue-50 dark:bg-blue-950"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedPackageQuestions.includes(
                            question.id
                          )}
                          onCheckedChange={() =>
                            togglePackageQuestionSelection(question.id)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            question.question_type === "essay"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {getTypeLabel(question.question_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100 max-w-md">
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
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {question.category || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {question.points}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            title="Edit soal"
                            className="hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveQuestion(question.id)}
                            title="Hapus dari paket"
                            className="hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
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

      {/* Add Questions Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Tambah Soal ke Paket
            </DialogTitle>
            <DialogDescription className="text-sm">
              Pilih soal dari bank soal untuk ditambahkan ke paket ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-2.5 md:top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari soal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm md:text-base"
              />
            </div>

            {/* Selected Count */}
            {selectedQuestions.length > 0 && (
              <div className="flex items-center justify-between p-2.5 md:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex-shrink-0">
                <span className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-300">
                  {selectedQuestions.length} soal dipilih
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedQuestions([])}
                  className="text-blue-600 dark:text-blue-400 text-xs md:text-sm h-auto p-0"
                >
                  Batal Pilih Semua
                </Button>
              </div>
            )}

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto pr-2">
              {filteredAvailableQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Tidak ada soal yang cocok"
                      : "Tidak ada soal tersedia"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableQuestions.map((question) => (
                    <div
                      key={question.id}
                      className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedQuestions.includes(question.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => toggleQuestionSelection(question.id)}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() =>
                            toggleQuestionSelection(question.id)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 md:gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(question.question_type)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {question.points}p
                            </Badge>
                            {question.category && (
                              <Badge variant="outline" className="text-xs">
                                {question.category}
                              </Badge>
                            )}
                          </div>
                          <MathContent
                            content={question.question_text}
                            className="text-xs md:text-sm text-foreground line-clamp-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 md:pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddDialog(false);
                setSelectedQuestions([]);
                setSearchTerm("");
              }}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleAddQuestions}
              disabled={selectedQuestions.length === 0}
              className="w-full sm:w-auto"
            >
              Tambah{" "}
              {selectedQuestions.length > 0 && `(${selectedQuestions.length})`}{" "}
              Soal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Questions Dialog */}
      <Dialog open={showImportDialog} onOpenChange={handleImportDialogChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Import Soal dari File
            </DialogTitle>
            <DialogDescription className="text-sm">
              Upload file DOCX menggunakan template yang disediakan untuk
              menambahkan soal langsung ke paket ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 md:space-y-5 flex-1 overflow-y-auto pr-1">
            {/* Template Download */}
            <div className="flex flex-col gap-2 md:gap-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-3 md:p-4">
              <div className="text-xs md:text-sm text-foreground">
                <p className="font-medium mb-1">Download Template</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  File template sudah berisi contoh format yang benar
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadDocxTemplate}
                  disabled={isGeneratingDocxTemplate}
                  className="bg-white dark:bg-gray-800 text-xs md:text-sm"
                >
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                  {isGeneratingDocxTemplate ? "Menyiapkan..." : "Template DOCX"}
                </Button>
              </div>
            </div>

            {/* Teacher Selection (Admin Only) */}
            {user?.role === "admin" && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <Label
                  htmlFor="teacher-select"
                  className="text-xs md:text-sm font-medium"
                >
                  Ditugaskan untuk Guru (Opsional)
                </Label>
                <Select
                  value={teacherId || "none"}
                  onValueChange={(value) => {
                    setTeacherId(value === "none" ? "" : value);
                  }}
                >
                  <SelectTrigger id="teacher-select" className="mt-2">
                    <SelectValue placeholder="Pilih guru (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Tidak ada (atas nama admin)
                    </SelectItem>
                    {teachers
                      .filter(
                        (t) =>
                          !packageData?.subject_id ||
                          t.subjects?.some(
                            (s: any) => s.id === packageData.subject_id
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
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Soal akan ditampilkan atas nama guru yang dipilih
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                File Import (.docx)
              </label>
              <input
                type="file"
                accept=".docx"
                onChange={handleImportFileChange}
                className="block w-full text-xs md:text-sm text-muted-foreground
                  file:mr-3 md:file:mr-4 file:py-1.5 md:file:py-2 file:px-3 md:file:px-4
                  file:rounded-md file:border-0
                  file:text-xs md:file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />

              {importFile && (
                <div className="mt-2 md:mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm text-muted-foreground">
                  <span className="truncate">
                    File terpilih: {importFile.name}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={parseImportFile}
                    disabled={isParsingFile}
                    className="text-xs md:text-sm"
                  >
                    {isParsingFile ? "Memproses..." : "Parse File"}
                  </Button>
                </div>
              )}
            </div>

            {parsedImportQuestions.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-muted-foreground">
                      Total soal: {parsedImportQuestions.length}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Total Poin:{" "}
                      {parsedImportQuestions
                        .filter((q) => q.isValid)
                        .reduce((sum, q) => sum + q.points, 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-green-600 dark:text-green-400">
                      Valid: {validImportCount}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      Perlu Perbaikan: {invalidImportCount}
                    </span>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 md:space-y-3 pr-1">
                  {parsedImportQuestions.map((question, index) => (
                    <div
                      key={`${question.rowNumber}-${index}`}
                      className={`rounded-lg border p-3 md:p-4 transition-colors ${
                        question.isValid
                          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
                          : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 md:gap-3">
                        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-foreground">
                          {question.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                          <span>Soal {question.rowNumber}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {question.category && (
                            <span className="rounded bg-gray-200 dark:bg-gray-700 px-2 py-1 text-gray-700 dark:text-gray-200">
                              {question.category}
                            </span>
                          )}
                          <span className="rounded bg-blue-200 dark:bg-blue-900 px-2 py-1 text-blue-700 dark:text-blue-200">
                            {question.points} poin
                          </span>
                          <span className="rounded bg-blue-200 dark:bg-blue-900 px-2 py-1 text-blue-700 dark:text-blue-200">
                            {question.question_type}
                          </span>
                        </div>
                      </div>

                      <MathContent
                        content={question.question_text}
                        className="mt-2 text-sm text-foreground"
                      />

                      {question.question_type === "ESSAY" ? (
                        // Display essay answer
                        <div className="mt-3 rounded-md bg-green-50 dark:bg-green-950">
                          <div className="mb-1 text-sm font-semibold text-green-800 dark:text-green-200">
                            Kunci Jawaban:
                          </div>
                          <MathContent
                            content={question.correct_answer}
                            className="text-sm text-foreground"
                          />
                        </div>
                      ) : (
                        // Display multiple choice options
                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                          <div
                            className={
                              question.correct_answer === "A"
                                ? "font-semibold text-green-700 dark:text-green-400"
                                : ""
                            }
                          >
                            <span>A. </span>
                            <MathContent
                              content={question.option_a}
                              className="inline"
                            />
                          </div>
                          <div
                            className={
                              question.correct_answer === "B"
                                ? "font-semibold text-green-700 dark:text-green-400"
                                : ""
                            }
                          >
                            <span>B. </span>
                            <MathContent
                              content={question.option_b}
                              className="inline"
                            />
                          </div>
                          <div
                            className={
                              question.correct_answer === "C"
                                ? "font-semibold text-green-700 dark:text-green-400"
                                : ""
                            }
                          >
                            <span>C. </span>
                            <MathContent
                              content={question.option_c}
                              className="inline"
                            />
                          </div>
                          <div
                            className={
                              question.correct_answer === "D"
                                ? "font-semibold text-green-700 dark:text-green-400"
                                : ""
                            }
                          >
                            <span>D. </span>
                            <MathContent
                              content={question.option_d}
                              className="inline"
                            />
                          </div>
                          {question.option_e && (
                            <div
                              className={
                                question.correct_answer === "E"
                                  ? "font-semibold text-green-700 dark:text-green-400"
                                  : ""
                              }
                            >
                              <span>E. </span>
                              <MathContent
                                content={question.option_e}
                                className="inline"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {!question.isValid && question.errors.length > 0 && (
                        <div className="mt-3 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-3">
                          <div className="flex gap-2 text-sm text-red-700 dark:text-red-300">
                            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <div className="space-y-1">
                              {question.errors.map((error, errorIndex) => (
                                <p key={errorIndex}>• {error}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showImportResult && importSummary && (
              <Alert variant={importSummary.failed ? "destructive" : "default"}>
                <AlertTitle>Hasil Import</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-green-600 dark:text-green-400">
                      Berhasil: {importSummary.success} soal
                    </p>
                    {importSummary.failed > 0 && (
                      <>
                        <p className="font-medium text-red-600 dark:text-red-400">
                          Gagal: {importSummary.failed} soal
                        </p>
                        <div className="max-h-32 space-y-1 overflow-y-auto text-red-600 dark:text-red-400">
                          {importSummary.errors.map((message, errorIndex) => (
                            <p key={errorIndex}>• {message}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 border-t pt-3 md:pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImportDialogChange(false)}
              disabled={isImportingQuestions}
              className="w-full sm:w-auto"
            >
              Tutup
            </Button>
            <Button
              size="sm"
              onClick={handleImportQuestions}
              disabled={
                isImportingQuestions || validImportCount === 0 || isParsingFile
              }
              className="w-full sm:w-auto"
            >
              {isImportingQuestions
                ? "Mengimport..."
                : `Import ${validImportCount} Soal`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Soal</DialogTitle>
            <DialogDescription>
              Ubah detail soal di bawah ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <Label htmlFor="edit-question-text">Teks Soal *</Label>
              <textarea
                id="edit-question-text"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                value={editForm.question_text}
                onChange={(e) =>
                  setEditForm({ ...editForm, question_text: e.target.value })
                }
                placeholder="Masukkan teks soal..."
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Input
                id="edit-category"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                placeholder="Misal: Aljabar, Geometri, dll"
              />
            </div>

            {/* Difficulty Level */}
            <div>
              <Label htmlFor="edit-difficulty">Tingkat Kesulitan *</Label>
              <Select
                value={editForm.difficulty_level.toString()}
                onValueChange={(value) =>
                  setEditForm({
                    ...editForm,
                    difficulty_level: parseInt(value) as 1 | 2 | 3,
                  })
                }
              >
                <SelectTrigger id="edit-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Mudah</SelectItem>
                  <SelectItem value="2">Sedang</SelectItem>
                  <SelectItem value="3">Sulit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Points */}
            <div>
              <Label htmlFor="edit-points">Poin *</Label>
              <Input
                id="edit-points"
                type="number"
                min="1"
                value={editForm.points}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    points: parseInt(e.target.value) || 10,
                  })
                }
              />
            </div>

            {/* Options for Multiple Choice */}
            {editForm.question_type === "multiple_choice" && (
              <div className="space-y-3">
                <Label>Pilihan Jawaban *</Label>
                {editForm.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Checkbox
                      checked={option.is_correct}
                      onCheckedChange={(checked) => {
                        const newOptions = [...editForm.options];
                        newOptions[index].is_correct = checked as boolean;
                        setEditForm({ ...editForm, options: newOptions });
                      }}
                      className="mt-3"
                    />
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">
                        Pilihan {String.fromCharCode(65 + index)}
                      </Label>
                      <Input
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...editForm.options];
                          newOptions[index].text = e.target.value;
                          setEditForm({ ...editForm, options: newOptions });
                        }}
                        placeholder={`Pilihan ${String.fromCharCode(
                          65 + index
                        )}`}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Centang kotak untuk menandai jawaban yang benar
                </p>
              </div>
            )}

            {/* Expected Answer for Essay */}
            {editForm.question_type === "essay" && (
              <div>
                <Label htmlFor="edit-expected-answer">Kunci Jawaban *</Label>
                <textarea
                  id="edit-expected-answer"
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                  value={editForm.expected_answer}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      expected_answer: e.target.value,
                    })
                  }
                  placeholder="Masukkan kunci jawaban essay..."
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditingQuestion(null);
              }}
              disabled={isUpdatingQuestion}
            >
              Batal
            </Button>
            <Button onClick={handleUpdateQuestion} disabled={isUpdatingQuestion}>
              {isUpdatingQuestion ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Hapus {selectedPackageQuestions.length} Soal?
            </DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus {selectedPackageQuestions.length} soal
              dari paket ini. Soal tidak akan dihapus dari bank soal, hanya
              dihapus dari paket ini.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleBulkRemoveQuestions}>
              Hapus Semua
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
