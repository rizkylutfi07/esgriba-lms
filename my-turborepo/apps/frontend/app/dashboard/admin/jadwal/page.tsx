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
import { Plus, Pencil, Trash2 } from 'lucide-react';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

export default function JadwalPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jadwalList, isLoading } = useQuery({
    queryKey: ['jadwal'],
    queryFn: () => api.get('/jadwal'),
  });

  const { data: kelasList } = useQuery({
    queryKey: ['kelas'],
    queryFn: () => api.get('/kelas'),
  });

  const { data: mapelList } = useQuery({
    queryKey: ['mapel'],
    queryFn: () => api.get('/mapel'),
  });

  const { data: guruList } = useQuery({
    queryKey: ['guru'],
    queryFn: () => api.get('/guru'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/jadwal', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
      setIsFormOpen(false);
      toast({ title: 'Jadwal berhasil dibuat' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/jadwal/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
      setIsFormOpen(false);
      setEditingJadwal(null);
      toast({ title: 'Jadwal berhasil diupdate' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/jadwal/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
      toast({ title: 'Jadwal berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      classId: formData.get('classId'),
      subjectId: formData.get('subjectId'),
      teacherId: formData.get('teacherId'),
      dayOfWeek: formData.get('dayOfWeek'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
    };

    if (editingJadwal) {
      updateMutation.mutate({ id: editingJadwal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (

    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Jadwal</h1>
          <p className="text-gray-500 mt-1">Kelola jadwal pelajaran</p>
        </div>
        <Button onClick={() => { setEditingJadwal(null); setIsFormOpen(!isFormOpen); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingJadwal ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classId">Kelas</Label>
                  <select
                    id="classId"
                    name="classId"
                    defaultValue={editingJadwal?.classId || ''}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasList?.map((kelas: any) => (
                      <option key={kelas.id} value={kelas.id}>{kelas.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectId">Mata Pelajaran</Label>
                  <select
                    id="subjectId"
                    name="subjectId"
                    defaultValue={editingJadwal?.subjectId || ''}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    <option value="">Pilih Mapel</option>
                    {mapelList?.map((mapel: any) => (
                      <option key={mapel.id} value={mapel.id}>{mapel.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacherId">Guru</Label>
                  <select
                    id="teacherId"
                    name="teacherId"
                    defaultValue={editingJadwal?.teacherId || ''}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    <option value="">Pilih Guru</option>
                    {guruList?.map((guru: any) => (
                      <option key={guru.id} value={guru.id}>{guru.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Hari</Label>
                  <select
                    id="dayOfWeek"
                    name="dayOfWeek"
                    defaultValue={editingJadwal?.dayOfWeek || 'SENIN'}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Jam Mulai</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue={editingJadwal?.startTime}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Jam Selesai</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={editingJadwal?.endTime}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingJadwal ? 'Update' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingJadwal(null); }}>
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
                  <TableHead>Hari</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Guru</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(jadwalList) && jadwalList.length > 0 ? (
                  jadwalList.map((jadwal: any) => (
                    <TableRow key={jadwal.id}>
                      <TableCell className="font-medium">{jadwal.dayOfWeek}</TableCell>
                      <TableCell>{jadwal.startTime} - {jadwal.endTime}</TableCell>
                      <TableCell>{jadwal.class?.name}</TableCell>
                      <TableCell>{jadwal.subject?.name}</TableCell>
                      <TableCell>{jadwal.teacher?.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingJadwal(jadwal); setIsFormOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (confirm('Hapus jadwal ini?')) deleteMutation.mutate(jadwal.id);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Tidak ada jadwal
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
