import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import questionBankService from "@/lib/services/questionBankService";
import masterDataService, { Subject } from "@/lib/services/masterDataService";
import { useAuthStore } from "@/store/authStore";
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface ParsedQuestion {
  type: "multiple_choice" | "essay";
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string;
  correct_answer: string; // For multiple_choice: A|B|C|D|E
  text_answer?: string; // For essay
  category: string;
  difficulty: string; // mudah|sedang|sulit
  subject_id?: number;
  points: number;
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

export default function ImportQuestions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"excel" | "docx">("excel");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [subjectIdForDocx, setSubjectIdForDocx] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState<string>("");
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Load subjects and teachers on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await masterDataService.subjects.getAll();
        setSubjects(data);

        // Load teachers only for admin
        if (user?.role === 'admin') {
          const teachersData = await masterDataService.teachers.getAll();
          setTeachers(teachersData);
        }

        // Check if subject_id from URL params
        const subjectIdParam = searchParams.get("subject_id");
        if (subjectIdParam) {
          setSubjectIdForDocx(subjectIdParam);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, [searchParams, user?.role]);

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        Tipe: "multiple_choice",
        Soal: "Contoh PG: Siapa presiden pertama Indonesia?",
        "Pilihan A": "Ir. Soekarno",
        "Pilihan B": "Mohammad Hatta",
        "Pilihan C": "Soeharto",
        "Pilihan D": "B.J. Habibie",
        "Pilihan E": "Megawati",
        "Jawaban Benar": "A",
        "Jawaban Teks (Essay)": "",
        Kategori: "Sejarah Indonesia",
        "Tingkat Kesulitan": "mudah",
        "ID Mata Pelajaran": "1",
      },
      {
        Tipe: "essay",
        Soal: "Contoh Essay: Jelaskan pengertian fotosintesis secara singkat.",
        "Pilihan A": "",
        "Pilihan B": "",
        "Pilihan C": "",
        "Pilihan D": "",
        "Pilihan E": "",
        "Jawaban Benar": "",
        "Jawaban Teks (Essay)":
          "Fotosintesis adalah proses tumbuhan hijau mengubah energi cahaya menjadi energi kimia...",
        Kategori: "Biologi",
        "Tingkat Kesulitan": "sedang",
        "ID Mata Pelajaran": "4",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws["!cols"] = [
      { wch: 16 }, // Tipe
      { wch: 60 }, // Soal
      { wch: 30 }, // Pilihan A
      { wch: 30 }, // Pilihan B
      { wch: 30 }, // Pilihan C
      { wch: 30 }, // Pilihan D
      { wch: 30 }, // Pilihan E
      { wch: 15 }, // Jawaban Benar
      { wch: 40 }, // Jawaban Teks (Essay)
      { wch: 25 }, // Kategori
      { wch: 20 }, // Tingkat Kesulitan
      { wch: 20 }, // ID Mata Pelajaran
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Soal");

    // Add instructions sheet
    const instructions = [
      ["PETUNJUK PENGGUNAAN TEMPLATE IMPORT SOAL"],
      [""],
      ['1. Kolom "Tipe":', "Isi dengan multiple_choice atau essay"],
      ['2. Kolom "Soal":', "Isi dengan pertanyaan"],
      [
        "3a. Untuk multiple_choice:",
        "Isi Pilihan A-E (E boleh kosong) dan Jawaban Benar = A/B/C/D/E",
      ],
      [
        "3b. Untuk essay:",
        'Kosongkan Pilihan A-E & Jawaban Benar, lalu isi "Jawaban Teks (Essay)"',
      ],
      [
        '4. Kolom "Kategori":',
        "Isi kategori (contoh: Sejarah, Matematika Dasar, dll)",
      ],
      ['5. Kolom "Tingkat Kesulitan":', "Isi: mudah, sedang, atau sulit"],
      [
        '6. Kolom "ID Mata Pelajaran":',
        "Isi dengan ID mapel (angka). Lihat daftar ID di menu Bank Soal",
      ],
      [""],
      ["CATATAN PENTING:"],
      ["- Jangan ubah nama kolom pada baris pertama"],
      ["- Setiap baris adalah 1 soal"],
      [
        "- Untuk essay, hanya gunakan kolom: Tipe, Soal, Jawaban Teks (Essay), Kategori, Tingkat Kesulitan, ID Mata Pelajaran",
      ],
      ["- Hapus baris contoh sebelum mengisi data Anda"],
      [""],
      ["DAFTAR ID MATA PELAJARAN (Contoh):"],
      ["1 - Matematika"],
      ["2 - Bahasa Indonesia"],
      ["3 - Bahasa Inggris"],
      ["4 - IPA"],
      ["5 - IPS"],
      ["(Lihat daftar lengkap di menu Bank Soal)"],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions["!cols"] = [{ wch: 30 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Petunjuk");

    XLSX.writeFile(wb, "Template_Import_Soal_CBT.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedQuestions([]);
      setShowPreview(false);

      // Detect file type
      if (selectedFile.name.endsWith(".docx")) {
        setFileType("docx");
      } else {
        setFileType("excel");
      }
    }
  };

  const validateQuestion = (q: any, rowNumber: number): ParsedQuestion => {
    const errors: string[] = [];
    // Normalize type (support Indonesian aliases)
    const rawType = (q["Tipe"] || "").toString().trim().toLowerCase();
    const type: "multiple_choice" | "essay" =
      rawType === "essay"
        ? "essay"
        : rawType === "pg" ||
          rawType === "pilihan_ganda" ||
          rawType === "multiple_choice"
        ? "multiple_choice"
        : "multiple_choice";

    // Validate required fields
    if (!q["Soal"] || q["Soal"].toString().trim() === "") {
      errors.push("Soal tidak boleh kosong");
    }
    let correctAnswer = q["Jawaban Benar"]?.toString().toUpperCase();
    const textAnswer = q["Jawaban Teks (Essay)"]?.toString().trim();

    if (type === "multiple_choice") {
      if (!q["Pilihan A"] || q["Pilihan A"].toString().trim() === "") {
        errors.push("Pilihan A tidak boleh kosong");
      }
      if (!q["Pilihan B"] || q["Pilihan B"].toString().trim() === "") {
        errors.push("Pilihan B tidak boleh kosong");
      }
      if (!q["Pilihan C"] || q["Pilihan C"].toString().trim() === "") {
        errors.push("Pilihan C tidak boleh kosong");
      }
      if (!q["Pilihan D"] || q["Pilihan D"].toString().trim() === "") {
        errors.push("Pilihan D tidak boleh kosong");
      }
      if (!["A", "B", "C", "D", "E"].includes(correctAnswer)) {
        errors.push("Jawaban Benar harus A, B, C, D, atau E");
      }
    } else {
      // essay
      correctAnswer = "";
      if (!textAnswer) {
        errors.push("Jawaban Teks (Essay) harus diisi untuk tipe essay");
      }
    }

    // Validate difficulty
    const difficulty = q["Tingkat Kesulitan"]?.toString().toLowerCase();
    if (!["mudah", "sedang", "sulit"].includes(difficulty)) {
      errors.push("Tingkat Kesulitan harus: mudah, sedang, atau sulit");
    }

    // Validate category
    if (!q["Kategori"] || q["Kategori"].toString().trim() === "") {
      errors.push("Kategori tidak boleh kosong");
    }

    // Validate subject_id
    const subjectId = parseInt(q["ID Mata Pelajaran"]);
    if (isNaN(subjectId) || subjectId <= 0) {
      errors.push("ID Mata Pelajaran harus berupa angka positif");
    }

    return {
      type,
      question_text: q["Soal"]?.toString().trim() || "",
      option_a: q["Pilihan A"]?.toString().trim() || "",
      option_b: q["Pilihan B"]?.toString().trim() || "",
      option_c: q["Pilihan C"]?.toString().trim() || "",
      option_d: q["Pilihan D"]?.toString().trim() || "",
      option_e: q["Pilihan E"]?.toString().trim() || "",
      correct_answer: correctAnswer || "",
      text_answer: textAnswer || "",
      category: q["Kategori"]?.toString().trim() || "",
      difficulty: difficulty || "",
      subject_id: subjectId,
      points: 1,
      rowNumber,
      isValid: errors.length === 0,
      errors,
    };
  };

  const parseFile = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      if (fileType === "docx") {
        await parseDocxFile();
      } else {
        await parseExcelFile();
      }
      setShowPreview(true);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Gagal membaca file. Pastikan format file sesuai dengan template.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseExcelFile = async () => {
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const parsed = jsonData.map(
      (row, index) => validateQuestion(row, index + 2) // +2 because row 1 is header
    );

    setParsedQuestions(parsed);
  };

  const parseDocxFile = async () => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const htmlContent = result.value;

    // Parse the HTML to extract questions
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const textContent = doc.body.textContent || "";

    // Split by [NOMOR pattern to get individual questions
    // Support [NOMOR 1], [NOMOR-1], or [NOMOR: 1]
    const questionBlocks = textContent
      .split(/\[NOMOR(?:\s*[-:]\s*|\s+)\d+\]/i)
      .filter(Boolean);

    const parsed: ParsedQuestion[] = [];

    questionBlocks.forEach((block, index) => {
      const questionNumber = index + 1;
      const errors: string[] = [];

      // Extract JENIS SOAL - handle merged text like "ESSAYNILAI" or "PGNILAI"
      // Look for ESSAY or PG anywhere in the early part of text
      const jenisMatch = block.match(
        /(?:JENIS\s*:?\s*SOAL\s*:?\s*)?(ESSAY|PG|PILIHAN\s*GANDA)(?:\s*NILAI|\s*:|\s+)/i
      );
      const jenisSoal = jenisMatch ? jenisMatch[1].toUpperCase() : null;

      if (!jenisSoal) {
        errors.push(
          "JENIS SOAL tidak ditemukan atau tidak valid (harus PG atau ESSAY)"
        );
      }

      const type: "multiple_choice" | "essay" =
        jenisSoal === "ESSAY" ? "essay" : "multiple_choice";

      // Extract NILAI - handle merged text like "ESSAYNILAI:12" or "NILAI:12"
      const nilaiMatch = block.match(/(?:NILAI|ESSAY|PG)\s*:?\s*(\d+)/i);
      const points = nilaiMatch ? parseInt(nilaiMatch[1]) : 1;

      // Extract SOAL - handle merged text like "ESSAYNILAI:12SOAL:" or "NILAI:12SOAL:"
      // Strategy: Look for SOAL keyword, then capture everything after it until JAWABAN/KUNCI
      let questionText = "";

      // First try to find "SOAL:" explicitly
      const soalExplicitMatch = block.match(
        /(?:^|\r?\n)\s*SOAL\s*:?\s*([^]*?)(?=(?:^|\r?\n)\s*(?:JAWABAN\s*:?|KUNCI\s*[:\s]+JAWABAN\s*:?)|$)/i
      );

      if (soalExplicitMatch) {
        questionText = soalExplicitMatch[1].trim();
      } else {
        // Fallback: Extract text after the point value until JAWABAN
        // This handles cases where SOAL keyword is completely missing
        const afterNilaiMatch = block.match(
          /(?:^|\r?\n)\s*\d+\s*([^]*?)(?=(?:^|\r?\n)\s*(?:JAWABAN\s*:?|KUNCI\s*[:\s]+JAWABAN\s*:?)|$)/i
        );
        if (afterNilaiMatch) {
          questionText = afterNilaiMatch[1]
            .replace(/^SOAL\s*:?\s*/i, "")
            .trim();
        }
      }

      if (!questionText) {
        errors.push("SOAL tidak boleh kosong");
      }

      let optionA = "",
        optionB = "",
        optionC = "",
        optionD = "",
        optionE = "";
      let correctAnswer = "";
      let textAnswer = "";

      if (type === "multiple_choice") {
        // Extract JAWABAN options - more flexible pattern
        const jawabanMatch = block.match(
          /(?:^|\r?\n)\s*JAWABAN\s*:?\s*([^]*?)(?=(?:^|\r?\n)\s*KUNCI\s*[:\s]+JAWABAN\s*:?|$)/i
        );
        if (jawabanMatch) {
          const jawabanText = jawabanMatch[1];

          // Extract options - support both A-E and 1-5 numbering
          // More flexible regex that handles spaces and variations
          const optionAMatch = jawabanText.match(
            /(?:A\s*\.|1\s*\.)\s*([^\n]+)/i
          );
          const optionBMatch = jawabanText.match(
            /(?:B\s*\.|2\s*\.)\s*([^\n]+)/i
          );
          const optionCMatch = jawabanText.match(
            /(?:C\s*\.|3\s*\.)\s*([^\n]+)/i
          );
          const optionDMatch = jawabanText.match(
            /(?:D\s*\.|4\s*\.)\s*([^\n]+)/i
          );
          const optionEMatch = jawabanText.match(
            /(?:E\s*\.|5\s*\.)\s*([^\n]+)/i
          );

          optionA = optionAMatch ? optionAMatch[1].trim() : "";
          optionB = optionBMatch ? optionBMatch[1].trim() : "";
          optionC = optionCMatch ? optionCMatch[1].trim() : "";
          optionD = optionDMatch ? optionDMatch[1].trim() : "";
          optionE = optionEMatch ? optionEMatch[1].trim() : "";

          if (!optionA) errors.push("Pilihan A/1 tidak ditemukan");
          if (!optionB) errors.push("Pilihan B/2 tidak ditemukan");
          if (!optionC) errors.push("Pilihan C/3 tidak ditemukan");
          if (!optionD) errors.push("Pilihan D/4 tidak ditemukan");
        }

        // Extract KUNCI JAWABAN - support both A-E and 1-5
        // More flexible to handle spaces and case variations
        const kunciMatch = block.match(
          /KUNCI\s*[:\s]+JAWABAN\s*:?\s*([A-E1-5])/i
        );
        let kunciValue = kunciMatch ? kunciMatch[1].toUpperCase() : "";

        // Convert number to letter if needed
        const numberToLetter: { [key: string]: string } = {
          "1": "A",
          "2": "B",
          "3": "C",
          "4": "D",
          "5": "E",
        };
        if (numberToLetter[kunciValue]) {
          kunciValue = numberToLetter[kunciValue];
        }

        correctAnswer = kunciValue;

        if (!["A", "B", "C", "D", "E"].includes(correctAnswer)) {
          errors.push(
            "KUNCI JAWABAN tidak valid (harus A/1, B/2, C/3, D/4, atau E/5)"
          );
        }
      } else {
        // Essay type - more flexible pattern
        // For essay, JAWABAN contains the expected answer text
        // KUNCI JAWABAN is also used for essay and contains the answer key
        
        // Try multiple patterns to extract essay answer
        // Pattern 1: Extract from JAWABAN section (before KUNCI JAWABAN)
        let jawabanMatch = block.match(
          /JAWABAN\s*:?\s*([^]*?)(?=KUNCI\s+JAWABAN\s*:?|$)/i
        );
        
        // Pattern 2: If JAWABAN is empty, try to extract from KUNCI JAWABAN section
        if (!jawabanMatch || !jawabanMatch[1].trim()) {
          jawabanMatch = block.match(
            /KUNCI\s+JAWABAN\s*:?\s*([^]*?)$/i
          );
        }

        if (jawabanMatch) {
          textAnswer = jawabanMatch[1]
            .trim()
            .replace(/^[-\s]+|[-\s]+$/g, '') // Remove leading/trailing dashes and spaces
            .trim();
        }

        // For essay, if no answer content found, it's an error
        if (!textAnswer || textAnswer === '-') {
          errors.push("JAWABAN / KUNCI JAWABAN (teks essay) tidak boleh kosong");
        }
      }

      // For DOCX, we'll use default values for category, difficulty
      // subject_id will be provided by user before import
      const category = "Umum"; // Default category
      const difficulty = "sedang"; // Default difficulty
      const subjectId = undefined; // Will be set from user input before import

      parsed.push({
        type,
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        option_e: optionE,
        correct_answer: correctAnswer,
        text_answer: textAnswer,
        category,
        difficulty,
        subject_id: subjectId,
        points,
        rowNumber: questionNumber,
        isValid: errors.length === 0,
        errors,
      });
    });

    setParsedQuestions(parsed);
  };

  const handleImport = async () => {
    const validQuestions = parsedQuestions.filter((q) => q.isValid);

    if (validQuestions.length === 0) {
      alert("Tidak ada soal yang valid untuk diimport");
      return;
    }

    // For DOCX, validate subject_id is provided
    if (fileType === "docx") {
      const subjectId = parseInt(subjectIdForDocx);
      if (isNaN(subjectId) || subjectId <= 0) {
        alert("ID Mata Pelajaran harus diisi dengan angka positif");
        return;
      }
      // Update all questions with the subject_id
      validQuestions.forEach((q) => (q.subject_id = subjectId));
    }

    setIsLoading(true);
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      for (const q of validQuestions) {
        try {
          // Convert difficulty text to level
          const difficultyMap: { [key: string]: 1 | 2 | 3 } = {
            mudah: 1,
            sedang: 2,
            sulit: 3,
          };

          const teacherIdValue = teacherId ? parseInt(teacherId) : null;

          if (q.type === "essay") {
            const essayData: any = {
              subject_id: q.subject_id!,
              question_text: q.question_text,
              category: q.category,
              question_type: "essay",
              expected_answer: q.text_answer,
              difficulty_level: difficultyMap[q.difficulty],
              points: q.points,
            };
            
            // Only include teacher_id if user is admin
            if (user?.role === 'admin' && teacherIdValue) {
              essayData.teacher_id = teacherIdValue;
            }
            
            await questionBankService.createQuestion(essayData);
          } else {
            const mcData: any = {
              subject_id: q.subject_id!,
              question_text: q.question_text,
              category: q.category,
              question_type: "multiple_choice",
              difficulty_level: difficultyMap[q.difficulty],
              points: q.points,
              options: [
                { text: q.option_a, is_correct: q.correct_answer === "A" },
                { text: q.option_b, is_correct: q.correct_answer === "B" },
                { text: q.option_c, is_correct: q.correct_answer === "C" },
                { text: q.option_d, is_correct: q.correct_answer === "D" },
                ...(q.option_e
                  ? [{ text: q.option_e, is_correct: q.correct_answer === "E" }]
                  : []),
              ],
            };
            
            // Only include teacher_id if user is admin
            if (user?.role === 'admin' && teacherIdValue) {
              mcData.teacher_id = teacherIdValue;
            }
            
            await questionBankService.createQuestion(mcData);
          }
          successCount++;
        } catch (error: any) {
          failedCount++;
          errors.push(
            `Baris ${q.rowNumber}: ${error.message || "Gagal menyimpan"}`
          );
        }
      }

      setImportResult({
        success: successCount,
        failed: failedCount,
        errors,
      });
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const validCount = parsedQuestions.filter((q) => q.isValid).length;
  const invalidCount = parsedQuestions.filter((q) => !q.isValid).length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Import Soal dari File</h1>
        <p className="text-gray-600">
          Upload file Excel atau Word untuk menambahkan banyak soal sekaligus
        </p>
      </div>

      <Tabs defaultValue="excel" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="excel">Excel (.xlsx)</TabsTrigger>
          <TabsTrigger value="docx">Word (.docx)</TabsTrigger>
        </TabsList>

        {/* Excel Tab */}
        <TabsContent value="excel" className="space-y-6">
          {/* Download Template Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Template Excel
              </CardTitle>
              <CardDescription>
                Download template Excel untuk format yang benar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Template Excel
              </Button>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File Excel
              </CardTitle>
              <CardDescription>
                Pilih file Excel (.xlsx) yang sudah diisi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pilih Guru (Admin Only) */}
              {user?.role === 'admin' && (
                <div>
                  <Label>Ditugaskan untuk Guru (Opsional)</Label>
                  <Select value={teacherId || "none"} onValueChange={(value) => setTeacherId(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih guru (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada (atas nama admin)</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Soal akan ditampilkan atas nama guru yang dipilih
                  </p>
                </div>
              )}

              <div>
                <Label>File Excel (.xlsx)</Label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>

              {file && fileType === "excel" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    File terpilih: {file.name}
                  </span>
                  <Button onClick={parseFile} disabled={isLoading}>
                    {isLoading ? "Memproses..." : "Parse File"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCX Tab */}
        <TabsContent value="docx" className="space-y-6">
          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Format Word Document
              </CardTitle>
              <CardDescription>
                Format yang harus digunakan dalam dokumen Word
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">Contoh Format:</h4>
                <pre className="text-sm whitespace-pre-wrap">
                  {`[NOMOR 1]
JENIS SOAL: PG
NILAI: 2
SOAL: Siapa presiden pertama Indonesia?
JAWABAN:
1. Ir. Soekarno
2. Mohammad Hatta
3. Soeharto
4. B.J. Habibie
5. Megawati
KUNCI JAWABAN: 1

[NOMOR 2]
JENIS SOAL: ESSAY
NILAI: 5
SOAL: Jelaskan proses fotosintesis!
JAWABAN: Fotosintesis adalah proses dimana tumbuhan hijau mengubah energi cahaya menjadi energi kimia...
KUNCI JAWABAN: -`}
                </pre>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 text-green-800">
                  Keterangan:
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>
                    • <strong>JENIS SOAL:</strong> PG (pilihan ganda) atau ESSAY
                  </li>
                  <li>
                    • <strong>NILAI:</strong> Poin untuk soal (angka)
                  </li>
                  <li>
                    • <strong>JAWABAN:</strong> Gunakan numbering 1-5 atau huruf
                    A-E
                  </li>
                  <li>
                    • <strong>KUNCI JAWABAN:</strong> Nomor/huruf jawaban yang
                    benar (untuk PG)
                  </li>
                  <li>
                    • ID Mata Pelajaran akan diinput saat preview, tidak perlu
                    di dokumen
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Catatan:</strong> Format DOCX menggunakan kategori
                  "Umum" dan tingkat kesulitan "sedang" sebagai default. Untuk
                  kontrol penuh atas kategori dan kesulitan, gunakan template
                  Excel.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File Word
              </CardTitle>
              <CardDescription>
                Pilih file Word (.docx) yang sudah diisi sesuai format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject Selection for DOCX */}
              <div>
                <Label>Mata Pelajaran *</Label>
                <Select
                  value={subjectIdForDocx}
                  onValueChange={setSubjectIdForDocx}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran..." />
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
                <p className="text-xs text-muted-foreground mt-1">
                  Semua soal dari file DOCX akan dimasukkan ke mata pelajaran
                  ini
                </p>
              </div>

              {/* Pilih Guru (Admin Only) */}
              {user?.role === 'admin' && (
                <div>
                  <Label>Ditugaskan untuk Guru (Opsional)</Label>
                  <Select value={teacherId || "none"} onValueChange={(value) => setTeacherId(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih guru (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada (atas nama admin)</SelectItem>
                      {teachers
                        .filter(t => 
                          !subjectIdForDocx || 
                          t.subjects?.some((s: any) => s.id === parseInt(subjectIdForDocx))
                        )
                        .map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Soal akan ditampilkan atas nama guru yang dipilih
                  </p>
                </div>
              )}

              <div>
                <Label>File Word (.docx)</Label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                />
              </div>

              {file && fileType === "docx" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    File terpilih: {file.name}
                  </span>
                  <Button
                    onClick={parseFile}
                    disabled={isLoading || !subjectIdForDocx}
                  >
                    {isLoading ? "Memproses..." : "Parse File"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Section */}
      {showPreview && parsedQuestions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Preview Hasil Parse</CardTitle>
            <CardDescription>
              Total: {parsedQuestions.length} soal |
              <span className="text-green-600 ml-2">Valid: {validCount}</span> |
              <span className="text-red-600 ml-2">Invalid: {invalidCount}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {parsedQuestions.map((q, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    q.isValid
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {q.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-semibold">Baris {q.rowNumber}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-gray-200 rounded">
                        {q.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 rounded">
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-purple-200 rounded">
                        Nilai: {q.points}
                      </span>
                      <span className="px-2 py-1 bg-blue-200 rounded">
                        Mapel ID: {q.subject_id || "N/A"}
                      </span>
                    </div>
                  </div>

                  <p className="font-medium mb-2">{q.question_text}</p>

                  {q.type === "multiple_choice" ? (
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div
                        className={
                          q.correct_answer === "A"
                            ? "font-bold text-green-600"
                            : ""
                        }
                      >
                        A. {q.option_a}
                      </div>
                      <div
                        className={
                          q.correct_answer === "B"
                            ? "font-bold text-green-600"
                            : ""
                        }
                      >
                        B. {q.option_b}
                      </div>
                      <div
                        className={
                          q.correct_answer === "C"
                            ? "font-bold text-green-600"
                            : ""
                        }
                      >
                        C. {q.option_c}
                      </div>
                      <div
                        className={
                          q.correct_answer === "D"
                            ? "font-bold text-green-600"
                            : ""
                        }
                      >
                        D. {q.option_d}
                      </div>
                      {q.option_e && (
                        <div
                          className={
                            q.correct_answer === "E"
                              ? "font-bold text-green-600"
                              : ""
                          }
                        >
                          E. {q.option_e}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm mb-2">
                      <span className="font-semibold">Jawaban Teks:</span>{" "}
                      <span className="text-slate-700">{q.text_answer}</span>
                    </div>
                  )}

                  {!q.isValid && (
                    <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <ul className="list-disc list-inside text-sm text-red-800">
                            {q.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t items-center">
              {fileType === "docx" && subjectIdForDocx && (
                <div className="text-sm text-muted-foreground">
                  Mata Pelajaran:{" "}
                  <span className="font-medium">
                    {subjects.find((s) => s.id.toString() === subjectIdForDocx)
                      ?.name || "N/A"}
                  </span>
                </div>
              )}
              <Button
                onClick={handleImport}
                disabled={
                  isLoading ||
                  validCount === 0 ||
                  (fileType === "docx" && !subjectIdForDocx)
                }
                className="flex-1"
              >
                {isLoading
                  ? "Mengimport..."
                  : `Import ${validCount} Soal Valid`}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/question-bank")}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Dialog */}
      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hasil Import</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">
                  ✓ Berhasil: {importResult?.success} soal
                </p>
                {importResult && importResult.failed > 0 && (
                  <>
                    <p className="text-red-600 font-semibold">
                      ✗ Gagal: {importResult.failed} soal
                    </p>
                    <div className="max-h-[200px] overflow-y-auto text-sm">
                      {importResult.errors.map((error, i) => (
                        <p key={i} className="text-red-600">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowResult(false);
                navigate("/question-bank");
              }}
            >
              OK, Ke Bank Soal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
