'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layouts/dashboard-layout';

export default function MateriGuruPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    fileUrl: '',
    classId: '',
    subjectId: '',
    teacherId: '',
  });

  const { data: materiList, isLoading } = useQuery({
    queryKey: ['materi'],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const guru = await api.getGuru({ userId: user.id });
      if (!guru) return [];
      return api.getMateri({ teacherId: guru.id });
    },
  });

  const { data: kelas } = useQuery({
    queryKey: ['kelas'],
    queryFn: () => api.getKelas(),
  });

  const { data: mapel } = useQuery({
    queryKey: ['mapel'],
    queryFn: () => api.getMapel(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createMateri(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materi'] });
      setShowForm(false);
      resetForm();
      toast({ title: 'Materi berhasil ditambahkan' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Gagal menambahkan materi' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateMateri(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materi'] });
      setShowForm(false);
      setEditId(null);
      resetForm();
      toast({ title: 'Materi berhasil diupdate' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteMateri(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materi'] });
      toast({ title: 'Materi berhasil dihapus' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      fileUrl: '',
      classId: '',
      subjectId: '',
      teacherId: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const guru = await api.getGuru({ userId: user.id });
      if (!guru) {
        toast({ variant: 'destructive', title: 'Data guru tidak ditemukan' });
        return;
      }
      const dataToSend = { ...formData, teacherId: guru.id };

      if (editId) {
        updateMutation.mutate({ id: editId, data: dataToSend });
      } else {
        createMutation.mutate(dataToSend);
      }
    };
    submitData();
  };

  const handleEdit = (materi: any) => {
    setFormData({
      title: materi.title,
      description: materi.description || '',
      content: materi.content,
      fileUrl: materi.fileUrl || '',
      classId: materi.classId,
      subjectId: materi.subjectId,
      teacherId: materi.teacherId,
    });
    setEditId(materi.id);
    setShowForm(true);
  };

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Materi Pembelajaran</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '+ Tambah Materi'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editId ? 'Edit Materi' : 'Tambah Materi Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Judul</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Konten</Label>
                <textarea
                  className="w-full min-h-[200px] p-2 border rounded"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>File URL (opsional)</Label>
                <Input
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kelas</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {kelas?.map((k: any) => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Mata Pelajaran</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                  >
                    <option value="">Pilih Mapel</option>
                    {mapel?.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editId ? 'Update' : 'Simpan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {materiList?.map((materi: any) => (
          <Card key={materi.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{materi.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{materi.description}</p>
                  <div className="text-sm text-gray-500">
                    <span>Kelas: {materi.class?.name} | </span>
                    <span>Mapel: {materi.subject?.name}</span>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <p className="whitespace-pre-wrap">{materi.content}</p>
                  </div>
                  {materi.fileUrl && (
                    <a href={materi.fileUrl} target="_blank" className="text-blue-600 text-sm mt-2 inline-block">
                      📎 Lihat File
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(materi)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(materi.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </DashboardLayout>
  );
}
