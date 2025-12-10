import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { useToast } from "../../hooks/use-toast";
import testService, { CreateTestPayload } from "../../lib/services/testService";
import sessionService, { ExamSession } from "@/lib/services/sessionService";
import masterDataService, {
  Subject,
  ClassData,
} from "../../lib/services/masterDataService";
import remedialService from "@/lib/services/remedialService";
import { useAuthStore } from "../../store/authStore";
import { ArrowLeft, Save, Plus, ChevronsUpDown } from "lucide-react";

export default function CreateTest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const { user } = useAuthStore();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [loadingMasterData, setLoadingMasterData] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [openClassPopover, setOpenClassPopover] = useState(false);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [remedialStudents, setRemedialStudents] = useState<number[]>([]); // selected student IDs for remedial
  const [showRemedialAssign, setShowRemedialAssign] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [remedialMode, setRemedialMode] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const [formData, setFormData] = useState<CreateTestPayload>({
    title: "",
    description: "",
    subject: "",
    kelas: "",
    duration: 90,
    passing_score: 70,
    start_time: "",
    end_time: "",
    created_by: undefined,
    session: undefined,
  });

  // Single date, separate times (will be auto-filled by session)
  const [testDate, setTestDate] = useState<string>("");
  const [startTimeOnly, setStartTimeOnly] = useState<string>("");
  const [endTimeOnly, setEndTimeOnly] = useState<string>("");

  const buildDateTime = (time: string) =>
    testDate && time ? `${testDate}T${time}` : "";

  useEffect(() => {
    loadMasterData();
    if (isEdit) {
      loadTest();
    }
  }, [id]);

  const loadMasterData = async () => {
    try {
      setLoadingMasterData(true);

      // For admin, fetch teachers and all subjects
      // For guru, only fetch their subjects
      if (user?.role === "admin") {
        const [teachersData, classesData, sessionsData] = await Promise.all([
          masterDataService.teachers.getAll(),
          masterDataService.classes.getAll(),
          sessionService.list(),
        ]);

        console.log("Teachers data:", teachersData);
        console.log("Classes data:", classesData);

        setTeachers(Array.isArray(teachersData) ? teachersData : []);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      } else {
        // For guru, fetch their subjects
        const [subjectsData, classesData, sessionsData] = await Promise.all([
          masterDataService.subjects.getMySubjects(),
          masterDataService.classes.getAll(),
          sessionService.list(),
        ]);

        console.log("Subjects data:", subjectsData);
        console.log("Classes data:", classesData);

        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      }
    } catch (error: any) {
      console.error("Error loading master data:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Gagal memuat data mata pelajaran dan kelas",
        variant: "destructive",
      });
    } finally {
      setLoadingMasterData(false);
    }
  };

  const loadTest = async () => {
    try {
      const test = await testService.getTest(parseInt(id!));

      // Parse datetime with proper handling for ISO format and timezone
      const parseDateTime = (dt: string) => {
        if (!dt) return { date: "", time: "", full: "" };

        // Create date object from string (handles ISO, with/without timezone)
        const dateObj = new Date(dt);

        // Format to YYYY-MM-DD
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const date = `${year}-${month}-${day}`;

        // Format to HH:mm
        const hours = String(dateObj.getHours()).padStart(2, "0");
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        const time = `${hours}:${minutes}`;

        // Full datetime-local format
        const full = `${date}T${time}`;

        return { date, time, full };
      };

      const startParsed = parseDateTime(test.start_time);
      const endParsed = parseDateTime(test.end_time);

      setFormData({
        title: test.title.toUpperCase(),
        description: test.description || "",
        subject: test.subject,
        kelas: test.kelas,
        duration: test.duration,
        passing_score: test.passing_score,
        start_time: startParsed.full,
        end_time: endParsed.full,
        session: (test as any).session ?? undefined,
      });

      // Set selected classes from comma-separated string
      setSelectedClasses(
        test.kelas ? test.kelas.split(",").map((k: string) => k.trim()) : []
      );

      // Set split date/time inputs
      setTestDate(startParsed.date);
      setStartTimeOnly(startParsed.time);
      setEndTimeOnly(endParsed.time);

      // For admin: preselect teacher and load their subjects so subject value shows
      if (user?.role === "admin" && test.created_by) {
        const teacherIdStr = String(test.created_by);
        setSelectedTeacherId(teacherIdStr);
        try {
          const teacherSubjects = await masterDataService.teachers.getSubjects(
            parseInt(teacherIdStr)
          );
          const list = Array.isArray(teacherSubjects) ? teacherSubjects : [];
          if (list.length === 0) {
            // Fallback: load all subjects so current value still appears
            const allSubjects = await masterDataService.subjects.getAll();
            setSubjects(Array.isArray(allSubjects) ? allSubjects : []);
          } else {
            setSubjects(list);
          }
        } catch (e) {
          // Fallback: load all subjects
          try {
            const allSubjects = await masterDataService.subjects.getAll();
            setSubjects(Array.isArray(allSubjects) ? allSubjects : []);
          } catch {
            setSubjects([]);
          }
        }
      }

      // Load remedial list if exists
      try {
        const remedial = await remedialService.list(parseInt(id!));
        if (
          Array.isArray(remedial.allowed_students) &&
          remedial.allowed_students.length > 0
        ) {
          setRemedialStudents(remedial.allowed_students.map((s) => s.id));
          setRemedialMode(true);
        }
      } catch {}
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data ujian",
        variant: "destructive",
      });
      navigate("/tests");
    }
  };

  const loadStudentsForSelection = async () => {
    if (!id) return;
    try {
      setLoadingStudents(true);
      const data = await remedialService.eligible(parseInt(id));
      setAvailableStudents(Array.isArray(data.students) ? data.students : []);
    } catch (e) {
      setAvailableStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleRemedialStudent = (id: number) => {
    setRemedialStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const saveRemedial = async () => {
    if (!id) return;
    try {
      if (remedialStudents.length === 0) {
        await remedialService.clear(parseInt(id));
        setRemedialMode(false);
        toast({
          title: "Remidi dinonaktifkan",
          description: "Ujian kembali untuk semua kelas.",
        });
      } else {
        await remedialService.replace(parseInt(id), remedialStudents);
        setRemedialMode(true);
        toast({
          title: "Daftar remidi disimpan",
          description: `${remedialStudents.length} siswa dipilih.`,
        });
      }
      setShowRemedialAssign(false);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Gagal menyimpan remidi",
        variant: "destructive",
      });
    }
  };

  const handleTeacherChange = async (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setFormData((fd) => ({
      ...fd,
      subject: "",
      created_by: parseInt(teacherId),
    }));

    // Load teacher's subjects
    if (teacherId) {
      try {
        const teacherSubjects = await masterDataService.teachers.getSubjects(
          parseInt(teacherId)
        );
        console.log("Teacher subjects:", teacherSubjects);
        setSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : []);
      } catch (error: any) {
        console.error("Error loading teacher subjects:", error);
        toast({
          title: "Error",
          description: "Gagal memuat mata pelajaran guru",
          variant: "destructive",
        });
        setSubjects([]);
      }
    } else {
      setSubjects([]);
    }
  };

  const handleClassToggle = (className: string) => {
    setSelectedClasses((prev) => {
      const newSelection = prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className];

      // Update formData.kelas with comma-separated values
      setFormData((fd) => ({ ...fd, kelas: newSelection.join(", ") }));
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (user?.role === "admin" && !selectedTeacherId) {
      toast({
        title: "Error",
        description: "Pilih guru terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.subject || selectedClasses.length === 0) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Keep start_time/end_time in payload based on split inputs
      const payload: CreateTestPayload = {
        ...formData,
        start_time: buildDateTime(startTimeOnly),
        end_time: buildDateTime(endTimeOnly),
      };

      if (isEdit) {
        await testService.updateTest(parseInt(id!), payload);
        toast({
          title: "Sukses",
          description: "Ujian berhasil diperbarui",
        });
      } else {
        const result = await testService.createTest(payload);
        toast({
          title: "Sukses",
          description: "Ujian berhasil dibuat",
        });
        // Navigate to add questions
        navigate(`/tests/${result.test.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan ujian",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl px-2 sm:px-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isEdit ? "Edit Ujian" : "Buat Ujian Baru"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {isEdit
              ? "Perbarui informasi ujian"
              : "Isi form untuk membuat ujian baru"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Ujian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEdit && (
              <div className="flex items-center justify-between p-3 rounded-md border bg-gray-50">
                <div className="text-sm">
                  <span className="font-medium">Mode Remidi: </span>
                  {remedialMode ? (
                    <span className="text-blue-600">
                      Aktif ({remedialStudents.length} siswa)
                    </span>
                  ) : (
                    <span className="text-gray-500">Nonaktif</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRemedialAssign(true);
                    loadStudentsForSelection();
                  }}
                >
                  {remedialMode ? "Kelola Remidi" : "Atur Remidi"}
                </Button>
              </div>
            )}
            <div>
              <Label htmlFor="title">Judul Ujian *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Contoh: Ujian Tengah Semester Matematika"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Deskripsi ujian, materi yang diujikan, dll"
                rows={3}
              />
            </div>

            {user?.role === "admin" && (
              <div>
                <Label htmlFor="teacher">Pilih Guru *</Label>
                {loadingMasterData ? (
                  <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
                ) : (
                  <Select
                    value={selectedTeacherId}
                    onValueChange={handleTeacherChange}
                    required
                  >
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="Pilih guru yang akan membuat ujian" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          Tidak ada guru
                        </div>
                      ) : (
                        teachers.map((teacher) => (
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
                {teachers.length === 0 && !loadingMasterData && (
                  <p className="text-xs text-amber-600 mt-1">
                    Belum ada guru. Silakan tambahkan guru terlebih dahulu.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Mata Pelajaran *</Label>
                {loadingMasterData ? (
                  <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
                ) : (
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject: value })
                    }
                    required
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          Tidak ada mata pelajaran
                        </div>
                      ) : (
                        subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                {subjects.length === 0 && !loadingMasterData && (
                  <p className="text-xs text-amber-600 mt-1">
                    {user?.role === "guru"
                      ? "Anda belum memiliki mata pelajaran. Silakan hubungi admin untuk assign mata pelajaran kepada Anda."
                      : !selectedTeacherId
                      ? "Pilih guru terlebih dahulu untuk melihat mata pelajaran yang diajar."
                      : "Guru ini belum memiliki mata pelajaran. Assign mata pelajaran ke guru tersebut terlebih dahulu."}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="kelas">
                  Kelas * (dapat pilih lebih dari satu)
                </Label>
                {loadingMasterData ? (
                  <div className="h-10 bg-gray-500 animate-pulse rounded-md"></div>
                ) : (
                  <Popover
                    open={openClassPopover}
                    onOpenChange={setOpenClassPopover}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openClassPopover}
                        className="w-full justify-between font-normal"
                      >
                        {selectedClasses.length === 0 ? (
                          <span className="text-muted-foreground">
                            Pilih kelas...
                          </span>
                        ) : (
                          <span className="truncate">
                            {selectedClasses.length === 1
                              ? selectedClasses[0]
                              : `${selectedClasses.length} kelas dipilih`}
                          </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="max-h-64 overflow-y-auto p-2">
                        {classes.length === 0 ? (
                          <div className="px-2 py-4 text-center text-sm text-gray-500">
                            Tidak ada kelas
                          </div>
                        ) : (
                          classes.map((kelas) => {
                            const className = kelas.class_name || kelas.name;
                            return (
                              <div
                                key={kelas.id}
                                className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-500 cursor-pointer"
                                onClick={() => handleClassToggle(className)}
                              >
                                <Checkbox
                                  checked={selectedClasses.includes(className)}
                                  onCheckedChange={() =>
                                    handleClassToggle(className)
                                  }
                                />
                                <label className="text-sm cursor-pointer flex-1">
                                  {className}
                                </label>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                {classes.length === 0 && !loadingMasterData && (
                  <p className="text-xs text-amber-600 mt-1">
                    Belum ada kelas. Hubungi admin untuk menambahkan.
                  </p>
                )}
                {selectedClasses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedClasses.map((className) => (
                      <span
                        key={className}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md"
                      >
                        {className}
                        <button
                          type="button"
                          onClick={() => handleClassToggle(className)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Durasi (menit) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="passing_score">Nilai Kelulusan (KKM) *</Label>
                <Input
                  id="passing_score"
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passing_score: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="session">Sesi (opsional)</Label>
              <Select
                // Radix Select tidak boleh nilai kosong; gunakan 'none' untuk tidak memilih sesi
                value={formData.session ? formData.session.toString() : "none"}
                onValueChange={(v) => {
                  if (v === "none") {
                    setFormData({ ...formData, session: undefined });
                    return;
                  }
                  const n = parseInt(v, 10);
                  setFormData({ ...formData, session: n });
                  const selected = sessions.find(
                    (s) => (s.number ?? 0) === n || s.label === `Sesi ${n}`
                  );
                  if (selected) {
                    // auto set times & duration from session
                    setStartTimeOnly(selected.start_time);
                    setEndTimeOnly(selected.end_time);
                    if (
                      selected.duration_minutes &&
                      selected.duration_minutes > 0
                    ) {
                      setFormData((fd) => ({
                        ...fd,
                        duration: selected.duration_minutes!,
                      }));
                    } else {
                      // compute fallback
                      const [sh, sm] = selected.start_time
                        .split(":")
                        .map(Number);
                      const [eh, em] = selected.end_time.split(":").map(Number);
                      let dur = eh * 60 + em - (sh * 60 + sm);
                      if (dur <= 0) dur += 24 * 60;
                      setFormData((fd) => ({ ...fd, duration: dur }));
                    }
                  }
                }}
              >
                <SelectTrigger id="session">
                  <SelectValue placeholder="Pilih sesi (mis. 1, 2, 3)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Sesi</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={(s.number ?? 0).toString()}>
                      {s.label}{" "}
                      {s.start_time && s.end_time
                        ? `(${s.start_time} - ${s.end_time})`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="test_date">Tanggal Ujian *</Label>
                <Input
                  id="test_date"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="start_time_only">
                  Jam Mulai * (Format 24 jam)
                </Label>
                <Input
                  id="start_time_only"
                  type="text"
                  value={startTimeOnly}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and colon
                    if (/^[0-9:]*$/.test(value)) {
                      setStartTimeOnly(value);
                    }
                  }}
                  onBlur={(e) => {
                    // Format on blur
                    const value = e.target.value;
                    const match = value.match(/^(\d{1,2}):?(\d{0,2})$/);
                    if (match) {
                      const hours = parseInt(match[1]) || 0;
                      const minutes = parseInt(match[2]) || 0;
                      if (
                        hours >= 0 &&
                        hours <= 23 &&
                        minutes >= 0 &&
                        minutes <= 59
                      ) {
                        setStartTimeOnly(
                          `${String(hours).padStart(2, "0")}:${String(
                            minutes
                          ).padStart(2, "0")}`
                        );
                      }
                    }
                  }}
                  pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                  placeholder="HH:mm (contoh: 14:30)"
                  required
                  maxLength={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contoh: 14:30 untuk jam 2:30 siang
                </p>
              </div>
              <div>
                <Label htmlFor="end_time_only">
                  Jam Selesai * (Format 24 jam)
                </Label>
                <Input
                  id="end_time_only"
                  type="text"
                  value={endTimeOnly}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and colon
                    if (/^[0-9:]*$/.test(value)) {
                      setEndTimeOnly(value);
                    }
                  }}
                  onBlur={(e) => {
                    // Format on blur
                    const value = e.target.value;
                    const match = value.match(/^(\d{1,2}):?(\d{0,2})$/);
                    if (match) {
                      const hours = parseInt(match[1]) || 0;
                      const minutes = parseInt(match[2]) || 0;
                      if (
                        hours >= 0 &&
                        hours <= 23 &&
                        minutes >= 0 &&
                        minutes <= 59
                      ) {
                        setEndTimeOnly(
                          `${String(hours).padStart(2, "0")}:${String(
                            minutes
                          ).padStart(2, "0")}`
                        );
                      }
                    }
                  }}
                  pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                  placeholder="HH:mm (contoh: 16:00)"
                  required
                  maxLength={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contoh: 16:00 untuk jam 4 sore
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading
                  ? "Menyimpan..."
                  : isEdit
                  ? "Perbarui"
                  : "Simpan & Lanjutkan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {isEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Langkah Selanjutnya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                onClick={() => navigate(`/tests/${id}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Soal ke Ujian
              </Button>
              <p className="text-sm text-gray-500 ml-1">
                Setelah membuat ujian, Anda perlu menambahkan soal dari bank
                soal atau membuat soal baru
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {showRemedialAssign && (
        <Card className="mt-6 border-blue-200 shadow-md">
          <CardHeader>
            <CardTitle>Atur Siswa Remidi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Pilih siswa yang diperbolehkan mengikuti remidi ujian ini. Jika
              daftar kosong, ujian berlaku normal untuk semua kelas.
            </p>
            {remedialMode && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (!id) return;
                    try {
                      const blob = await remedialService.exportCsv(
                        parseInt(id)
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
                  Export CSV Remidi
                </Button>
              </div>
            )}
            {/* Search & bulk actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <Input
                  placeholder="Cari nama / NISN / kelas"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const q = studentSearch.trim().toLowerCase();
                    const filtered = availableStudents.filter((s: any) => {
                      if (!q) return true;
                      return (
                        (s.name || "").toLowerCase().includes(q) ||
                        (s.nisn || "").toLowerCase().includes(q) ||
                        (s.class_name || "").toLowerCase().includes(q)
                      );
                    });
                    const ids = filtered.map((s: any) => s.id);
                    setRemedialStudents((prev) =>
                      Array.from(new Set([...prev, ...ids]))
                    );
                  }}
                  className="w-full sm:w-auto text-sm"
                >
                  Pilih Semua
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const q = studentSearch.trim().toLowerCase();
                    const filtered = availableStudents.filter((s: any) => {
                      if (!q) return true;
                      return (
                        (s.name || "").toLowerCase().includes(q) ||
                        (s.nisn || "").toLowerCase().includes(q) ||
                        (s.class_name || "").toLowerCase().includes(q)
                      );
                    });
                    const ids = new Set(filtered.map((s: any) => s.id));
                    setRemedialStudents((prev) =>
                      prev.filter((id) => !ids.has(id))
                    );
                  }}
                  className="w-full sm:w-auto text-sm"
                >
                  Kosongkan
                </Button>
              </div>
            </div>
            {loadingStudents ? (
              <div className="text-sm">Memuat siswa...</div>
            ) : (
              <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
                {availableStudents.length === 0 && (
                  <div className="p-3 text-sm text-gray-500">
                    Tidak ada data siswa.
                  </div>
                )}
                {availableStudents
                  .filter((s: any) => {
                    const q = studentSearch.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      (s.name || "").toLowerCase().includes(q) ||
                      (s.nisn || "").toLowerCase().includes(q) ||
                      (s.class_name || "").toLowerCase().includes(q)
                    );
                  })
                  .map((s: any) => {
                    const checked = remedialStudents.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRemedialStudent(s.id)}
                          className="h-4 w-4"
                        />
                        <span className="flex-1">
                          {s.name}{" "}
                          {s.nisn ? (
                            <span className="text-xs text-gray-500">
                              ({s.nisn})
                            </span>
                          ) : null}
                          {s.class_name && (
                            <span className="text-xs text-blue-600 ml-1">
                              {s.class_name}
                            </span>
                          )}
                        </span>
                        {checked && (
                          <span className="text-xs text-blue-600">Dipilih</span>
                        )}
                      </label>
                    );
                  })}
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowRemedialAssign(false);
                }}
                className="w-full sm:w-auto"
              >
                Tutup
              </Button>
              <Button
                variant="default"
                type="button"
                onClick={saveRemedial}
                className="w-full sm:w-auto"
              >
                Simpan Daftar Remidi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
