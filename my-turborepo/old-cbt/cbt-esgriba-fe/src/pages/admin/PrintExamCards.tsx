import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "lucide-react";
import ExamCard from "@/components/ExamCard";
import api from "@/lib/api";
import "./exam-cards-new.css";

interface Class {
  id: number;
  class_name: string;
  major?: {
    name: string;
  };
}

interface CardData {
  id: number;
  name: string;
  class_name: string;
  username: string;
  password: string;
}

export default function PrintExamCards() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [examName, setExamName] = useState("SUMATIF AKHIR SEMESTER GANJIL");
  const [printDate, setPrintDate] = useState(
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );
  const [urlLogin, setUrlLogin] = useState(window.location.origin);
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      setClasses(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data kelas",
        variant: "destructive",
      });
    }
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedClass !== "all") {
        params.class_id = selectedClass;
      }

      const response = await api.get("/exam-cards", { params });
      setCards(response.data.data || []);
      setPreview(true);

      if (response.data.data.length === 0) {
        toast({
          title: "Info",
          description: "Tidak ada siswa aktif untuk dicetak",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error fetching cards:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat data kartu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (cards.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada kartu untuk dicetak",
        variant: "destructive",
      });
      return;
    }
    window.print();
  };

  // Group cards into pages (8 cards per page - F4 paper, 2x4 grid)
  const groupedCards: CardData[][] = [];
  for (let i = 0; i < cards.length; i += 8) {
    groupedCards.push(cards.slice(i, i + 8));
  }

  return (
    <div className="print-exam-cards-container">
      {/* Control Panel - Hidden when printing */}
      <div className="no-print control-panel bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
        <div className="space-y-4 p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Cetak Kartu Peserta Ujian
          </h1>

          {/* Form Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <Label
                htmlFor="examName"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Nama Ujian
              </Label>
              <Input
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Contoh: SUMATIF AKHIR SEMESTER GANJIL"
                className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <Label
                htmlFor="academicYear"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Tahun Pelajaran
              </Label>
              <Input
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Contoh: 2025/2026"
                className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <Label
                htmlFor="printDate"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Tanggal Cetak
              </Label>
              <Input
                id="printDate"
                value={printDate}
                onChange={(e) => setPrintDate(e.target.value)}
                placeholder="Contoh: 22 November 2025"
                className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <Label
                htmlFor="urlLogin"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                URL Login
              </Label>
              <Input
                id="urlLogin"
                value={urlLogin}
                onChange={(e) => setUrlLogin(e.target.value)}
                placeholder="Contoh: https://cbt.sekolah.sch.id"
                className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-full sm:w-64">
              <Label className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">
                Pilih Kelas
              </Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.class_name}
                      {cls.major?.name ? ` - ${cls.major.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={fetchCards}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
            >
              {loading ? "Memuat..." : "Tampilkan Kartu"}
            </Button>

            {preview && cards.length > 0 && (
              <Button
                onClick={handlePrint}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
              >
                <Printer className="mr-2 h-4 w-4" />
                Cetak ({cards.length} Kartu)
              </Button>
            )}
          </div>

          {preview && cards.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong className="font-semibold">Info:</strong> Total{" "}
                {cards.length} kartu akan dicetak dalam {groupedCards.length}{" "}
                halaman F4 (33cm x 21.5cm)
                <br />
                <span className="text-blue-700 dark:text-blue-300">
                  (8 kartu per halaman - 2 kolom x 4 baris dengan gap 3mm)
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview / Print Area */}
      {preview && cards.length > 0 && (
        <div className="print-area rounded-lg bg-white shadow-sm">
          {groupedCards.map((pageCards, pageIndex) => (
            <div key={pageIndex} className="print-page">
              <div className="cards-grid">
                {pageCards.map((card) => (
                  <ExamCard
                    key={card.id}
                    name={card.name}
                    className={card.class_name}
                    urlLogin={urlLogin}
                    username={card.username}
                    password={card.password}
                    examName={examName}
                    year={academicYear}
                    printDate={printDate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!preview && !loading && (
        <div className="no-print text-center py-20">
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Pilih kelas dan klik "Tampilkan Kartu" untuk melihat preview
          </p>
        </div>
      )}
    </div>
  );
}
