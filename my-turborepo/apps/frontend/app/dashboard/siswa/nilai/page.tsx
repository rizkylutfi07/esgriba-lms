'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layouts/dashboard-layout';

export default function NilaiSiswaPage() {
  const { data: siswaData } = useQuery({
    queryKey: ['current-siswa'],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return api.getSiswa({ userId: user.id });
    },
  });

  const { data: nilaiList, isLoading } = useQuery({
    queryKey: ['nilai', siswaData?.id],
    queryFn: () => api.getNilai({ siswaId: siswaData?.id }),
    enabled: !!siswaData?.id,
  });

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Nilai Saya</h1>

      {nilaiList?.length > 0 ? (
        <div className="grid gap-4">
          {nilaiList.map((nilai: any) => (
            <Card key={nilai.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{nilai.subject?.name}</span>
                  <span className="text-lg font-normal">
                    {nilai.nilaiAkhir ? nilai.nilaiAkhir.toFixed(2) : '-'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-sm text-gray-600 mb-1">Tugas</div>
                    <div className="text-2xl font-semibold">
                      {nilai.nilaiTugas ?? '-'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-sm text-gray-600 mb-1">UTS</div>
                    <div className="text-2xl font-semibold">
                      {nilai.nilaiUTS ?? '-'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded">
                    <div className="text-sm text-gray-600 mb-1">UAS</div>
                    <div className="text-2xl font-semibold">
                      {nilai.nilaiUAS ?? '-'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <div className="text-sm text-gray-600 mb-1">Nilai Akhir</div>
                    <div className="text-2xl font-semibold">
                      {nilai.nilaiAkhir ? nilai.nilaiAkhir.toFixed(2) : '-'}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <span>{nilai.semester} - </span>
                  <span>Tahun Ajaran: {nilai.tahunAjaran}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Belum ada nilai yang tersedia
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
