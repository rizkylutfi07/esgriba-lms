import { useState, useEffect } from "react";
import { Plus, Download, Upload, FileSpreadsheet } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import {
  createStudentsColumns,
  Student as StudentType,
} from "@/components/data-table/students-columns";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Student extends StudentType {
  birth_date?: string;
  class_id?: number;
  major_id?: number;
  phone?: string;
  address?: string;
  religion?: string;
  birth_place?: string;
  kelas?: string;
  is_active?: boolean;
  last_login?: string;
  device_info?: string;
}

interface Class {
  id: number;
  name: string;
  class_name: string;
  major_id: number;
  major?: {
    id: number;
    name: string;
    code: string;
  };
}

interface StudentFormData {
  nisn: string;
  name: string;
  gender: string;
  birth_place: string;
  birth_date: string;
  nis: string;
  religion: string;
  address: string;
  class_id: string;
  email: string;
  password: string;
  password_confirmation: string;
  avatar?: File | null;
}

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed local search in favor of DataTable's built-in search
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    nisn: "",
    name: "",
    gender: "",
    birth_place: "",
    birth_date: "",
    nis: "",
    religion: "",
    address: "",
    class_id: "",
    email: "",
    password: "",
    password_confirmation: "",
    avatar: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Import states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/users?role=siswa");
      setStudents(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat data siswa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      setClasses(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        nisn: student.nisn || "",
        name: student.name || "",
        gender: student.gender || "",
        birth_place: (student as any).birth_place || "",
        birth_date: student.birth_date
          ? student.birth_date.includes("T")
            ? student.birth_date.substring(0, 10)
            : student.birth_date
          : "",
        nis: student.nis || "",
        religion: student.religion || "",
        address: student.address || "",
        class_id: student.class_id?.toString() || "",
        email: student.email || "",
        password: "",
        password_confirmation: "",
        avatar: null,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        nisn: "",
        name: "",
        gender: "",
        birth_place: "",
        birth_date: "",
        nis: "",
        religion: "",
        address: "",
        class_id: "",
        email: "",
        password: "",
        password_confirmation: "",
        avatar: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingStudent) {
        // For update, use JSON if no avatar, otherwise use FormData
        if (formData.avatar) {
          const data = new FormData();
          data.append("_method", "PUT");
          data.append("nisn", formData.nisn);
          data.append("name", formData.name);
          data.append("gender", formData.gender);
          data.append("birth_date", formData.birth_date);
          data.append("birth_place", formData.birth_place);
          data.append("nis", formData.nis);
          data.append("religion", formData.religion);
          data.append("address", formData.address);
          data.append("class_id", formData.class_id);
          data.append("email", formData.email);
          data.append("role", "siswa");

          if (formData.password) {
            data.append("password", formData.password);
            data.append(
              "password_confirmation",
              formData.password_confirmation
            );
          }

          data.append("avatar", formData.avatar);

          await api.post(`/users/${editingStudent.id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          // Use JSON for update without file
          const updateData: any = {
            nisn: formData.nisn,
            name: formData.name,
            gender: formData.gender,
            birth_date: formData.birth_date,
            birth_place: formData.birth_place,
            nis: formData.nis,
            religion: formData.religion,
            address: formData.address,
            class_id: parseInt(formData.class_id),
            email: formData.email,
            role: "siswa",
          };

          if (formData.password) {
            updateData.password = formData.password;
            updateData.password_confirmation = formData.password_confirmation;
          }

          await api.put(`/users/${editingStudent.id}`, updateData);
        }
        toast({
          title: "Berhasil",
          description: "Data siswa berhasil diperbarui",
        });
      } else {
        // For create, always use FormData
        const data = new FormData();
        data.append("nisn", formData.nisn);
        data.append("name", formData.name);
        data.append("gender", formData.gender);
        data.append("birth_date", formData.birth_date);
        data.append("birth_place", formData.birth_place);
        data.append("nis", formData.nis);
        data.append("religion", formData.religion);
        data.append("address", formData.address);
        data.append("class_id", formData.class_id);
        data.append("email", formData.email);
        data.append("role", "siswa");
        data.append("password", formData.password);
        data.append("password_confirmation", formData.password_confirmation);

        if (formData.avatar) {
          data.append("avatar", formData.avatar);
        }

        await api.post("/users", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Berhasil", description: "Siswa berhasil ditambahkan" });
      }

      fetchStudents();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error saving student:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal menyimpan data siswa",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus siswa ini?")) return;

    try {
      await api.delete(`/users/${id}`);
      toast({ title: "Berhasil", description: "Siswa berhasil dihapus" });
      fetchStudents();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus siswa",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (student: Student) => {
    const action = student.is_active ? "menonaktifkan" : "mengaktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${action} siswa ${student.name}?`)) return;

    try {
      await api.post(`/users/${student.id}/toggle-active`);
      toast({ 
        title: "Berhasil", 
        description: `Siswa berhasil ${student.is_active ? "dinonaktifkan" : "diaktifkan"}` 
      });
      fetchStudents();
    } catch (error: any) {
      console.error("Error toggling student status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Gagal ${action} siswa`,
        variant: "destructive",
      });
    }
  };

  // Import functions
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/students/template", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_import_siswa.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Berhasil",
        description: "Template berhasil didownload",
      });
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

      const response = await api.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImportResult(response.data);

      toast({
        title: "Import Berhasil",
        description: `${response.data.stats.success} siswa berhasil diimport${
          response.data.stats.failed > 0
            ? `, ${response.data.stats.failed} gagal`
            : ""
        }`,
      });

      // Refresh student list
      fetchStudents();

      // Close dialog after 3 seconds if no errors
      if (response.data.stats.failed === 0) {
        setTimeout(() => {
          setIsImportDialogOpen(false);
          setImportFile(null);
          setImportResult(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error importing:", error);
      const errorData = error.response?.data;

      // Format errors - handle both array and object formats
      let formattedErrors: any[] = [];
      if (errorData?.errors) {
        if (Array.isArray(errorData.errors)) {
          formattedErrors = errorData.errors;
        } else if (typeof errorData.errors === "object") {
          // Convert object errors to array format
          formattedErrors = Object.entries(errorData.errors).map(
            ([field, messages]) => {
              if (Array.isArray(messages)) {
                return {
                  field,
                  message: messages.join(", "),
                };
              } else if (typeof messages === "string") {
                return {
                  field,
                  message: messages,
                };
              } else {
                return {
                  field,
                  message: String(messages),
                };
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

      // Get error message
      let errorMessage =
        errorData?.message || error.message || "Gagal mengimport data";

      // If it's a validation error with formatted messages
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

  const handleExportStudents = async () => {
    try {
      const params: any = {};
      if (filterClass !== "all") params.class_id = filterClass;

      const response = await api.get("/students/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `data_siswa_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Berhasil",
        description: "Data siswa berhasil diexport",
      });
    } catch (error: any) {
      console.error("Error exporting students:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal export data",
        variant: "destructive",
      });
    }
  };

  // Filter only by class/status; search handled by DataTable
  const filteredStudents = students.filter((student) => {
    const matchClass =
      filterClass === "all" || student.class_id?.toString() === filterClass;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? student.is_active : !student.is_active);

    return matchClass && matchStatus;
  });

  // Note: any date formatting for table cells should be handled in column renderers

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:p-0 pb-20">
      {/* Tabs */}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white h-9 px-3 text-sm sm:h-10 sm:px-4"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Tambah Siswa</span>
            <span className="xs:hidden">Tambah</span>
          </Button>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white h-9 px-3 text-sm sm:h-10 sm:px-4"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Import Excel</span>
            <span className="sm:hidden">Import</span>
          </Button>

          <Button
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 h-9 px-3 text-sm sm:h-10 sm:px-4"
            onClick={handleDownloadTemplate}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download Template</span>
            <span className="sm:hidden">Template</span>
          </Button>

          <Button
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50 h-9 px-3 text-sm sm:h-10 sm:px-4"
            onClick={handleExportStudents}
            title="Export ke Excel"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>

          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[160px] sm:w-[220px] h-9 sm:h-10 text-sm">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.class_name}{" "}
                  {cls.major?.name ? `- ${cls.major.name}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] sm:w-[180px] h-9 sm:h-10 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Right slot intentionally left blank on mobile; DataTable provides search */}
      </div>

      {/* Data Table */}
      <DataTable
        columns={createStudentsColumns(
          (student) => handleOpenDialog(student),
          (student) => handleDelete(student.id),
          undefined,
          (student) => handleToggleActive(student)
        )}
        data={filteredStudents}
        searchKey="name"
        searchPlaceholder="Cari siswa berdasarkan nama..."
      />

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Data Siswa" : "Tambah Data Siswa"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Perbarui informasi siswa"
                : "Tambahkan siswa baru ke sistem"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* NISN */}
                <div>
                  <Label htmlFor="nisn">
                    NISN<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nisn"
                    value={formData.nisn}
                    onChange={(e) =>
                      setFormData({ ...formData, nisn: e.target.value })
                    }
                    required
                    className="mt-1"
                    placeholder="0051494556"
                  />
                </div>

                {/* Alamat - Row span 4 */}
                <div className="row-span-4">
                  <Label htmlFor="address">
                    Alamat<span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                    className="w-full h-[220px] mt-1 px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground dark:bg-slate-900 dark:text-white dark:border-slate-700"
                    placeholder="Dsn. Aseman RT 002 RW 003 Bimorejo Wongsorejo Banyuwangi"
                  />
                </div>

                {/* Nama */}
                <div>
                  <Label htmlFor="name">
                    Nama<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="mt-1"
                    placeholder="ABDUL AZIZ"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <Label htmlFor="gender">
                    Jenis Kelamin<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tempat Lahir */}
                <div>
                  <Label htmlFor="birth_place">
                    Tempat Lahir<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birth_place"
                    value={formData.birth_place}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_place: e.target.value })
                    }
                    required
                    className="mt-1"
                    placeholder="Banyuwangi"
                  />
                </div>

                {/* Kelas */}
                <div>
                  <Label htmlFor="class_id">
                    Kelas<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.class_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class_id: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.class_name}{" "}
                          {cls.major?.name ? `- ${cls.major.name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <Label htmlFor="birth_date">
                    Tanggal Lahir<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1"
                    placeholder="siswa@cbt.com"
                  />
                </div>

                {/* NIS */}
                <div>
                  <Label htmlFor="nis">
                    NIS<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nis"
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({ ...formData, nis: e.target.value })
                    }
                    required
                    className="mt-1"
                    placeholder="2764/0048/066"
                  />
                </div>

                {/* Foto */}
                <div>
                  <Label htmlFor="avatar">Foto (Optional)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2"
                      onClick={() =>
                        document.getElementById("avatar-input")?.click()
                      }
                    >
                      Pilih File
                    </Button>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          avatar: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {formData.avatar
                        ? formData.avatar.name
                        : "Tidak ada file dipilih"}
                    </span>
                  </div>
                </div>

                {/* Agama */}
                <div>
                  <Label htmlFor="religion">
                    Agama<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.religion}
                    onValueChange={(value) =>
                      setFormData({ ...formData, religion: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih Agama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Islam">Islam</SelectItem>
                      <SelectItem value="Kristen">Kristen</SelectItem>
                      <SelectItem value="Katolik">Katolik</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Buddha">Buddha</SelectItem>
                      <SelectItem value="Konghucu">Konghucu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Password Baru */}
                <div>
                  <Label htmlFor="password">Password Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="mt-1"
                    placeholder="••••••••••••••••"
                  />
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <Label htmlFor="password_confirmation">
                    Konfirmasi Password Baru
                  </Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_confirmation: e.target.value,
                      })
                    }
                    className="mt-1"
                    placeholder="Masukkan ulang password"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={submitting}
                  className="border-orange-500 text-orange-500 hover:bg-orange-50 w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gray-500 hover:bg-gray-600 text-white w-full sm:w-auto"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              Import Data Siswa dari Excel
            </DialogTitle>
            <DialogDescription>
              Upload file Excel (.xlsx atau .xls) untuk import data siswa secara
              massal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Input */}
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

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-blue-900 text-sm">
                📋 Format Data Excel:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>
                  <strong>nama</strong> - Wajib diisi
                </li>
                <li>
                  <strong>email</strong> - Wajib diisi, harus unique
                </li>
                <li>
                  <strong>nis</strong> - Optional, harus unique jika diisi
                </li>
                <li>
                  <strong>password</strong> - Optional (default: password123)
                </li>
                <li>
                  <strong>kelas</strong> - Optional, auto-create jika baru
                </li>
                <li>
                  <strong>jurusan</strong> - Optional, auto-create jika baru
                </li>
                <li>
                  <strong>status</strong> - Optional (aktif/nonaktif)
                </li>
                <li>
                  <strong>agama</strong> - Optional (bisa juga gunakan kolom
                  <em> religion</em>)
                </li>
                <li>
                  <strong>tempat_lahir</strong> - Optional (bisa juga gunakan{" "}
                  <em>birth_place</em>)
                </li>
                <li>
                  <strong>tanggal_lahir</strong> - Optional (bisa juga gunakan{" "}
                  <em>birth_date</em>), format disarankan YYYY-MM-DD atau
                  tanggal Excel
                </li>
                <li>
                  <strong>alamat</strong> - Optional (bisa juga gunakan
                  <em> address</em>)
                </li>
              </ul>
            </div>

            {/* Import Result */}
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

                {importResult.stats && (
                  <div className="text-sm space-y-1">
                    <p className="text-green-700">
                      ✓ Berhasil: {importResult.stats.success} siswa
                    </p>
                    {importResult.stats.failed > 0 && (
                      <p className="text-red-700">
                        ✗ Gagal: {importResult.stats.failed} siswa
                      </p>
                    )}
                  </div>
                )}

                {/* Error Details */}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      Detail Error:
                    </p>
                    <div className="space-y-2">
                      {importResult.errors
                        .slice(0, 5)
                        .map((err: any, idx: number) => {
                          // Handle different error formats
                          let errorRow = "";
                          let errorMessage = "";

                          if (typeof err === "string") {
                            errorMessage = err;
                          } else if (err.row) {
                            // Format from backend validation (row-based)
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
                            // Format from our error handler
                            errorRow = err.field;
                            errorMessage = err.message || String(err);
                          } else if (err.error || err.errors) {
                            // Generic error format
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

            {/* Loading State */}
            {importing && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-sm text-gray-600">
                  Mengimport data...
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
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
