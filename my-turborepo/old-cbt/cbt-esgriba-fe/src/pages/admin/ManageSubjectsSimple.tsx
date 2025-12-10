import { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Dialog components are not used in this simplified page
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Subject {
  id: number;
  code: string;
  name: string;
  description?: string;
  major_id?: number;
  major?: {
    name: string;
  };
  is_active: boolean;
}

export default function ManageSubjectsSimple() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  // const [importFile, setImportFile] = useState<File | null>(null);
  // const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  // const [importing, setImporting] = useState(false);
  // const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal memuat data mata pelajaran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType =
      filterType === "all" ||
      (filterType === "umum" && !subject.major_id) ||
      (filterType === "kejuruan" && subject.major_id);

    return matchSearch && matchType;
  });

  // Import/Export handlers not used in simple view; left here for future wiring if needed.

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
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pelajaran
          </Button>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipe Mata Pelajaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="umum">Umum</SelectItem>
              <SelectItem value="kejuruan">Kejuruan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari mata pelajaran"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">No.</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Kode Pelajaran
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Nama Pelajaran
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Tipe Mata Pelajaran
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSubjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data mata pelajaran
                </td>
              </tr>
            ) : (
              filteredSubjects.map((subject, index) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-3 text-sm">{index + 1}</td>
                  <td className="px-6 py-3 text-sm font-medium">
                    {subject.code}
                  </td>
                  <td className="px-6 py-3 text-sm">{subject.name}</td>
                  <td className="px-6 py-3 text-sm">
                    {subject.major_id ? subject.major?.name || "Kejuruan" : "-"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
