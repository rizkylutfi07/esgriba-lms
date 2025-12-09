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
import { Plus } from 'lucide-react';

export default function TahunAjaranPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tahunAjaranList, isLoading } = useQuery({
    queryKey: ['tahun-ajaran'],
    queryFn: () => api.get('/tahun-ajaran'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tahun-ajaran', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tahun-ajaran'] });
      setIsFormOpen(false);
      toast({ title: 'Tahun ajaran berhasil dibuat' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => api.patch(`/tahun-ajaran/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tahun-ajaran'] });
      toast({ title: 'Status tahun ajaran berhasil diubah' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      yearStart: parseInt(formData.get('yearStart') as string),
      yearEnd: parseInt(formData.get('yearEnd') as string),
      semester: formData.get('semester'),
      isActive: formData.get('isActive') === 'on',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Tahun Ajaran</h1>
            <p className="text-gray-500 mt-1">Kelola periode tahun ajaran</p>
          </div>
          <Button onClick={() => setIsFormOpen(!isFormOpen)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Tahun Ajaran
          </Button>
        </div>

        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>Tambah Tahun Ajaran Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearStart">Tahun Mulai</Label>
                    <Input 
                      id="yearStart" 
                      name="yearStart" 
                      type="number" 
                      placeholder="2024" 
                      min="2020"
                      max="2100"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearEnd">Tahun Selesai</Label>
                    <Input 
                      id="yearEnd" 
                      name="yearEnd" 
                      type="number" 
                      placeholder="2025"
                      min="2020"
                      max="2100"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <select 
                      id="semester" 
                      name="semester"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      required
                    >
                      <option value="GANJIL">Ganjil</option>
                      <option value="GENAP">Genap</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isActive" className="flex items-center gap-2">
                      <input type="checkbox" id="isActive" name="isActive" />
                      <span>Aktifkan Tahun Ajaran Ini</span>
                    </Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Simpan</Button>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
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
                    <TableHead>Tahun Ajaran</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tahunAjaranList?.map((ta: any) => (
                    <TableRow key={ta.id}>
                      <TableCell className="font-medium">
                        {ta.yearStart}/{ta.yearEnd}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ta.semester === 'GANJIL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {ta.semester}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ta.isActive ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            Tidak Aktif
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant={ta.isActive ? 'ghost' : 'default'}
                          size="sm" 
                          onClick={() => toggleActiveMutation.mutate({ id: ta.id, isActive: !ta.isActive })}
                        >
                          {ta.isActive ? 'Nonaktifkan' : 'Aktifkan'}
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
