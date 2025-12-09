'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';


export default function TugasGuruPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedTugas, setSelectedTugas] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100,
    status: 'DRAFT',
    classId: '',
    subjectId: '',
    teacherId: '',
  });

  const { data: tugasList } = useQuery({
    queryKey: ['tugas'],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const guru = await api.getGuru({ userId: user.id });
      if (!guru) return [];
      return api.getTugas({ teacherId: guru.id });
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
    mutationFn: (data: any) => api.createTugas(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tugas'] });
      setShowForm(false);
      resetForm();
      toast({ title: 'Tugas berhasil ditambahkan' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateTugas(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tugas'] });
      setShowForm(false);
      setEditId(null);
      resetForm();
      toast({ title: 'Tugas berhasil diupdate' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTugas(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tugas'] });
      toast({ title: 'Tugas berhasil dihapus' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      maxScore: 100,
      status: 'DRAFT',
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

  const handleEdit = (tugas: any) => {
    setFormData({
      title: tugas.title,
      description: tugas.description || '',
      dueDate: new Date(tugas.dueDate).toISOString().split('T')[0],
      maxScore: tugas.maxScore,
      status: tugas.status,
      classId: tugas.classId,
      subjectId: tugas.subjectId,
      teacherId: tugas.teacherId,
    });
    setEditId(tugas.id);
    setShowForm(true);
  };

  return (

    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tugas</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '+ Tambah Tugas'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editId ? 'Edit Tugas' : 'Tambah Tugas Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Judul Tugas</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Deskripsi</Label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Batas Waktu</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Nilai Maksimal</Label>
                  <Input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
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
        {tugasList?.map((tugas: any) => (
          <Card key={tugas.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{tugas.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${tugas.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {tugas.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tugas.description}</p>
                  <div className="text-sm text-gray-500 mb-2">
                    <span>Kelas: {tugas.class?.name} | </span>
                    <span>Mapel: {tugas.subject?.name} | </span>
                    <span>Batas: {new Date(tugas.dueDate).toLocaleDateString('id-ID')} | </span>
                    <span>Nilai Max: {tugas.maxScore}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">
                      {tugas.pengumpulan?.length || 0} pengumpulan
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedTugas(tugas)}>
                    Lihat
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(tugas)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(tugas.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTugas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedTugas(null)}>
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Pengumpulan Tugas: {selectedTugas.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTugas.pengumpulan?.length > 0 ? (
                <div className="space-y-3">
                  {selectedTugas.pengumpulan.map((p: any) => (
                    <div key={p.id} className="p-4 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{p.siswa?.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(p.submittedAt).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${p.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                          p.status === 'LATE' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {p.status}
                        </span>
                      </div>
                      {p.content && <p className="text-sm mb-2">{p.content}</p>}
                      {p.fileUrl && (
                        <a href={p.fileUrl} target="_blank" className="text-blue-600 text-sm">
                          📎 Lihat File
                        </a>
                      )}
                      {p.score !== null && (
                        <p className="text-sm font-semibold mt-2">Nilai: {p.score}/{selectedTugas.maxScore}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">Belum ada pengumpulan</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
