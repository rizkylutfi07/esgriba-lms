'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, Download, Upload, FileDown } from 'lucide-react';

export default function KelasPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: kelasList, isLoading } = useQuery({
    queryKey: ['kelas'],
    queryFn: () => api.get('/kelas'),
  });

  const { data: jurusanList } = useQuery({
    queryKey: ['jurusan'],
    queryFn: () => api.get('/jurusan'),
  });

  const { data: guruList } = useQuery({
    queryKey: ['guru'],
    queryFn: () => api.get('/guru'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/kelas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas'] });
      setIsFormOpen(false);
      toast({ title: 'Kelas berhasil dibuat' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/kelas/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas'] });
      setIsFormOpen(false);
      setEditingKelas(null);
      toast({ title: 'Kelas berhasil diupdate' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/kelas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas'] });
      toast({ title: 'Kelas berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      level: formData.get('level'),
      majorId: formData.get('majorId') || null,
      homeroomTeacherId: formData.get('homeroomTeacherId') || null,
    };

    if (editingKelas) {
      updateMutation.mutate({ id: editingKelas.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas/export/excel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Kelas_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas/template/excel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_Import_Kelas.xlsx';
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas/import/excel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success > 0) {
        queryClient.invalidateQueries({ queryKey: ['kelas'] });
        toast({
          title: 'Import berhasil',
          description: `${result.success} kelas berhasil diimport, ${result.failed} gagal`
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
          <h1 className="text-2xl md:text-3xl font-bold">Manajemen Kelas</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Kelola data kelas</p>
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
          <Button onClick={() => { setEditingKelas(null); setIsFormOpen(!isFormOpen); }} size="sm" className="flex-1 md:flex-none">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="md:inline">Tambah</span>
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kelas</Label>
                  <Input id="name" name="name" defaultValue={editingKelas?.name} required placeholder="Contoh: X-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Tingkat</Label>
                  <select
                    id="level"
                    name="level"
                    defaultValue={editingKelas?.level || 'X'}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="majorId">Jurusan</Label>
                  <select
                    id="majorId"
                    name="majorId"
                    defaultValue={editingKelas?.majorId || ''}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Pilih Jurusan</option>
                    {jurusanList?.map((jurusan: any) => (
                      <option key={jurusan.id} value={jurusan.id}>{jurusan.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeroomTeacherId">Wali Kelas</Label>
                  <select
                    id="homeroomTeacherId"
                    name="homeroomTeacherId"
                    defaultValue={editingKelas?.homeroomTeacherId || ''}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Pilih Wali Kelas</option>
                    {guruList?.map((guru: any) => (
                      <option key={guru.id} value={guru.id}>{guru.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingKelas ? 'Update' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingKelas(null); }}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kelas</TableHead>
                    <TableHead>Tingkat</TableHead>
                    <TableHead>Jurusan</TableHead>
                    <TableHead>Wali Kelas</TableHead>
                    <TableHead>Jumlah Siswa</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kelasList?.map((kelas: any) => (
                    <TableRow key={kelas.id}>
                      <TableCell className="font-medium">{kelas.name}</TableCell>
                      <TableCell>{kelas.level}</TableCell>
                      <TableCell>{kelas.major?.name || '-'}</TableCell>
                      <TableCell>{kelas.homeroomTeacher?.name || '-'}</TableCell>
                      <TableCell>{kelas._count?.students || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingKelas(kelas); setIsFormOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (confirm('Hapus kelas ini?')) deleteMutation.mutate(kelas.id);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
