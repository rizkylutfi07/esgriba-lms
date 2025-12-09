'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layouts/dashboard-layout';

export default function MateriSiswaPage() {
  const { data: siswaData } = useQuery({
    queryKey: ['current-siswa'],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return api.getSiswa({ userId: user.id });
    },
  });

  const { data: materiList, isLoading } = useQuery({
    queryKey: ['materi-siswa', siswaData?.classId],
    queryFn: () => api.getMateri({ classId: siswaData?.classId }),
    enabled: !!siswaData?.classId,
  });

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Materi Pembelajaran</h1>

      {/* Debug Info */}
      {siswaData && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
          <p><strong>Siswa:</strong> {siswaData.name}</p>
          <p><strong>Kelas ID:</strong> {siswaData.classId || 'Tidak ada'}</p>
          <p><strong>Kelas:</strong> {siswaData.class?.name || 'Tidak ada'}</p>
        </div>
      )}

      {materiList && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-sm">
          <p><strong>Total Materi:</strong> {materiList.length}</p>
        </div>
      )}

      {!siswaData && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p>Loading data siswa...</p>
        </div>
      )}

      {materiList?.length > 0 ? (
        <div className="grid gap-4">
          {materiList.map((materi: any) => (
            <Card key={materi.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{materi.title}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {materi.subject?.name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {materi.description && (
                  <p className="text-gray-600 mb-4">{materi.description}</p>
                )}
                <div className="p-4 bg-gray-50 rounded mb-4">
                  <p className="whitespace-pre-wrap">{materi.content}</p>
                </div>
                {materi.fileUrl && (
                  <a
                    href={materi.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    📎 Download File
                  </a>
                )}
                <div className="mt-4 text-sm text-gray-500">
                  <span>Guru: {materi.teacher?.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(materi.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            {siswaData ? (
              materiList ? (
                <p>Belum ada materi yang tersedia</p>
              ) : (
                <p>Loading materi...</p>
              )
            ) : (
              <p>Loading data siswa...</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
