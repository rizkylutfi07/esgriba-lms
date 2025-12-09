'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function MapelPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mapelList, isLoading } = useQuery({
    queryKey: ['mapel'],
    queryFn: () => api.get('/mapel'),
  });

  const { data: guruList } = useQuery({
    queryKey: ['guru'],
    queryFn: () => api.get('/guru'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/mapel', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapel'] });
      setIsFormOpen(false);
      toast({ title: 'Mapel berhasil dibuat' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/mapel/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapel'] });
      setIsFormOpen(false);
      setEditingMapel(null);
      toast({ title: 'Mapel berhasil diupdate' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/mapel/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapel'] });
      toast({ title: 'Mapel berhasil dihapus' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      teacherId: formData.get('teacherId') || null,
    };

    if (editingMapel) {
      updateMutation.mutate({ id: editingMapel.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Mata Pelajaran</h1>
            <p className="text-gray-500 mt-1">Kelola data mata pelajaran</p>
          </div>
          <Button onClick={() => { setEditingMapel(null); setIsFormOpen(!isFormOpen); }}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Mapel
          </Button>
        </div>

        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>{editingMapel ? 'Edit Mapel' : 'Tambah Mapel Baru'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Mata Pelajaran</Label>
                    <Input id="name" name="name" placeholder="Matematika" defaultValue={editingMapel?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode</Label>
                    <Input id="code" name="code" placeholder="MTK" defaultValue={editingMapel?.code} required />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="teacherId">Guru Pengampu</Label>
                    <select 
                      id="teacherId" 
                      name="teacherId" 
                      defaultValue={editingMapel?.teacherId || ''}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="">Pilih Guru</option>
                      {guruList?.map((guru: any) => (
                        <option key={guru.id} value={guru.id}>{guru.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingMapel ? 'Update' : 'Simpan'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingMapel(null); }}>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Mata Pelajaran</TableHead>
                    <TableHead>Guru Pengampu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mapelList?.map((mapel: any) => (
                    <TableRow key={mapel.id}>
                      <TableCell className="font-medium">{mapel.code}</TableCell>
                      <TableCell>{mapel.name}</TableCell>
                      <TableCell>{mapel.teacher?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingMapel(mapel); setIsFormOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (confirm('Hapus mapel ini?')) deleteMutation.mutate(mapel.id);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
