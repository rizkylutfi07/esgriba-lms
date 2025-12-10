'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Award, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function StudentCbtPage() {
    // Fetch available tests
    const { data: testsData, isLoading } = useQuery({
        queryKey: ['available-tests'],
        queryFn: () => api.getTests({ status: 'active', limit: 50 }),
    });

    // Fetch my attempts
    const { data: attemptsData } = useQuery({
        queryKey: ['my-attempts'],
        queryFn: () => api.getMyAttempts({ limit: 10 }),
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (attempt: any) => {
        if (attempt.status === 'COMPLETED') {
            return (
                <Badge className={attempt.isPassed ? 'bg-green-500' : 'bg-red-500'}>
                    {attempt.isPassed ? 'Lulus' : 'Tidak Lulus'}
                </Badge>
            );
        }
        if (attempt.status === 'IN_PROGRESS') {
            return <Badge className="bg-blue-500">Sedang Berlangsung</Badge>;
        }
        if (attempt.status === 'BLOCKED') {
            return <Badge variant="destructive">Diblokir</Badge>;
        }
        return <Badge variant="secondary">{attempt.status}</Badge>;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Ujian CBT</h1>
                <p className="text-muted-foreground">Daftar ujian yang tersedia dan riwayat ujian Anda</p>
            </div>

            {/* Available Tests */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Ujian Tersedia</h2>
                {isLoading ? (
                    <p>Loading...</p>
                ) : testsData?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testsData.data.map((test: any) => (
                            <Card key={test.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-lg">{test.title}</CardTitle>
                                    {test.description && (
                                        <p className="text-sm text-muted-foreground">{test.description}</p>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            <span>{test.totalQuestions || 0} Soal</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span>{test.duration} Menit</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-muted-foreground" />
                                            <span>Nilai Lulus: {test.passingScore}%</span>
                                        </div>
                                        {test.startTime && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xs">{formatDate(test.startTime)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link href={`/dashboard/siswa/cbt/ujian/${test.id}`} className="block">
                                        <Button className="w-full">Mulai Ujian</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            Tidak ada ujian yang tersedia saat ini
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Past Attempts */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Riwayat Ujian</h2>
                {attemptsData?.data?.length > 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                {attemptsData.data.map((attempt: any) => (
                                    <div
                                        key={attempt.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-medium">{attempt.test?.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(attempt.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {attempt.status === 'COMPLETED' && (
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold">{attempt.score?.toFixed(0) || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Nilai</p>
                                                </div>
                                            )}
                                            {getStatusBadge(attempt)}
                                            {attempt.status === 'COMPLETED' && (
                                                <Link href={`/dashboard/siswa/cbt/hasil/${attempt.id}`}>
                                                    <Button variant="outline" size="sm">Lihat Detail</Button>
                                                </Link>
                                            )}
                                            {attempt.status === 'IN_PROGRESS' && (
                                                <Link href={`/dashboard/siswa/cbt/ujian/${attempt.test.id}`}>
                                                    <Button size="sm">Lanjutkan</Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            Belum ada riwayat ujian
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
