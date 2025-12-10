import { useState, useEffect } from "react";
import { Plus, Upload, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { DataTable } from "@/components/data-table/data-table";
import {
  createSubjectsColumns,
  Subject,
} from "@/components/data-table/subjects-columns";

interface Major {
  id: number;
  code: string;
  name: string;
  major_name?: string;
}

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    major_id: "",
    code: "",
    name: "",
  });

  useEffect(() => {
    fetchSubjects();
    fetchMajors();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      // Map API response fields to match column definitions
      const mappedData = response.data.data.map((item: any) => ({
        ...item,
        subject_name: item.subject_name || item.name,
        subject_code: item.subject_code || item.code,
        major: item.major
          ? {
              ...item.major,
              major_name: item.major.major_name || item.major.name,
            }
          : undefined,
      }));
      setSubjects(mappedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data mata pelajaran",
        variant: "destructive",
      });
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await api.get("/majors");
      setMajors(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data jurusan",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        major_id: subject.major_id?.toString() || "",
        code: subject.subject_code,
        name: subject.subject_name,
      });
    } else {
      setEditingSubject(null);
      setFormData({ major_id: "", code: "", name: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validasi form
    if (!formData.code.trim()) {
      toast({
        title: "Error",
        description: "Kode mata pelajaran harus diisi",
        variant: "destructive",
      });
      return;
    }
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama mata pelajaran harus diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        major_id: formData.major_id ? parseInt(formData.major_id) : null,
      };

      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, submitData);
        toast({
          title: "Berhasil",
          description: "Mata pelajaran berhasil diperbarui",
        });
      } else {
        await api.post("/subjects", submitData);
        toast({
          title: "Berhasil",
          description: "Mata pelajaran berhasil ditambahkan",
        });
      }
      setIsDialogOpen(false);
      setFormData({ major_id: "", code: "", name: "" });
      fetchSubjects();
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
      await api.delete(`/subjects/${deleteId}`);
      toast({
        title: "Berhasil",
        description: "Mata pelajaran berhasil dihapus",
      });
      setIsDeleteDialogOpen(false);
      fetchSubjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menghapus mata pelajaran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Import/Export handlers
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/subjects/template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_import_mapel.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Berhasil", description: "Template berhasil didownload" });
    } catch (error: any) {
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
      const response = await api.post("/subjects/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(response.data);
      toast({
        title: "Import Berhasil",
        description: `${
          response.data.stats.success
        } mata pelajaran berhasil diimport${
          response.data.stats.failed > 0
            ? `, ${response.data.stats.failed} gagal`
            : ""
        }`,
      });
      fetchSubjects();
      if (response.data.stats.failed === 0) {
        setTimeout(() => {
          setIsImportDialogOpen(false);
          setImportFile(null);
          setImportResult(null);
        }, 3000);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      let formattedErrors: any[] = [];
      if (errorData?.errors) {
        if (Array.isArray(errorData.errors)) {
          formattedErrors = errorData.errors;
        } else if (typeof errorData.errors === "object") {
          formattedErrors = Object.entries(errorData.errors).map(
            ([field, messages]: any) => ({
              field,
              message: Array.isArray(messages)
                ? messages.join(", ")
                : typeof messages === "string"
                ? messages
                : String(messages),
            })
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
        if (formattedErrors.length > 3)
          errorMessage += ` dan ${formattedErrors.length - 3} error lainnya`;
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

  const handleExportSubjects = async () => {
    try {
      const response = await api.get("/subjects/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `data_mapel_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Berhasil",
        description: "Data mata pelajaran berhasil diexport",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-3 sm:p-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Kelola Mata Pelajaran
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Manajemen data mata pelajaran dan kurikulum
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="dark:border-slate-700 dark:hover:bg-slate-800 h-9 px-3"
          >
            <Upload className="mr-2 h-4 w-4" />{" "}
            <span className="hidden sm:inline">Import</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSubjects}
            className="dark:border-slate-700 dark:hover:bg-slate-800 h-9 px-3"
          >
            <Download className="mr-2 h-4 w-4" />{" "}
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button className="h-9 sm:h-10" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Tambah Mata Pelajaran</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </div>
      </div>

      <DataTable
        columns={createSubjectsColumns(
          (subject) => handleOpenDialog(subject),
          (subject) => {
            setDeleteId(subject.id);
            setIsDeleteDialogOpen(true);
          }
        )}
        data={subjects}
        searchKey="subject_name"
        searchPlaceholder="Cari mata pelajaran..."
      />

      {/* Form Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSubject(null);
            setFormData({ major_id: "", code: "", name: "" });
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </DialogTitle>
            <DialogDescription>
              {editingSubject
                ? "Perbarui informasi mata pelajaran"
                : "Tambahkan mata pelajaran baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="code">Kode Mata Pelajaran</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Contoh: MTK"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Mata Pelajaran</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Matematika"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="major_id">Jurusan (Opsional)</Label>
              <Select
                value={formData.major_id || "0"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    major_id: value === "0" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="major_id">
                  <SelectValue placeholder="Pilih jurusan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Umum (Semua Jurusan)</SelectItem>
                  {majors.map((major) => (
                    <SelectItem key={major.id} value={major.id.toString()}>
                      {major.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingSubject(null);
                setFormData({ major_id: "", code: "", name: "" });
              }}
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
            <DialogTitle>Hapus Mata Pelajaran?</DialogTitle>
            <DialogDescription>
              Data mata pelajaran akan dihapus permanen. Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
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
        <DialogContent className="w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              Import Data Mata Pelajaran dari Excel
            </DialogTitle>
            <DialogDescription>
              Upload file Excel (.xlsx atau .xls) untuk import data mata
              pelajaran secara massal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Pilih File Excel</Label>
              <div className="flex gap-2">
                <Input
                  id="import-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  disabled={importing}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  disabled={importing}
                  className="whitespace-nowrap"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </div>
              {importFile && (
                <p className="text-sm text-green-600">
                  ✓ File dipilih: {importFile.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-blue-900 text-sm">
                📋 Format Data Excel:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>
                  <strong>nama</strong> - Nama mata pelajaran (wajib)
                </li>
                <li>
                  <strong>kode</strong> - Kode mapel uppercase (wajib, unique).
                  Contoh: MAT, BIND
                </li>
                <li>
                  <strong>deskripsi</strong> - Keterangan mata pelajaran
                  (opsional)
                </li>
              </ul>
            </div>

            {importResult && (
              <div
                className={`rounded-lg p-4 space-y-2 ${
                  !importResult.stats
                    ? "bg-red-50 border border-red-200"
                    : importResult.stats.failed > 0
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <h4
                  className={`font-semibold text-sm ${
                    !importResult.stats
                      ? "text-red-900"
                      : importResult.stats.failed > 0
                      ? "text-yellow-900"
                      : "text-green-900"
                  }`}
                >
                  {!importResult.stats
                    ? "❌ Import Gagal"
                    : importResult.stats.failed > 0
                    ? "⚠️ Import Selesai dengan Beberapa Error"
                    : "✅ Import Berhasil!"}
                </h4>
                {!importResult.stats && importResult.message && (
                  <p className="text-sm text-red-700">{importResult.message}</p>
                )}
                {importResult.stats && (
                  <div className="text-sm space-y-1">
                    <p className="text-green-700">
                      ✓ Berhasil: {importResult.stats.success} mata pelajaran
                    </p>
                    {importResult.stats.failed > 0 && (
                      <p className="text-red-700">
                        ✗ Gagal: {importResult.stats.failed} mata pelajaran
                      </p>
                    )}
                  </div>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <p className="text-sm font-semibold text-red-800 mb-2">
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
                            if (err.attribute)
                              errorMessage = `${err.attribute}: ${errorMessage}`;
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
                              className="text-xs bg-white p-2 rounded border border-red-200"
                            >
                              {errorRow && (
                                <p className="font-semibold text-red-700">
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
              className="bg-green-600 hover:bg-green-700 text-white"
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
