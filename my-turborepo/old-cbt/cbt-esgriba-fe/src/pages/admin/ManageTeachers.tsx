import { useState, useEffect } from "react";
import { Plus, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  createTeachersColumns,
  Teacher as TeacherType,
} from "@/components/data-table/teachers-columns";
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

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Teacher extends TeacherType {
  gender: "L" | "P";
  birth_date: string;
  address?: string;
  role: string;
  subjects?: Array<{ id: number; name: string }>;
}

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    birth_date: "",
    phone: "",
    address: "",
    nip: "",
  });

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/users?role=guru");
      const raw = response.data.data || [];
      const normalized = raw.map((t: any) => ({
        ...t,
        subjects: Array.isArray(t.subjects)
          ? t.subjects.map((s: any) => ({
              id: s.id,
              name: s.name ?? s.subject_name ?? "",
            }))
          : [],
      }));
      setTeachers(normalized);
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat data guru",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleOpenDialog = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        email: teacher.email,
        password: "",
        gender: teacher.gender,
        birth_date: teacher.birth_date,
        phone: teacher.phone || "",
        address: teacher.address || "",
        nip: teacher.nip || "",
      });
      setSelectedSubjects(teacher.subjects?.map((s) => s.id) || []);
    } else {
      setEditingTeacher(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        gender: "",
        birth_date: "",
        phone: "",
        address: "",
        nip: "",
      });
      setSelectedSubjects([]);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData: any = {
        ...formData,
        role: "guru",
        subject_ids: selectedSubjects,
      };

      // Jika edit dan password kosong, hapus field password
      if (editingTeacher && !formData.password) {
        delete submitData.password;
      }

      if (editingTeacher) {
        await api.put(`/users/${editingTeacher.id}`, submitData);
        toast({
          title: "Berhasil",
          description: "Data guru berhasil diperbarui",
        });
      } else {
        await api.post("/users", submitData);
        toast({ title: "Berhasil", description: "Guru berhasil ditambahkan" });
      }
      setIsDialogOpen(false);
      fetchTeachers();
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
      await api.delete(`/users/${deleteId}`);
      toast({ title: "Berhasil", description: "Guru berhasil dihapus" });
      setIsDeleteDialogOpen(false);
      fetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus guru",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (teacher: Teacher) => {
    const action = teacher.is_active ? "menonaktifkan" : "mengaktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${action} guru ${teacher.name}?`)) return;

    try {
      await api.post(`/users/${teacher.id}/toggle-active`);
      toast({ 
        title: "Berhasil", 
        description: `Guru berhasil ${teacher.is_active ? "dinonaktifkan" : "diaktifkan"}` 
      });
      fetchTeachers();
    } catch (error: any) {
      console.error("Error toggling teacher status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Gagal ${action} guru`,
        variant: "destructive",
      });
    }
  };

  // Import/Export handlers
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/teachers/template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_import_guru.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Berhasil", description: "Template berhasil didownload" });
    } catch (error: any) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal download template",
        variant: "destructive",
      });
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Silakan pilih file Excel terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const response = await api.post("/teachers/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(response.data);
      toast({
        title: "Import Berhasil",
        description: `${response.data.stats.success} guru berhasil diimport${
          response.data.stats.failed > 0
            ? `, ${response.data.stats.failed} gagal`
            : ""
        }`,
      });
      fetchTeachers();
      if (response.data.stats.failed === 0) {
        setTimeout(() => {
          setIsImportDialogOpen(false);
          setImportFile(null);
          setImportResult(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error importing teachers:", error);
      const errorData = error.response?.data;
      let formattedErrors: any[] = [];
      if (errorData?.errors) {
        if (Array.isArray(errorData.errors)) {
          formattedErrors = errorData.errors;
        } else if (typeof errorData.errors === "object") {
          formattedErrors = Object.entries(errorData.errors).map(
            ([field, messages]: any) => {
              if (Array.isArray(messages)) {
                return { field, message: messages.join(", ") };
              } else if (typeof messages === "string") {
                return { field, message: messages };
              } else {
                return { field, message: String(messages) };
              }
            }
          );
        }
      }
      setImportResult({
        message: errorData?.message || "Import gagal",
        errors: formattedErrors,
        stats: errorData?.stats || null,
      });
      let errorMessage =
        errorData?.message || error.message || "Gagal mengimport data";
      if (error.response?.status === 422 && formattedErrors.length > 0) {
        errorMessage = `Validasi gagal: ${formattedErrors
          .slice(0, 3)
          .map((e: any) => e.message || e.errors?.[0] || String(e))
          .join("; ")}`;
        if (formattedErrors.length > 3) {
          errorMessage += ` dan ${formattedErrors.length - 3} error lainnya`;
        }
      }
      toast({
        title: "Error Import",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExportTeachers = async () => {
    try {
      const response = await api.get("/teachers/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `data_guru_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Berhasil", description: "Data guru berhasil diexport" });
    } catch (error: any) {
      console.error("Error exporting teachers:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal export data",
        variant: "destructive",
      });
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Kelola Guru</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manajemen data guru dan pengajar
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTeachers}
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            onClick={() => handleOpenDialog()}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Tambah</span>
          </Button>
        </div>
      </div>

      <Card className="p-2 sm:p-4">
        {/* Data Table */}
        <div className="w-full">
          <DataTable
            columns={createTeachersColumns(
              (teacher) => handleOpenDialog(teacher as Teacher),
              (teacher) => {
                setDeleteId(teacher.id);
                setIsDeleteDialogOpen(true);
              },
              (teacher) => handleToggleActive(teacher as Teacher)
            )}
            data={teachers}
            searchKey="name"
            searchPlaceholder="Cari guru berdasarkan nama..."
          />
        </div>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingTeacher ? "Edit Guru" : "Tambah Guru"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingTeacher
                ? "Perbarui informasi guru"
                : "Tambahkan guru baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="col-span-1 sm:col-span-2">
              <Label htmlFor="name" className="text-sm">
                Nama Lengkap *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nama lengkap guru"
                className="text-sm"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="nip" className="text-sm">
                NIP
              </Label>
              <Input
                id="nip"
                value={formData.nip}
                onChange={(e) =>
                  setFormData({ ...formData, nip: e.target.value })
                }
                placeholder="Nomor Induk Pegawai"
                className="text-sm"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="gender" className="text-sm">
                Jenis Kelamin *
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1">
              <Label htmlFor="birth_date" className="text-sm">
                Tanggal Lahir *
              </Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="phone" className="text-sm">
                Nomor Telepon
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="08xxxxxxxxxx"
                className="text-sm"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Label htmlFor="address" className="text-sm">
                Alamat
              </Label>
              <textarea
                id="address"
                className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground dark:bg-slate-900 dark:text-white dark:border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Alamat lengkap"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Label className="text-sm">Mata Pelajaran</Label>
              <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto">
                {subjects.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Tidak ada mata pelajaran tersedia
                  </p>
                ) : (
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <label
                        key={subject.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects([
                                ...selectedSubjects,
                                subject.id,
                              ]);
                            } else {
                              setSelectedSubjects(
                                selectedSubjects.filter(
                                  (id) => id !== subject.id
                                )
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm flex-1">{subject.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {subject.code}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedSubjects.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {selectedSubjects.length} mata pelajaran dipilih
                </p>
              )}
            </div>
            <div className="col-span-1">
              <Label htmlFor="email" className="text-sm">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@example.com"
                className="text-sm"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="password" className="text-sm">
                Password{" "}
                {editingTeacher && (
                  <span className="text-xs text-muted-foreground">
                    (kosongkan jika tidak diubah)
                  </span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  editingTeacher ? "Kosongkan jika tidak diubah" : "Password"
                }
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
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
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg">Hapus Guru?</DialogTitle>
            <DialogDescription className="text-sm">
              Data guru akan dihapus permanen. Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
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

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Import Data Guru dari Excel
            </DialogTitle>
            <DialogDescription className="text-sm">
              Upload file Excel (.xlsx atau .xls) untuk import data guru secara
              massal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Input */}
            <div className="space-y-2">
              <Label htmlFor="import-file" className="text-sm">
                Pilih File Excel
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="import-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  disabled={importing}
                  className="flex-1 text-sm"
                />
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  disabled={importing}
                  className="whitespace-nowrap text-sm w-full sm:w-auto"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </div>
              {importFile && (
                <p className="text-sm text-green-600 break-all">
                  ✓ File dipilih: {importFile.name}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 space-y-2">
              <h4 className="font-semibold text-blue-900 text-xs sm:text-sm">
                📋 Format Data Excel:
              </h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>
                  <strong>nama</strong> - Wajib diisi
                </li>
                <li>
                  <strong>email</strong> - Wajib diisi, harus unique
                </li>
                <li>
                  <strong>nip</strong> - Optional, unik jika diisi (format TEXT)
                </li>
                <li>
                  <strong>jenis_kelamin</strong> - Optional (L/P)
                </li>
                <li>
                  <strong>password</strong> - Optional (default: password123)
                </li>
                <li>
                  <strong>tanggal_lahir</strong> - Optional (YYYY-MM-DD atau
                  tanggal Excel)
                </li>
                <li>
                  <strong>phone</strong> - Optional
                </li>
                <li>
                  <strong>address</strong> - Optional
                </li>
                <li>
                  <strong>status</strong> - Optional (aktif/nonaktif)
                </li>
              </ul>
            </div>

            {/* Import Result */}
            {importResult && (
              <div
                className={`rounded-lg p-3 sm:p-4 space-y-2 ${
                  importResult.stats?.failed > 0
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <h4
                  className={`font-semibold text-xs sm:text-sm ${
                    importResult.stats?.failed > 0
                      ? "text-yellow-900"
                      : "text-green-900"
                  }`}
                >
                  {importResult.stats?.failed > 0
                    ? "⚠️ Import Selesai dengan Beberapa Error"
                    : "✅ Import Berhasil!"}
                </h4>
                {importResult.stats && (
                  <div className="text-xs sm:text-sm space-y-1">
                    <p className="text-green-700">
                      ✓ Berhasil: {importResult.stats.success} guru
                    </p>
                    {importResult.stats.failed > 0 && (
                      <p className="text-red-700">
                        ✗ Gagal: {importResult.stats.failed} guru
                      </p>
                    )}
                  </div>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <p className="text-xs sm:text-sm font-semibold text-red-800 mb-2">
                      Detail Error:
                    </p>
                    <div className="space-y-2">
                      {importResult.errors
                        .slice(0, 5)
                        .map((err: any, idx: number) => {
                          let errorRow = "";
                          let errorMessage = "";
                          if (typeof err === "string") {
                            errorMessage = err;
                          } else if (err.row) {
                            errorRow = `Baris ${err.row}`;
                            errorMessage =
                              err.errors?.join(", ") ||
                              err.error ||
                              err.message ||
                              String(err);
                            if (err.attribute) {
                              errorMessage = `${err.attribute}: ${errorMessage}`;
                            }
                          } else if (err.field) {
                            errorRow = err.field;
                            errorMessage = err.message || String(err);
                          } else if (err.error || err.errors) {
                            errorMessage =
                              err.error ||
                              (Array.isArray(err.errors)
                                ? err.errors.join(", ")
                                : String(err.errors));
                          } else {
                            errorMessage = String(err);
                          }
                          return (
                            <div
                              key={idx}
                              className="text-xs bg-white p-2 rounded border border-red-200 break-words"
                            >
                              {errorRow && (
                                <p className="font-semibold text-red-700 mb-1">
                                  {errorRow}
                                </p>
                              )}
                              <p className="text-red-600">{errorMessage}</p>
                            </div>
                          );
                        })}
                      {importResult.errors.length > 5 && (
                        <p className="text-xs text-gray-600 italic">
                          ...dan {importResult.errors.length - 5} error lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {importing && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-sm text-gray-600">
                  Mengimport data...
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportFile(null);
                setImportResult(null);
              }}
              disabled={importing}
              className="w-full sm:w-auto"
            >
              {importResult ? "Tutup" : "Batal"}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              onClick={handleImportSubmit}
              disabled={!importFile || importing}
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Sekarang
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
