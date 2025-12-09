'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';

export default function JurusanPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jurusanList } = useQuery({
    queryKey: ['jurusan'],
    queryFn: () => api.get('/jurusan'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/jurusan', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurusan'] });
      setIsFormOpen(false);
      toast({ title: 'Jurusan berhasil dibuat' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name'),
      code: formData.get('code'),
    });
  };

  return (

    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Jurusan</h1>
          <p className="text-gray-500 mt-1">Kelola data jurusan</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jurusan
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Jurusan Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Jurusan</Label>
                  <Input id="name" name="name" placeholder="Ilmu Pengetahuan Alam" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Kode</Label>
                  <Input id="code" name="code" placeholder="IPA" required />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Simpan</Button>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jurusanList?.map((jurusan: any) => (
          <Card key={jurusan.id}>
            <CardHeader>
              <CardTitle>{jurusan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Kode: {jurusan.code}</p>
              <p className="text-sm text-gray-500 mt-1">Jumlah Kelas: {jurusan._count?.classes || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
