import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table/data-table";
import {
  createClassesColumns,
  Class as ClassType,
} from "@/components/data-table/classes-columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Major {
  id: number;
  code: string;
  name: string;
}

interface Class extends ClassType {
  major_id: number;
  name?: string;
  capacity?: number;
  users_count?: number;
  major?: {
    id: number;
    code?: string;
    name?: string;
    major_name: string;
  };
}

export default function ManageClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    major_id: "",
    name: "",
    capacity: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchMajors();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      // Map API response to ensure class_name field exists
      const mappedData = response.data.data.map((item: any) => ({
        ...item,
        class_name: item.class_name || item.name,
        major: item.major
          ? {
              ...item.major,
              major_name: item.major.major_name || item.major.name,
            }
          : undefined,
      }));
      setClasses(mappedData);
    } catch (error: any) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat data kelas",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await api.get("/majors");
      setMajors(response.data.data);
    } catch (error: any) {
      console.error("Error fetching majors:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal memuat data jurusan",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = (classItem?: Class) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({
        major_id: classItem.major_id.toString(),
        name: classItem.class_name || classItem.name || "",
        capacity: classItem.capacity?.toString() || "",
      });
    } else {
      setEditingClass(null);
      setFormData({ major_id: "", name: "", capacity: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare data with correct field name
      const submitData = {
        major_id: formData.major_id,
        class_name: formData.name, // Backend expects class_name
        capacity: formData.capacity,
      };

      if (editingClass) {
        await api.put(`/classes/${editingClass.id}`, submitData);
        toast({ title: "Berhasil", description: "Kelas berhasil diperbarui" });
      } else {
        await api.post("/classes", submitData);
        toast({ title: "Berhasil", description: "Kelas berhasil ditambahkan" });
      }
      setIsDialogOpen(false);
      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Terjadi kesalahan",
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
      await api.delete(`/classes/${deleteId}`);
      toast({ title: "Berhasil", description: "Kelas berhasil dihapus" });
      setIsDeleteDialogOpen(false);
      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus kelas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Kelola Kelas</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manajemen data kelas dan kapasitas siswa
          </p>
        </div>
        <Button className="h-9 sm:h-10" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Tambah Kelas</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={createClassesColumns(
          (classItem) => handleOpenDialog(classItem as Class),
          (classItem) => {
            setDeleteId(classItem.id);
            setIsDeleteDialogOpen(true);
          }
        )}
        data={classes}
        searchKey="class_name"
        searchPlaceholder="Cari kelas..."
      />

      {/* OLD CODE BELOW - TO BE REMOVED
      {classes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Belum ada data kelas. Klik tombol "Tambah Kelas" untuk memulai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classItem) => (
            <Card key={classItem.id}>
              <CardHeader>
                <CardTitle>{classItem.name}</CardTitle>
                <CardDescription>{classItem.major?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Kapasitas:</span>
                    <span className="font-medium">
                      {classItem.capacity} siswa
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Users className="mr-1 h-3 w-3" /> Siswa:
                    </span>
                    <span className="font-medium">
                      {classItem.users_count || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      END OLD CODE */}

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? "Edit Kelas" : "Tambah Kelas"}
            </DialogTitle>
            <DialogDescription>
              {editingClass
                ? "Perbarui informasi kelas"
                : "Tambahkan kelas baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="major_id">Jurusan</Label>
              <Select
                value={formData.major_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, major_id: value })
                }
              >
                <SelectTrigger id="major_id">
                  <SelectValue placeholder="Pilih jurusan" />
                </SelectTrigger>
                <SelectContent>
                  {majors.map((major) => (
                    <SelectItem key={major.id} value={major.id.toString()}>
                      {major.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kelas</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: X TKR 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Kapasitas</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                placeholder="Contoh: 32"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
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
            <DialogTitle>Hapus Kelas?</DialogTitle>
            <DialogDescription>
              Data kelas akan dihapus permanen. Tindakan ini tidak dapat
              dibatalkan.
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
