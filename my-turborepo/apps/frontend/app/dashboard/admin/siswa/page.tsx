'use client';

import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, Download, Upload, FileDown, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function SiswaPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'nis' | 'nisn' | 'class'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siswaList, isLoading } = useQuery({
    queryKey: ['siswa'],
    queryFn: () => api.get('/siswa'),
  });

  const { data: kelasList } = useQuery({
    queryKey: ['kelas'],
    queryFn: () => api.get('/kelas'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/siswa', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siswa'] });
      setIsFormOpen(false);
      toast({ title: 'Siswa berhasil dibuat' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/siswa/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siswa'] });
      setIsFormOpen(false);
      setEditingSiswa(null);
      toast({ title: 'Siswa berhasil diupdate' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/siswa/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siswa'] });
      toast({ title: 'Siswa berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nis: formData.get('nis'),
      nisn: formData.get('nisn'),
      name: formData.get('name'),
      gender: formData.get('gender'),
      birthDate: formData.get('birthDate'),
      address: formData.get('address'),
      classId: formData.get('classId') || null,
    };

    if (editingSiswa) {
      updateMutation.mutate({ id: editingSiswa.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter, sort, and paginate data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(siswaList)) return [];

    // Filter
    let filtered = siswaList.filter((siswa: any) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        siswa.name?.toLowerCase().includes(searchLower) ||
        siswa.nis?.toLowerCase().includes(searchLower) ||
        siswa.nisn?.toLowerCase().includes(searchLower) ||
        siswa.class?.name?.toLowerCase().includes(searchLower)
      );
    });

    // Sort
    filtered.sort((a: any, b: any) => {
      let aVal = '';
      let bVal = '';

      if (sortField === 'name') {
        aVal = a.name || '';
        bVal = b.name || '';
      } else if (sortField === 'nis') {
        aVal = a.nis || '';
        bVal = b.nis || '';
      } else if (sortField === 'nisn') {
        aVal = a.nisn || '';
        bVal = b.nisn || '';
      } else if (sortField === 'class') {
        aVal = a.class?.name || '';
        bVal = b.class?.name || '';
      }

      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

    return filtered;
  }, [siswaList, searchQuery, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleSort = (field: 'name' | 'nis' | 'nisn' | 'class') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/export/excel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: 'Data berhasil diexport' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Export gagal', description: 'Terjadi kesalahan saat export data' });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/template/excel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_Import_Siswa.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: 'Template berhasil didownload' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Download gagal', description: 'Terjadi kesalahan saat download template' });
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/siswa/import/excel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success > 0) {
        queryClient.invalidateQueries({ queryKey: ['siswa'] });
        toast({
          title: 'Import berhasil',
          description: `${result.success} siswa berhasil diimport, ${result.failed} gagal`
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Import gagal',
          description: result.errors?.join(', ') || 'Semua data gagal diimport'
        });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Import gagal', description: 'Terjadi kesalahan saat import data' });
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (

    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manajemen Siswa</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Kelola data siswa</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate} size="sm" className="flex-1 md:flex-none">
            <FileDown className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Download Template</span>
          </Button>
          <Button variant="outline" onClick={handleExportExcel} size="sm" className="flex-1 md:flex-none">
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Export Excel</span>
          </Button>
          <Button variant="outline" disabled={isImporting} className="relative flex-1 md:flex-none" size="sm">
            <Upload className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">{isImporting ? 'Mengimport...' : 'Import Excel'}</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              disabled={isImporting}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
          <Button onClick={() => { setEditingSiswa(null); setIsFormOpen(!isFormOpen); }} size="sm" className="flex-1 md:flex-none">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="md:inline">Tambah</span>
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nis">NIS</Label>
                  <Input id="nis" name="nis" defaultValue={editingSiswa?.nis} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nisn">NISN</Label>
                  <Input id="nisn" name="nisn" defaultValue={editingSiswa?.nisn} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" name="name" defaultValue={editingSiswa?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={editingSiswa?.gender || 'LAKI_LAKI'}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Tanggal Lahir</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    defaultValue={editingSiswa?.birthDate?.split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classId">Kelas</Label>
                  <select
                    id="classId"
                    name="classId"
                    defaultValue={editingSiswa?.classId || ''}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasList?.map((kelas: any) => (
                      <option key={kelas.id} value={kelas.id}>{kelas.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input id="address" name="address" defaultValue={editingSiswa?.address} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingSiswa ? 'Update' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingSiswa(null); }}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama, NIS, NISN, atau kelas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('nis')}
                      >
                        <div className="flex items-center gap-1">
                          NIS
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('nisn')}
                      >
                        <div className="flex items-center gap-1">
                          NISN
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Nama
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead>Jenis Kelamin</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('class')}
                      >
                        <div className="flex items-center gap-1">
                          Kelas
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((siswa: any) => (
                        <TableRow key={siswa.id}>
                          <TableCell className="font-medium">{siswa.nis}</TableCell>
                          <TableCell>{siswa.nisn}</TableCell>
                          <TableCell>{siswa.name}</TableCell>
                          <TableCell>{siswa.gender === 'LAKI_LAKI' ? 'L' : 'P'}</TableCell>
                          <TableCell>{siswa.class?.name || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingSiswa(siswa); setIsFormOpen(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              if (confirm('Hapus siswa ini?')) deleteMutation.mutate(siswa.id);
                            }}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Tidak ada data siswa
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredAndSortedData.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} dari {filteredAndSortedData.length} data
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
