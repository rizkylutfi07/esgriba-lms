import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { MathContent } from "../../components/MathContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import testService from "../../lib/services/testService";
import questionBankService from "../../lib/services/questionBankService";
import questionPackageService, {
  QuestionPackage,
} from "../../lib/services/questionPackageService";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Library,
  FileText,
  Check,
  X,
  Package,
  TrendingUp,
  CopyPlus,
  Download,
} from "lucide-react";
import testServiceApi from "../../lib/services/testService";
import remedialService from "@/lib/services/remedialService";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  options?: Array<{
    id: number;
    option_text: string;
    is_correct: boolean;
  }>;
}

interface Test {
  id: number;
  title: string;
  description?: string;
  subject: string;
  kelas: string;
  duration: number;
  passing_score: number;
  start_time: string;
  end_time: string;
  status: string;
  questions?: Question[];
}

export default function TestDetail() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
  const [showQuestionBankDialog, setShowQuestionBankDialog] = useState(false);

  // For manual question creation
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    question_type: "multiple_choice",
    points: 10,
    expected_answer: "",
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  });

  // For question bank
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<number[]>(
    []
  );
  const [loadingBank, setLoadingBank] = useState(false);

  // For question packages
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [questionPackages, setQuestionPackages] = useState<QuestionPackage[]>(
    []
  );
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [importingPackage, setImportingPackage] = useState(false);
  const [showCloneRemedialDialog, setShowCloneRemedialDialog] = useState(false);
  const [remedialSchedule, setRemedialSchedule] = useState({
    start_time: "",
    end_time: "",
  });

  const difficultyLabelMap: Record<
    QuestionPackage["difficulty_level"],
    string
  > = {
    easy: "Mudah",
    medium: "Sedang",
    hard: "Sulit",
  };

  useEffect(() => {
    // Reset state when ID changes or component mounts
    setTest(null);
    setIsLoading(true);
    loadTest();
    
    // Cleanup on unmount
    return () => {
      setTest(null);
    };
  }, [id]);

  const loadTest = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      // Add cache buster
      const timestamp = new Date().getTime();
      const data = await testService.getTest(parseInt(id!), { _t: timestamp });
      console.log('Test data loaded:', data);
      console.log('Questions count:', data.questions?.length || 0);
      setTest(data);
    } catch (error: any) {
      console.error('Error loading test:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data ujian",
        variant: "destructive",
      });
      navigate("/tests");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const loadQuestionBank = async () => {
    try {
      setLoadingBank(true);
      const data = await questionBankService.getQuestions({
        subject: test?.subject,
        limit: 50,
      });
      setBankQuestions(data.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat bank soal",
        variant: "destructive",
      });
    } finally {
      setLoadingBank(false);
    }
  };

  const loadQuestionPackages = async () => {
    if (!test) return;

    try {
      setLoadingPackages(true);
      const response = await questionPackageService.getAll({ per_page: 100 });
      const rawPackages = response.data ?? response;
      const packages = (
        Array.isArray(rawPackages) ? rawPackages : rawPackages?.data ?? []
      ) as QuestionPackage[];
      const subjectName = test.subject ? test.subject.toLowerCase() : "";
      const filteredPackages = subjectName
        ? packages.filter((pkg) => {
            const pkgSubject = pkg.subject?.name
              ? String(pkg.subject.name).toLowerCase()
              : "";
            return pkgSubject === subjectName;
          })
        : packages;
      setQuestionPackages(filteredPackages);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Gagal memuat paket soal",
        variant: "destructive",
      });
      setQuestionPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleImportPackage = async () => {
    if (!selectedPackageId) {
      toast({
        title: "Pilih Paket",
        description: "Silakan pilih paket soal terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    try {
      setImportingPackage(true);
      const response = await testService.addPackage(
        parseInt(id!, 10),
        parseInt(selectedPackageId, 10)
      );
      
      console.log('Package import response:', response);
      
      // Use response data directly if available (includes questions)
      if (response?.test || response?.data) {
        const updatedTest = response.test || response.data;
        console.log('Updated test from response:', updatedTest);
        console.log('Questions from response:', updatedTest.questions?.length || 0);
        setTest(updatedTest);
      } else {
        // Fallback: reload from server
        console.log('No test in response, reloading...');
        await loadTest(true);
      }
      
      toast({
        title: "Sukses",
        description: "Paket soal berhasil ditambahkan",
      });
      setShowPackageDialog(false);
      setSelectedPackageId("");
    } catch (error: any) {
      console.error('Package import error:', error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Gagal menambahkan paket soal",
        variant: "destructive",
      });
    } finally {
      setImportingPackage(false);
    }
  };

  const selectedPackage = selectedPackageId
    ? questionPackages.find((pkg) => pkg.id === parseInt(selectedPackageId, 10))
    : undefined;

  const handleAddFromBank = async () => {
    if (selectedBankQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Pilih minimal 1 soal",
        variant: "destructive",
      });
      return;
    }

    try {
      await questionBankService.addQuestionsToTest(
        parseInt(id!),
        selectedBankQuestions
      );
      
      // Reload test data silently (without loading screen)
      await loadTest(true);
      
      toast({
        title: "Sukses",
        description: `${selectedBankQuestions.length} soal berhasil ditambahkan`,
      });
      setShowQuestionBankDialog(false);
      setSelectedBankQuestions([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan soal",
        variant: "destructive",
      });
    }
  };

  const handleCreateManualQuestion = async () => {
    if (!newQuestion.question_text) {
      toast({
        title: "Error",
        description: "Teks soal harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Validasi untuk multiple choice
    if (newQuestion.question_type === "multiple_choice") {
      const validOptions = newQuestion.options.filter(
        (opt) => opt.option_text.trim() !== ""
      );
      if (validOptions.length < 2) {
        toast({
          title: "Error",
          description: "Minimal 2 pilihan jawaban harus diisi",
          variant: "destructive",
        });
        return;
      }

      const hasCorrectAnswer = validOptions.some((opt) => opt.is_correct);
      if (!hasCorrectAnswer) {
        toast({
          title: "Error",
          description: "Pilih minimal 1 jawaban yang benar",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const questionData = {
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type,
        points: newQuestion.points,
        options:
          newQuestion.question_type === "essay"
            ? []
            : newQuestion.options.filter(
                (opt) => opt.option_text.trim() !== ""
              ),
      };

      await testService.addQuestion(parseInt(id!), questionData);
      
      // Reload test data silently (without loading screen)
      await loadTest(true);

      toast({
        title: "Sukses",
        description: "Soal berhasil ditambahkan",
      });

      setShowAddQuestionDialog(false);
      setNewQuestion({
        question_text: "",
        question_type: "multiple_choice",
        points: 10,
        expected_answer: "",
        options: [
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan soal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Yakin ingin menghapus soal ini dari ujian?")) return;

    try {
      await testService.removeQuestion(parseInt(id!), questionId);
      
      // Reload test data silently (without loading screen)
      await loadTest(true);
      
      toast({
        title: "Sukses",
        description: "Soal berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus soal",
        variant: "destructive",
      });
    }
  };

  const toggleCorrectOption = (index: number) => {
    const updated = [...newQuestion.options];
    updated[index].is_correct = !updated[index].is_correct;
    setNewQuestion({ ...newQuestion, options: updated });
  };

  const updateOptionText = (index: number, text: string) => {
    const updated = [...newQuestion.options];
    updated[index].option_text = text;
    setNewQuestion({ ...newQuestion, options: updated });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="mt-4 text-muted-foreground">Memuat data ujian...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  return (
    <div className="p-2 sm:p-2 space-y-6 max-w-5xl w-full overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button variant="outline" size="sm" onClick={() => navigate("/tests")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate text-foreground">
            {test.title}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {test.subject} • {test.kelas}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Button onClick={() => navigate(`/tests/${id}/results`)}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Lihat Hasil
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/tests/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Ujian
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCloneRemedialDialog(true)}
          >
            <CopyPlus className="w-4 h-4 mr-2" /> Clone ke Remidi
          </Button>
          {Number((test as any)?.allowed_students_count || 0) > 0 && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const blob = await remedialService.exportCsv(
                    parseInt(id!, 10)
                  );
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `remedial_students_test_${id}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (e) {
                  toast({
                    title: "Error",
                    description: "Gagal mengunduh CSV remidi",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Export Remidi (CSV)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {test.questions?.length || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Total Soal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {test.duration}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Menit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {test.passing_score}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Nilai KKM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <Badge
              className={
                test.status === "draft"
                  ? "bg-gray-500"
                  : test.status === "scheduled"
                  ? "bg-blue-500"
                  : test.status === "active"
                  ? "bg-green-500"
                  : "bg-red-500"
              }
            >
              {test.status}
            </Badge>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Status
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Daftar Soal</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Dialog
              open={showQuestionBankDialog}
              onOpenChange={(open) => {
                setShowQuestionBankDialog(open);
                if (open) loadQuestionBank();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Library className="w-4 h-4 mr-2" />
                  Dari Bank Soal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Pilih dari Bank Soal</DialogTitle>
                  <DialogDescription>
                    Pilih soal yang ingin ditambahkan ke ujian ini
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {loadingBank ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : bankQuestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada soal di bank soal untuk mata pelajaran ini
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {bankQuestions.map((q) => (
                          <div
                            key={q.id}
                            className={`p-4 border rounded-lg cursor-pointer transition ${
                              selectedBankQuestions.includes(q.id)
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-600"
                                : "hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                            onClick={() => {
                              setSelectedBankQuestions((prev) =>
                                prev.includes(q.id)
                                  ? prev.filter((id) => id !== q.id)
                                  : [...prev, q.id]
                              );
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">
                                  {q.question_text}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">
                                    {q.category || "Umum"}
                                  </Badge>
                                  <Badge variant="outline">
                                    {q.difficulty || "Medium"}
                                  </Badge>
                                  <Badge variant="outline">
                                    {q.points} poin
                                  </Badge>
                                </div>
                              </div>
                              {selectedBankQuestions.includes(q.id) && (
                                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowQuestionBankDialog(false)}
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleAddFromBank}
                          disabled={selectedBankQuestions.length === 0}
                        >
                          Tambah{" "}
                          {selectedBankQuestions.length > 0 &&
                            `(${selectedBankQuestions.length})`}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showPackageDialog}
              onOpenChange={(open) => {
                setShowPackageDialog(open);
                if (open) {
                  loadQuestionPackages();
                } else {
                  setSelectedPackageId("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Dari Paket Soal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Pilih Paket Soal</DialogTitle>
                  <DialogDescription>
                    Import seluruh soal dari paket yang dipilih ke ujian ini.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {loadingPackages ? (
                    <div className="text-center py-6">Memuat paket soal...</div>
                  ) : questionPackages.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      Tidak ada paket soal yang tersedia untuk mata pelajaran
                      ini.
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label>Paket Soal</Label>
                        <Select
                          value={selectedPackageId}
                          onValueChange={setSelectedPackageId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih paket soal" />
                          </SelectTrigger>
                          <SelectContent>
                            {questionPackages.map((pkg) => (
                              <SelectItem
                                key={pkg.id}
                                value={pkg.id.toString()}
                              >
                                {pkg.name} ({pkg.total_questions} soal)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedPackage && (
                        <div className="border rounded-lg p-4 space-y-2">
                          <p className="font-medium">{selectedPackage.name}</p>
                          {selectedPackage.description && (
                            <p className="text-sm text-gray-600">
                              {selectedPackage.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <Badge variant="outline">
                              {selectedPackage.total_questions} soal
                            </Badge>
                            <Badge variant="outline">
                              {selectedPackage.total_points} poin
                            </Badge>
                            {selectedPackage.difficulty_level && (
                              <Badge variant="outline">
                                {difficultyLabelMap[
                                  selectedPackage.difficulty_level
                                ] ?? selectedPackage.difficulty_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPackageDialog(false);
                            setSelectedPackageId("");
                          }}
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleImportPackage}
                          disabled={importingPackage || !selectedPackageId}
                        >
                          {importingPackage ? "Mengimpor..." : "Tambahkan"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showAddQuestionDialog}
              onOpenChange={setShowAddQuestionDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Soal Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Buat Soal Baru</DialogTitle>
                  <DialogDescription>
                    Buat soal baru langsung untuk ujian ini
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Teks Soal *</Label>
                    <Textarea
                      value={newQuestion.question_text}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          question_text: e.target.value,
                        })
                      }
                      placeholder="Masukkan pertanyaan..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipe Soal *</Label>
                      <Select
                        value={newQuestion.question_type}
                        onValueChange={(value) => {
                          setNewQuestion({
                            ...newQuestion,
                            question_type: value,
                            // Reset options jika tipe soal essay
                            options:
                              value === "essay"
                                ? []
                                : newQuestion.options.length > 0
                                ? newQuestion.options
                                : [
                                    { option_text: "", is_correct: false },
                                    { option_text: "", is_correct: false },
                                    { option_text: "", is_correct: false },
                                    { option_text: "", is_correct: false },
                                  ],
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe soal" />
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
                      <Label>Poin *</Label>
                      <Input
                        type="number"
                        value={newQuestion.points}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            points: parseInt(e.target.value),
                          })
                        }
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Jawaban yang diharapkan untuk essay */}
                  {newQuestion.question_type === "essay" && (
                    <div>
                      <Label>Jawaban yang Diharapkan (Opsional)</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sebagai acuan guru saat menilai jawaban siswa
                      </p>
                      <Textarea
                        value={newQuestion.expected_answer || ""}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            expected_answer: e.target.value,
                          })
                        }
                        placeholder="Contoh jawaban yang benar..."
                        rows={4}
                      />
                    </div>
                  )}

                  {/* Tampilkan pilihan jawaban hanya untuk multiple choice */}
                  {newQuestion.question_type === "multiple_choice" && (
                    <div>
                      <Label>Pilihan Jawaban *</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Klik ✓ untuk menandai jawaban yang benar
                      </p>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Button
                              type="button"
                              variant={
                                option.is_correct ? "default" : "outline"
                              }
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => toggleCorrectOption(index)}
                            >
                              {option.is_correct ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </Button>
                            <span className="w-6 text-center font-medium">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <Input
                              value={option.option_text}
                              onChange={(e) =>
                                updateOptionText(index, e.target.value)
                              }
                              placeholder={`Pilihan ${String.fromCharCode(
                                65 + index
                              )}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tampilkan penjelasan untuk soal essay */}
                  {newQuestion.question_type === "essay" && (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Info:</strong> Soal essay tidak memerlukan
                        pilihan jawaban. Siswa akan menjawab dengan mengetik
                        jawaban mereka sendiri.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddQuestionDialog(false)}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleCreateManualQuestion}>
                      Tambah Soal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!test.questions || test.questions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground mb-2">Belum ada soal</p>
              <p className="text-sm text-muted-foreground">
                Tambahkan soal dari bank soal atau buat soal baru
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {test.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="border-l-4 border-l-blue-500"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Soal {index + 1}</Badge>
                          <Badge variant="outline">
                            {question.points} poin
                          </Badge>
                        </div>
                        <MathContent
                          content={question.question_text}
                          className="font-medium mb-3 text-foreground"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {question.options && question.options.length > 0 && (
                      <div className="space-y-2 ml-4">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={option.id}
                            className={`p-2 rounded flex items-center gap-2 ${
                              option.is_correct
                                ? "bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800"
                                : "bg-gray-50 dark:bg-gray-800"
                            }`}
                          >
                            <span className="font-medium text-foreground">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <MathContent
                              content={option.option_text}
                              className="inline text-foreground"
                            />
                            {option.is_correct && (
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clone Remedial Dialog */}
      <Dialog
        open={showCloneRemedialDialog}
        onOpenChange={setShowCloneRemedialDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone ke Ujian Remidi</DialogTitle>
            <DialogDescription>
              Masukkan jadwal baru untuk ujian remidi. Soal akan disalin dari
              ujian ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="remedial_start_time">Waktu Mulai *</Label>
              <Input
                id="remedial_start_time"
                type="datetime-local"
                value={remedialSchedule.start_time}
                onChange={(e) =>
                  setRemedialSchedule({
                    ...remedialSchedule,
                    start_time: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="remedial_end_time">Waktu Selesai *</Label>
              <Input
                id="remedial_end_time"
                type="datetime-local"
                value={remedialSchedule.end_time}
                onChange={(e) =>
                  setRemedialSchedule({
                    ...remedialSchedule,
                    end_time: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCloneRemedialDialog(false)}
              >
                Batal
              </Button>
              <Button
                onClick={async () => {
                  if (
                    !remedialSchedule.start_time ||
                    !remedialSchedule.end_time
                  ) {
                    toast({
                      title: "Error",
                      description: "Jadwal harus diisi",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    // Convert datetime-local format to Laravel-compatible format
                    // datetime-local gives: "2025-11-09T10:02"
                    // Laravel expects: "2025-11-09 10:02:00"
                    const formatDateTime = (dt: string) => {
                      if (!dt) return "";
                      // Replace T with space and add :00 for seconds
                      return dt.replace("T", " ") + ":00";
                    };

                    const payload = {
                      start_time: formatDateTime(remedialSchedule.start_time),
                      end_time: formatDateTime(remedialSchedule.end_time),
                    };

                    console.log("Sending payload:", payload);

                    const res = await testServiceApi.cloneRemedial(
                      parseInt(id!, 10),
                      payload
                    );
                    const newId = res?.test?.id ?? res?.id;
                    toast({
                      title: "Sukses",
                      description: "Ujian remidi berhasil dibuat (draft).",
                    });
                    setShowCloneRemedialDialog(false);
                    if (newId) navigate(`/tests/${newId}/edit`);
                  } catch (e: any) {
                    console.error("Clone remedial error:", e);
                    console.error("Response data:", e?.response?.data);

                    // Show detailed validation errors if available
                    const errors = e?.response?.data?.errors;
                    let errorMessage =
                      e?.response?.data?.message || "Gagal clone remidi";

                    if (errors) {
                      const errorList = Object.entries(errors)
                        .map(
                          ([field, messages]) =>
                            `${field}: ${(messages as string[]).join(", ")}`
                        )
                        .join("\n");
                      errorMessage = errorList || errorMessage;
                    }

                    toast({
                      title: "Error",
                      description: errorMessage,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Buat Ujian Remidi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
