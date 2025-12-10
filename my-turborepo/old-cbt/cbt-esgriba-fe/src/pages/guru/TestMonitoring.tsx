import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
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
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import testService, {
  Test,
  TestMonitorAttempt,
  TestMonitorResponse,
} from "../../lib/services/testService";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  AlertCircle,
  ArrowDownUp,
  Ban,
  CheckCircle2,
  Clock,
  FilterX,
  Hourglass,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Unlock,
  Users,
} from "lucide-react";
import { cn } from "../../lib/utils";

type SummaryKey =
  | "total"
  | "inProgress"
  | "completed"
  | "blocked"
  | "notStarted";

export default function TestMonitoring() {
  const { toast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [monitorData, setMonitorData] = useState<TestMonitorResponse | null>(
    null
  );
  const [isLoadingMonitor, setIsLoadingMonitor] = useState(false);
  const [autoRefreshEnabled] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState<TestMonitorAttempt | null>(
    null
  );
  const [unblockTarget, setUnblockTarget] = useState<TestMonitorAttempt | null>(
    null
  );
  const [blockReason, setBlockReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [showOnlyBlocked, setShowOnlyBlocked] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "progress">("default");
  const [isTogglingCheatDetection, setIsTogglingCheatDetection] =
    useState(false);

  const loadTests = useCallback(async () => {
    try {
      setIsLoadingTests(true);
      const response = await testService.getTests({
        per_page: 100,
        sort_by: "start_time",
        sort_order: "desc",
        status: "active", // Only show currently active tests
      });
      const payload = Array.isArray(response?.data)
        ? (response.data as Test[])
        : (response as Test[]);
      setTests(payload);

      if (!selectedTestId && payload.length > 0) {
        setSelectedTestId(payload[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Gagal memuat ujian",
        description:
          error.response?.data?.message || "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTests(false);
    }
  }, [selectedTestId, toast]);

  const loadMonitorData = useCallback(
    async (silent = false) => {
      if (!selectedTestId) return;

      try {
        if (!silent) {
          setIsLoadingMonitor(true);
        }
        const data = await testService.getTestMonitor(selectedTestId);
        setMonitorData(data);
        setLastUpdatedAt(new Date());
      } catch (error: any) {
        toast({
          title: "Gagal memuat monitoring",
          description:
            error.response?.data?.message ||
            "Tidak dapat mengambil data monitoring saat ini",
          variant: "destructive",
        });
      } finally {
        if (!silent) {
          setIsLoadingMonitor(false);
        }
      }
    },
    [selectedTestId, toast]
  );

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  useEffect(() => {
    if (!selectedTestId) return;
    loadMonitorData();
  }, [selectedTestId, loadMonitorData]);

  useEffect(() => {
    if (!selectedTestId || !autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      loadMonitorData(true);
    }, 60000); // UBAH DARI 15 DETIK JADI 30 DETIK

    return () => clearInterval(intervalId);
  }, [selectedTestId, autoRefreshEnabled, loadMonitorData]);

  const summary = useMemo<Record<SummaryKey, number>>(() => {
    const attempts = monitorData?.attempts ?? [];

    const totals: Record<SummaryKey, number> = {
      total: 0,
      inProgress: 0,
      completed: 0,
      blocked: 0,
      notStarted: 0,
    };

    attempts.forEach((attempt) => {
      totals.total += 1;

      if (attempt.status === "not_started") {
        totals.notStarted += 1;
      } else if (attempt.is_blocked || attempt.status === "blocked") {
        totals.blocked += 1;
      } else if (attempt.status === "completed") {
        totals.completed += 1;
      } else {
        totals.inProgress += 1;
      }
    });

    return totals;
  }, [monitorData]);

  const handleOpenBlock = (attempt: TestMonitorAttempt) => {
    setBlockTarget(attempt);
    setBlockReason("");
    setBlockDialogOpen(true);
  };

  const handleOpenUnblock = (attempt: TestMonitorAttempt) => {
    setUnblockTarget(attempt);
    setUnblockDialogOpen(true);
  };

  const handleCloseBlockDialog = () => {
    setBlockDialogOpen(false);
    setBlockTarget(null);
    setBlockReason("");
  };

  const handleCloseUnblockDialog = () => {
    setUnblockDialogOpen(false);
    setUnblockTarget(null);
  };

  const formatTimestamp = (value?: string | null) => {
    if (!value) return "-";
    return format(new Date(value), "dd MMM yyyy HH:mm", { locale: idLocale });
  };

  const formatRelative = (value?: string | null) => {
    if (!value) return "-";
    return formatDistanceToNow(new Date(value), {
      addSuffix: true,
      locale: idLocale,
    });
  };

  const renderStatusBadge = (attempt: TestMonitorAttempt) => {
    if (attempt.status === "not_started") {
      return (
        <Badge
          variant="outline"
          className="border-dashed border-amber-500 bg-amber-50 text-amber-600"
        >
          Belum memulai
        </Badge>
      );
    }

    if (attempt.is_blocked || attempt.status === "blocked") {
      return (
        <Badge
          variant="outline"
          className="border-red-500 bg-red-50 text-red-600"
        >
          Diblokir
        </Badge>
      );
    }

    if (attempt.status === "completed") {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500 bg-emerald-50 text-emerald-600"
        >
          Selesai
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="border-blue-500 bg-blue-50 text-blue-600"
      >
        Sedang berlangsung
      </Badge>
    );
  };

  const handleBlockAttempt = async () => {
    if (!blockTarget || blockTarget.id == null) return;

    try {
      setActionLoadingId(blockTarget.id);
      await testService.blockAttempt(
        blockTarget.id,
        blockReason.trim() ? blockReason.trim() : undefined
      );
      toast({
        title: "Attempt diblokir",
        description: `${blockTarget.student.name} tidak dapat melanjutkan ujian sampai dibuka kembali`,
      });
      handleCloseBlockDialog();
      await loadMonitorData(true);
    } catch (error: any) {
      toast({
        title: "Gagal memblokir attempt",
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan saat memblokir attempt",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnblockAttempt = async () => {
    if (!unblockTarget || unblockTarget.id == null) return;

    try {
      setActionLoadingId(unblockTarget.id);
      await testService.unblockAttempt(unblockTarget.id);
      toast({
        title: "Attempt dibuka",
        description: `${unblockTarget.student.name} dapat melanjutkan ujian`,
      });
      handleCloseUnblockDialog();
      await loadMonitorData(true);
    } catch (error: any) {
      toast({
        title: "Gagal membuka blokir",
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan saat membuka blokir attempt",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const summaryConfig: Record<
    SummaryKey,
    {
      label: string;
      description: string;
      icon: JSX.Element;
      gradient: string;
    }
  > = {
    total: {
      label: "Total Peserta",
      description: "Jumlah peserta terdaftar",
      icon: <Users className="h-5 w-5" />,
      gradient: "from-blue-500 to-purple-500",
    },
    inProgress: {
      label: "Sedang Berlangsung",
      description: "Attempt aktif saat ini",
      icon: <Clock className="h-5 w-5" />,
      gradient: "from-sky-500 to-cyan-500",
    },
    completed: {
      label: "Selesai",
      description: "Attempt yang sudah selesai",
      icon: <CheckCircle2 className="h-5 w-5" />,
      gradient: "from-emerald-500 to-green-500",
    },
    blocked: {
      label: "Diblokir",
      description: "Attempt yang diblokir pengawas",
      icon: <ShieldAlert className="h-5 w-5" />,
      gradient: "from-rose-500 to-red-500",
    },
    notStarted: {
      label: "Belum Mulai",
      description: "Siswa belum memulai ujian",
      icon: <Hourglass className="h-5 w-5" />,
      gradient: "from-amber-500 to-orange-500",
    },
  };

  const attempts = monitorData?.attempts ?? [];
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    attempts.forEach((a) => {
      const cn = a.student?.class_name?.trim();
      if (cn) set.add(cn);
    });
    return Array.from(set).sort();
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let result = attempts.filter((a) => {
      const matchSearch = term
        ? (a.student?.name || "").toLowerCase().includes(term) ||
          (a.student?.email || "").toLowerCase().includes(term) ||
          (a.student?.nisn || "").toLowerCase().includes(term)
        : true;
      const matchClass =
        classFilter === "all" || a.student?.class_name === classFilter;
      const matchBlocked = showOnlyBlocked
        ? a.is_blocked || a.status === "blocked"
        : true;
      return matchSearch && matchClass && matchBlocked;
    });

    if (sortBy === "progress") {
      result = [...result].sort(
        (a, b) => (b.progress_percent ?? 0) - (a.progress_percent ?? 0)
      );
    }

    return result;
  }, [attempts, searchTerm, classFilter, showOnlyBlocked, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setClassFilter("all");
    setShowOnlyBlocked(false);
    setSortBy("default");
  };

  const handleToggleCheatDetection = async (checked: boolean) => {
    if (!selectedTestId || !monitorData?.test) return;

    try {
      setIsTogglingCheatDetection(true);

      // Update ke backend
      await testService.updateTest(selectedTestId, {
        cheat_detection_enabled: checked,
      });

      // Reload data dari server untuk memastikan sinkronisasi
      await loadMonitorData(true);

      toast({
        title: checked
          ? "Deteksi kecurangan diaktifkan"
          : "Deteksi kecurangan dinonaktifkan",
        description: checked
          ? "Sistem akan memblokir otomatis setelah 3 pelanggaran"
          : "Pemblokiran hanya dapat dilakukan secara manual",
      });
    } catch (error: any) {
      toast({
        title: "Gagal mengubah pengaturan",
        description:
          error.response?.data?.message || "Terjadi kesalahan pada sistem",
        variant: "destructive",
      });

      // Reload data untuk revert ke state sebelumnya jika gagal
      await loadMonitorData(true);
    } finally {
      setIsTogglingCheatDetection(false);
    }
  };

  return (
    <div className="p-2 sm:p-3 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6 overflow-x-hidden">
      <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold tracking-tight">
            Monitoring Ujian
          </h1>
          <p className="mt-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
            Pantau progres realtime siswa
          </p>
          {lastUpdatedAt && (
            <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                Update: {format(lastUpdatedAt, "HH:mm:ss")}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 md:w-64">
            <Select
              value={selectedTestId ? String(selectedTestId) : ""}
              onValueChange={(value) => setSelectedTestId(Number(value))}
              disabled={isLoadingTests || tests.length === 0}
            >
              <SelectTrigger
                id="monitoring-test-select"
                className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm bg-white dark:bg-slate-900"
              >
                <SelectValue
                  placeholder={
                    isLoadingTests ? "Memuat..." : "Pilih Jadwal Ujian"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tests.map((test) => (
                  <SelectItem key={test.id} value={String(test.id)}>
                    <span className="font-medium">{test.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => loadMonitorData()}
            disabled={!selectedTestId || isLoadingMonitor}
            className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm bg-white dark:bg-slate-900"
          >
            {isLoadingMonitor ? (
              <Loader2 className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {!isLoadingTests && tests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Tidak ada ujian</CardTitle>
            <CardDescription>
              Belum ada ujian yang dapat dimonitor. Buat ujian terlebih dahulu
              untuk mulai memantau aktivitas siswa.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {monitorData?.test && (
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base md:text-lg line-clamp-2">
                          {monitorData.test.title}
                        </CardTitle>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-slate-200 flex-shrink-0 text-[10px] sm:text-xs"
                      >
                        #{monitorData.test.id}
                      </Badge>
                    </div>
                    {monitorData.test.is_remedial && (
                      <Badge className="bg-blue-600 hover:bg-blue-700 w-fit text-[10px] sm:text-xs">
                        Remidi ({monitorData.test.allowed_students_count} siswa)
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Switch
                        id="cheat-detection"
                        checked={
                          monitorData.test.cheat_detection_enabled ?? true
                        }
                        onCheckedChange={handleToggleCheatDetection}
                        disabled={isTogglingCheatDetection}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <Label
                          htmlFor="cheat-detection"
                          className="text-xs sm:text-sm font-semibold cursor-pointer"
                        >
                          Deteksi Kecurangan
                        </Label>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                          {monitorData.test.cheat_detection_enabled
                            ? "Blokir otomatis setelah 3 pelanggaran"
                            : "Pemblokiran manual oleh pengawas"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        monitorData.test.cheat_detection_enabled
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "flex-shrink-0 text-xs",
                        monitorData.test.cheat_detection_enabled
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400"
                      )}
                    >
                      {monitorData.test.cheat_detection_enabled
                        ? "AKTIF"
                        : "NONAKTIF"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-5">
            {(Object.keys(summaryConfig) as SummaryKey[]).map((key) => (
              <Card key={key} className="overflow-hidden">
                <CardContent className="p-2.5 sm:p-3 md:p-5">
                  <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase text-slate-500 truncate">
                        {summaryConfig[key].label}
                      </p>
                      <p className="mt-1 md:mt-2 text-lg sm:text-xl md:text-3xl font-bold">
                        {summary[key]}
                      </p>
                      <p className="mt-0.5 md:mt-1 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-clamp-2">
                        {summaryConfig[key].description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm flex-shrink-0",
                        summaryConfig[key].gradient
                      )}
                    >
                      <div className="scale-[0.65] sm:scale-75 md:scale-100">
                        {summaryConfig[key].icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">
                Status Pengerjaan
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs md:text-sm line-clamp-2">
                Daftar attempt siswa diperbarui otomatis setiap 15 detik.
              </CardDescription>
              <div className="mt-2 sm:mt-3 md:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                <div className="relative sm:col-span-2 md:col-span-1">
                  <Input
                    placeholder="Cari siswa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Select
                    value={classFilter}
                    onValueChange={(v) => setClassFilter(v)}
                  >
                    <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Filter kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      {classOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2 md:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Button
                  variant={showOnlyBlocked ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyBlocked(!showOnlyBlocked)}
                  className={cn(
                    "text-[10px] sm:text-[11px] md:text-xs h-7 sm:h-8 md:h-9 px-2 sm:px-3",
                    showOnlyBlocked && "bg-red-600 hover:bg-red-700 text-white"
                  )}
                >
                  <ShieldAlert className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />
                  {showOnlyBlocked ? "Semua" : "Diblokir"}
                </Button>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[110px] sm:w-[140px] md:w-[160px] h-7 sm:h-8 md:h-9 text-[10px] sm:text-[11px] md:text-xs">
                    <ArrowDownUp className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="progress">Progres</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground hover:text-foreground h-7 sm:h-8 md:h-9 px-2 sm:px-3"
                >
                  <FilterX className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4">
              {/* Desktop Table View */}
              <div className="hidden md:block w-full border-t border-slate-200 dark:border-slate-800">
                <div className="w-full overflow-x-auto pb-4">
                  <div className="min-w-[1000px]">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-left text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="px-4 py-3 whitespace-nowrap border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                            Peserta
                          </th>
                          <th className="px-4 py-3 whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-4 py-3 whitespace-nowrap">
                            Progres
                          </th>
                          <th className="px-4 py-3 whitespace-nowrap">
                            Aktivitas & Pelanggaran
                          </th>
                          <th className="px-4 py-3 text-right whitespace-nowrap">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {isLoadingMonitor ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-20 text-center">
                              <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <p>Memuat data monitoring...</p>
                              </div>
                            </td>
                          </tr>
                        ) : filteredAttempts.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-20 text-center text-sm text-muted-foreground"
                            >
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Users className="h-10 w-10 text-slate-300" />
                                <p>Tidak ada data siswa yang cocok.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredAttempts.map((attempt) => (
                            <tr
                              key={`attempt-${attempt.student.id}-${
                                attempt.id ?? "pending"
                              }`}
                              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 group"
                            >
                              <td className="px-4 py-3 align-top border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="flex flex-col gap-1">
                                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                    {attempt.student.name}
                                  </div>
                                  <div className="flex flex-col text-xs text-muted-foreground">
                                    <span>{attempt.student.nisn}</span>
                                    {attempt.student.class_name && (
                                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-fit mt-1">
                                        {attempt.student.class_name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex flex-col gap-1.5">
                                  {renderStatusBadge(attempt)}
                                  {attempt.status_label && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {attempt.status_label}
                                    </span>
                                  )}
                                  {attempt.started_at && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                      <Clock className="h-3 w-3" />
                                      {format(
                                        new Date(attempt.started_at),
                                        "HH:mm"
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top min-w-[160px]">
                                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                                  <span className="text-slate-600 dark:text-slate-300">
                                    {attempt.answered_count} /{" "}
                                    {attempt.total_questions}
                                  </span>
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {attempt.progress_percent}%
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                    style={{
                                      width: `${attempt.progress_percent}%`,
                                    }}
                                  />
                                </div>
                                <p className="mt-1.5 text-[10px] text-slate-500 truncate">
                                  Last active:{" "}
                                  {formatRelative(attempt.last_activity_at)}
                                </p>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[10px] font-normal h-5 px-1.5",
                                        attempt.cheat_count &&
                                          attempt.cheat_count >= 3
                                          ? "border-red-200 bg-red-50 text-red-600"
                                          : attempt.cheat_count &&
                                            attempt.cheat_count > 0
                                          ? "border-amber-200 bg-amber-50 text-amber-600"
                                          : "border-slate-200 text-slate-500"
                                      )}
                                    >
                                      <AlertCircle className="mr-1 h-3 w-3" />
                                      {attempt.cheat_count || 0} Pelanggaran
                                    </Badge>
                                  </div>
                                  {(attempt.events ?? []).length > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-[10px] text-slate-600 dark:text-slate-400 space-y-1 max-w-[200px] border border-slate-100 dark:border-slate-700">
                                      {(attempt.events ?? [])
                                        .slice(0, 2)
                                        .map((event) => (
                                          <div
                                            key={event.id}
                                            className="line-clamp-1"
                                            title={
                                              event.description ||
                                              event.event_type
                                            }
                                          >
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                              {event.event_type}
                                            </span>
                                            <span className="mx-1">·</span>
                                            {format(
                                              new Date(event.created_at),
                                              "HH:mm"
                                            )}
                                          </div>
                                        ))}
                                      {(attempt.events ?? []).length > 2 && (
                                        <div className="text-center text-xs text-blue-500 cursor-pointer hover:underline">
                                          +{(attempt.events ?? []).length - 2}{" "}
                                          lainnya
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top text-right">
                                <div className="flex justify-end">
                                  {!attempt.id ? (
                                    <span className="text-xs text-slate-400 italic">
                                      Menunggu
                                    </span>
                                  ) : attempt.is_blocked ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenUnblock(attempt)}
                                      disabled={actionLoadingId === attempt.id}
                                      className="h-8 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                      {actionLoadingId === attempt.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Unlock className="mr-1.5 h-3.5 w-3.5" />
                                      )}
                                      Buka
                                    </Button>
                                  ) : attempt.status === "completed" ? (
                                    <span className="text-xs font-medium text-emerald-600 flex items-center justify-end gap-1">
                                      <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                      Selesai
                                    </span>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenBlock(attempt)}
                                      disabled={actionLoadingId === attempt.id}
                                      className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                      {actionLoadingId === attempt.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Ban className="mr-1.5 h-3.5 w-3.5" />
                                      )}
                                      Blokir
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-2.5">
                {isLoadingMonitor ? (
                  <div className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-sm">Memuat data monitoring...</p>
                    </div>
                  </div>
                ) : filteredAttempts.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-10 w-10 text-slate-300" />
                      <p className="text-sm text-muted-foreground">
                        Tidak ada data siswa yang cocok.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredAttempts.map((attempt) => (
                    <Card
                      key={`mobile-attempt-${attempt.student.id}-${
                        attempt.id ?? "pending"
                      }`}
                      className="overflow-hidden"
                    >
                      <CardContent className="p-3 space-y-2.5">
                        {/* Student Info */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs truncate">
                              {attempt.student.name}
                            </h3>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {attempt.student.nisn}
                            </p>
                            {attempt.student.class_name && (
                              <Badge
                                variant="outline"
                                className="mt-1 text-[9px] h-4 px-1.5"
                              >
                                {attempt.student.class_name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {renderStatusBadge(attempt)}
                          </div>
                        </div>

                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                            <span className="text-slate-600 dark:text-slate-300 text-[10px]">
                              Progres
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 text-[10px]">
                              {attempt.answered_count}/{attempt.total_questions}{" "}
                              ({attempt.progress_percent}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                              style={{
                                width: `${attempt.progress_percent}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Activity & Violations */}
                        <div className="space-y-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-normal h-5 px-1.5 w-fit",
                              attempt.cheat_count && attempt.cheat_count >= 3
                                ? "border-red-200 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                                : attempt.cheat_count && attempt.cheat_count > 0
                                ? "border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                                : "border-slate-200 text-slate-500"
                            )}
                          >
                            <AlertCircle className="mr-0.5 h-2.5 w-2.5" />
                            {attempt.cheat_count || 0} Pelanggaran
                          </Badge>

                          {(attempt.events ?? []).length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-1.5 text-[9px] text-slate-600 dark:text-slate-400 space-y-0.5 border border-slate-100 dark:border-slate-700">
                              {(attempt.events ?? [])
                                .slice(0, 2)
                                .map((event) => (
                                  <div
                                    key={event.id}
                                    className="line-clamp-1 truncate"
                                  >
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                      {event.event_type}
                                    </span>
                                    <span className="mx-1">·</span>
                                    {format(
                                      new Date(event.created_at),
                                      "HH:mm"
                                    )}
                                  </div>
                                ))}
                              {(attempt.events ?? []).length > 2 && (
                                <div className="text-center text-[9px] text-blue-500">
                                  +{(attempt.events ?? []).length - 2} lagi
                                </div>
                              )}
                            </div>
                          )}

                          {/* Last Activity */}
                          <div className="flex items-center gap-1 text-[9px] text-slate-500 truncate">
                            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="truncate">
                              {formatRelative(attempt.last_activity_at)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          {!attempt.id ? (
                            <span className="text-[10px] text-slate-400 italic block text-center">
                              Menunggu memulai
                            </span>
                          ) : attempt.is_blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenUnblock(attempt)}
                              disabled={actionLoadingId === attempt.id}
                              className="w-full h-8 text-[10px] border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              {actionLoadingId === attempt.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Unlock className="mr-1 h-3 w-3" />
                              )}
                              Buka Blokir
                            </Button>
                          ) : attempt.status === "completed" ? (
                            <div className="text-center py-1.5">
                              <span className="text-[10px] font-medium text-emerald-600 flex items-center justify-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Selesai
                              </span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenBlock(attempt)}
                              disabled={actionLoadingId === attempt.id}
                              className="w-full h-8 text-[10px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              {actionLoadingId === attempt.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Ban className="mr-1 h-3 w-3" />
                              )}
                              Blokir Siswa
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog
        open={blockDialogOpen}
        onOpenChange={(open) =>
          open ? setBlockDialogOpen(true) : handleCloseBlockDialog()
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blokir attempt siswa?</AlertDialogTitle>
            <AlertDialogDescription>
              Siswa tidak akan dapat melanjutkan pengerjaan sampai Anda membuka
              blokir. Tambahkan catatan jika diperlukan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Target: {blockTarget?.student.name}
            </p>
            <Textarea
              placeholder="Alasan pemblokiran (opsional)"
              value={blockReason}
              onChange={(event) => setBlockReason(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseBlockDialog}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockAttempt}
              disabled={actionLoadingId === blockTarget?.id}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoadingId === blockTarget?.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              Blokir sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={unblockDialogOpen}
        onOpenChange={(open) =>
          open ? setUnblockDialogOpen(true) : handleCloseUnblockDialog()
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buka blokir attempt?</AlertDialogTitle>
            <AlertDialogDescription>
              Siswa akan dapat melanjutkan pengerjaan ujian selama waktu ujian
              masih berlangsung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseUnblockDialog}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblockAttempt}
              disabled={actionLoadingId === unblockTarget?.id}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {actionLoadingId === unblockTarget?.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unlock className="mr-2 h-4 w-4" />
              )}
              Buka blokir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
