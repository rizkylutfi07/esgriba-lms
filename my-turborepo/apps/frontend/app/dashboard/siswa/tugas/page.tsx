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

export default function TugasSiswaPage() {
  const [selectedTugas, setSelectedTugas] = useState<any>(null);
  const [submitForm, setSubmitForm] = useState({ content: '', fileUrl: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siswaData } = useQuery({
    queryKey: ['current-siswa'],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return api.getSiswa({ userId: user.id });
    },
  });

  const { data: tugasList } = useQuery({
    queryKey: ['tugas-siswa', siswaData?.classId],
    queryFn: () => api.getTugas({ classId: siswaData?.classId }),
    enabled: !!siswaData?.classId,
  });

  const { data: mySubmissions } = useQuery({
    queryKey: ['my-submissions', siswaData?.id],
    queryFn: () => api.getPengumpulanTugas({ siswaId: siswaData?.id }),
    enabled: !!siswaData?.id,
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.createPengumpulanTugas(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      setSelectedTugas(null);
      setSubmitForm({ content: '', fileUrl: '' });
      toast({ title: 'Tugas berhasil dikumpulkan' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Gagal mengumpulkan tugas' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaData?.id) return;

    const isLate = new Date() > new Date(selectedTugas.dueDate);
    
    submitMutation.mutate({
      tugasId: selectedTugas.id,
      siswaId: siswaData.id,
      ...submitForm,
      status: isLate ? 'LATE' : 'SUBMITTED',
    });
  };

  const getSubmissionForTugas = (tugasId: string) => {
    return mySubmissions?.find((s: any) => s.tugasId === tugasId);
  };

  return (
    <DashboardLayout>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tugas</h1>

      {/* Debug Info */}
      {siswaData && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
          <p><strong>Siswa:</strong> {siswaData.name}</p>
          <p><strong>Kelas ID:</strong> {siswaData.classId || 'Tidak ada'}</p>
          <p><strong>Kelas:</strong> {siswaData.class?.name || 'Tidak ada'}</p>
        </div>
      )}

      {tugasList && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-sm">
          <p><strong>Total Tugas:</strong> {tugasList.length}</p>
          <p><strong>Tugas Published:</strong> {tugasList.filter((t: any) => t.status === 'PUBLISHED').length}</p>
        </div>
      )}

      {!siswaData && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p>Loading data siswa...</p>
        </div>
      )}

      {tugasList?.filter((t: any) => t.status === 'PUBLISHED').length > 0 ? (
        <div className="grid gap-4">{tugasList
            .filter((t: any) => t.status === 'PUBLISHED')
            .map((tugas: any) => {
              const submission = getSubmissionForTugas(tugas.id);
              const isOverdue = new Date() > new Date(tugas.dueDate);

              return (
                <Card key={tugas.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{tugas.title}</h3>
                        <p className="text-gray-600 mb-2">{tugas.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>Mata Pelajaran: {tugas.subject?.name}</div>
                          <div>Batas Waktu: {new Date(tugas.dueDate).toLocaleString('id-ID')}</div>
                          <div>Nilai Maksimal: {tugas.maxScore}</div>
                          {isOverdue && !submission && (
                            <div className="text-red-600 font-semibold">⚠️ Terlambat</div>
                          )}
                        </div>
                      </div>
                      <div>
                        {submission ? (
                          <div className="text-right">
                            <span className={`px-3 py-1 text-sm rounded ${
                              submission.status === 'GRADED'
                                ? 'bg-green-100 text-green-800'
                                : submission.status === 'LATE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {submission.status === 'GRADED'
                                ? `Dinilai: ${submission.score}/${tugas.maxScore}`
                                : submission.status === 'LATE'
                                ? 'Terlambat'
                                : 'Sudah Dikumpulkan'}
                            </span>
                            {submission.feedback && (
                              <p className="text-sm text-gray-600 mt-2">
                                Catatan: {submission.feedback}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Button onClick={() => setSelectedTugas(tugas)}>
                            Kumpulkan
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            {siswaData ? (
              tugasList ? (
                <p>Belum ada tugas yang dipublikasikan</p>
              ) : (
                <p>Loading tugas...</p>
              )
            ) : (
              <p>Loading data siswa...</p>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTugas && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedTugas(null)}
        >
          <Card className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Kumpulkan Tugas: {selectedTugas.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Konten Jawaban</Label>
                  <textarea
                    className="w-full min-h-[150px] p-2 border rounded"
                    value={submitForm.content}
                    onChange={(e) =>
                      setSubmitForm({ ...submitForm, content: e.target.value })
                    }
                    placeholder="Tulis jawaban Anda di sini..."
                  />
                </div>
                <div>
                  <Label>Link File (opsional)</Label>
                  <Input
                    value={submitForm.fileUrl}
                    onChange={(e) =>
                      setSubmitForm({ ...submitForm, fileUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Kumpulkan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedTugas(null)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
