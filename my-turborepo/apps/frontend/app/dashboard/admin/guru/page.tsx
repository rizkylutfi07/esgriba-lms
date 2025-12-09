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

export default function GuruPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: guruList, isLoading } = useQuery({
    queryKey: ['guru'],
    queryFn: () => api.get('/guru'),
  });

  const { data: kelasList } = useQuery({
    queryKey: ['kelas'],
    queryFn: () => api.get('/kelas'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/guru', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guru'] });
      setIsFormOpen(false);
      toast({ title: 'Guru berhasil dibuat' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/guru/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guru'] });
      setIsFormOpen(false);
      setEditingGuru(null);
      toast({ title: 'Guru berhasil diupdate' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/guru/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guru'] });
      toast({ title: 'Guru berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nip: formData.get('nip'),
      nipn: formData.get('nipn'),
      name: formData.get('name'),
      gender: formData.get('gender'),
      birthDate: formData.get('birthDate'),
      address: formData.get('address'),
      classId: formData.get('classId') || null,
    };

    if (editingGuru) {
      updateMutation.mutate({ id: editingGuru.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru/export/excel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Guru_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru/template/excel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_Import_Guru.xlsx';
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guru/import/excel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success > 0) {
        queryClient.invalidateQueries({ queryKey: ['guru'] });
        toast({
          title: 'Import berhasil',
          description: `${result.success} guru berhasil diimport, ${result.failed} gagal`
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
          <h1 className="text-2xl md:text-3xl font-bold">Manajemen Guru</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Kelola data guru</p>
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
          <Button onClick={() => { setEditingGuru(null); setIsFormOpen(!isFormOpen); }} size="sm" className="flex-1 md:flex-none">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="md:inline">Tambah</span>
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingGuru ? 'Edit Guru' : 'Tambah Guru Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP</Label>
                  <Input id="nip" name="nip" defaultValue={editingGuru?.nip} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nipn">NIPN</Label>
                  <Input id="nipn" name="nipn" defaultValue={editingGuru?.nipn} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" name="name" defaultValue={editingGuru?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Jenip Kelamin</Label>
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={editingGuru?.gender || 'LAKI_LAKI'}
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
                    defaultValue={editingGuru?.birthDate?.split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classId">Kelas</Label>
                  <select
                    id="classId"
                    name="classId"
                    defaultValue={editingGuru?.classId || ''}
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
                  <Input id="address" name="address" defaultValue={editingGuru?.address} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingGuru ? 'Update' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingGuru(null); }}>
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
                    <TableHead>NIP</TableHead>
                    <TableHead>NIPN</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenip Kelamin</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guruList?.map((guru: any) => (
                    <TableRow key={guru.id}>
                      <TableCell className="font-medium">{guru.nip}</TableCell>
                      <TableCell>{guru.nipn}</TableCell>
                      <TableCell>{guru.name}</TableCell>
                      <TableCell>{guru.gender === 'LAKI_LAKI' ? 'L' : 'P'}</TableCell>
                      <TableCell>{guru.class?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingGuru(guru); setIsFormOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (confirm('Hapus guru ini?')) deleteMutation.mutate(guru.id);
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
