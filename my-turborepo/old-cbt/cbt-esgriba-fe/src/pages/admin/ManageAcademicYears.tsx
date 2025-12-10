import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  tests_count?: number;
}

export default function ManageAcademicYears() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get("/academic-years");
      setAcademicYears(response.data.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal memuat data tahun pelajaran";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleOpenDialog = (year?: AcademicYear) => {
    if (year) {
      setEditingYear(year);
      setFormData({
        name: year.name,
        start_date: year.start_date,
        end_date: year.end_date,
      });
    } else {
      setEditingYear(null);
      setFormData({ name: "", start_date: "", end_date: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingYear) {
        await api.put(`/academic-years/${editingYear.id}`, formData);
        toast({
          title: "Berhasil",
          description: "Tahun pelajaran berhasil diperbarui",
        });
      } else {
        await api.post("/academic-years", formData);
        toast({
          title: "Berhasil",
          description: "Tahun pelajaran berhasil ditambahkan",
        });
      }
      setIsDialogOpen(false);
      fetchAcademicYears();
    } catch (error: any) {
      // Render validation errors if present
      const errors = error?.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()?.[0] : null;
      const message =
        firstError || error?.response?.data?.message || "Terjadi kesalahan";
      toast({
        title: "Error",
        description: String(message),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id: number) => {
    setLoading(true);
    try {
      await api.post(`/academic-years/${id}/set-active`);
      toast({
        title: "Berhasil",
        description: "Tahun pelajaran aktif berhasil diubah",
      });
      fetchAcademicYears();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal mengubah tahun aktif",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/academic-years/${deleteId}`);
      toast({
        title: "Berhasil",
        description: "Tahun pelajaran berhasil dihapus",
      });
      setIsDeleteDialogOpen(false);
      fetchAcademicYears();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menghapus tahun pelajaran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-3 sm:p-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Kelola Tahun Pelajaran
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manajemen tahun pelajaran dan periode akademik
          </p>
        </div>
        <Button className="h-9 sm:h-10" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Tambah Tahun Pelajaran</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {academicYears.map((year) => (
          <Card
            key={year.id}
            className={year.is_active ? "border-primary" : ""}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <Calendar className="h-8 w-8 text-primary" />
                {year.is_active && (
                  <Badge className="bg-green-500">
                    <Check className="mr-1 h-3 w-3" /> Aktif
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-2">{year.name}</CardTitle>
              <CardDescription>
                {formatDate(year.start_date)} - {formatDate(year.end_date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">Total Ujian:</span>
                <span className="font-medium">{year.tests_count || 0}</span>
              </div>
              <div className="flex gap-2">
                {!year.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetActive(year.id)}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Check className="mr-1 h-3 w-3" /> Aktifkan
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(year)}
                  className="flex-1"
                >
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteId(year.id);
                    setIsDeleteDialogOpen(true);
                  }}
                  disabled={year.is_active}
                  className="flex-1"
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingYear ? "Edit Tahun Pelajaran" : "Tambah Tahun Pelajaran"}
            </DialogTitle>
            <DialogDescription>
              {editingYear
                ? "Perbarui informasi tahun pelajaran"
                : "Tambahkan tahun pelajaran baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tahun Pelajaran</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: 2024/2025"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Tanggal Mulai</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="end_date">Tanggal Selesai</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Tahun Pelajaran?</DialogTitle>
            <DialogDescription>
              Data tahun pelajaran akan dihapus permanen. Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
