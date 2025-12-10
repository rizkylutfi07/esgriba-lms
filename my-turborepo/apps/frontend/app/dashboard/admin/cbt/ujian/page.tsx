'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, Copy, Eye, Power, PowerOff, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function UjianPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch tests
    const { data: testsData, isLoading } = useQuery({
        queryKey: ['tests', currentPage, searchQuery, filterStatus, filterSubject],
        queryFn: () => api.getTests({
            page: currentPage,
            limit: 10,
            search: searchQuery,
            status: filterStatus || undefined,
            subjectId: filterSubject || undefined,
            myTests: 'true',
        }),
    });

    // Fetch subjects
    const { data: subjects } = useQuery({
        queryKey: ['mapel'],
        queryFn: () => api.getMapel(),
    });

    // Fetch classes
    const { data: classes } = useQuery({
        queryKey: ['kelas'],
        queryFn: () => api.getKelas(),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => api.createTest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast({ title: 'Ujian berhasil dibuat' });
            setIsFormOpen(false);
            setEditingTest(null);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateTest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast({ title: 'Ujian berhasil diupdate' });
            setIsFormOpen(false);
            setEditingTest(null);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast({ title: 'Ujian berhasil dihapus' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Toggle publish mutation
    const togglePublishMutation = useMutation({
        mutationFn: (id: string) => api.togglePublishTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast({ title: 'Status ujian berhasil diubah' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Duplicate mutation
    const duplicateMutation = useMutation({
        mutationFn: (id: string) => api.duplicateTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast({ title: 'Ujian berhasil diduplikasi' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data = {
            title: formData.get('title'),
            description: formData.get('description') || null,
            duration: parseInt(formData.get('duration') as string),
            passingScore: parseInt(formData.get('passingScore') as string),
            cheatDetectionEnabled: formData.get('cheatDetectionEnabled') === 'on',
            startTime: formData.get('startTime') || null,
            endTime: formData.get('endTime') || null,
            subjectId: formData.get('subjectId') || null,
            classId: formData.get('classId') || null,
            session: formData.get('session') ? parseInt(formData.get('session') as string) : null,
        };

        if (editingTest) {
            updateMutation.mutate({ id: editingTest.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const getStatusBadge = (test: any) => {
        const now = new Date();
        const startTime = test.startTime ? new Date(test.startTime) : null;
        const endTime = test.endTime ? new Date(test.endTime) : null;

        if (!test.isActive) {
            return <Badge variant="secondary">Draft</Badge>;
        }
        if (startTime && now < startTime) {
            return <Badge className="bg-blue-500">Akan Datang</Badge>;
        }
        if (endTime && now > endTime) {
            return <Badge variant="destructive">Selesai</Badge>;
        }
        if (startTime && endTime && now >= startTime && now <= endTime) {
            return <Badge className="bg-green-500">Aktif</Badge>;
        }
        return <Badge className="bg-green-500">Aktif</Badge>;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manajemen Ujian</h1>
                <Button onClick={() => { setEditingTest(null); setIsFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Ujian Baru
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Cari Ujian</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Cari judul ujian..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="upcoming">Akan Datang</option>
                                <option value="finished">Selesai</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                        <div>
                            <Label>Mata Pelajaran</Label>
                            <select
                                value={filterSubject}
                                onChange={(e) => {
                                    setFilterSubject(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            >
                                <option value="">Semua Mapel</option>
                                {subjects?.map((subject: any) => (
                                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Modal */}
            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingTest ? 'Edit Ujian' : 'Buat Ujian Baru'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="title">Judul Ujian *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={editingTest?.title}
                                        placeholder="Misal: Ujian Tengah Semester Matematika"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        defaultValue={editingTest?.description}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                        placeholder="Deskripsi ujian..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subjectId">Mata Pelajaran</Label>
                                    <select
                                        id="subjectId"
                                        name="subjectId"
                                        defaultValue={editingTest?.subjectId || ''}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    >
                                        <option value="">Pilih Mapel</option>
                                        {subjects?.map((subject: any) => (
                                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="classId">Kelas</Label>
                                    <select
                                        id="classId"
                                        name="classId"
                                        defaultValue={editingTest?.classId || ''}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    >
                                        <option value="">Pilih Kelas</option>
                                        {classes?.map((kelas: any) => (
                                            <option key={kelas.id} value={kelas.id}>{kelas.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Durasi (menit) *</Label>
                                    <Input
                                        id="duration"
                                        name="duration"
                                        type="number"
                                        min="1"
                                        defaultValue={editingTest?.duration || '90'}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="passingScore">Nilai Lulus (%) *</Label>
                                    <Input
                                        id="passingScore"
                                        name="passingScore"
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={editingTest?.passingScore || '70'}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="session">Sesi</Label>
                                    <Input
                                        id="session"
                                        name="session"
                                        type="number"
                                        min="1"
                                        defaultValue={editingTest?.session || ''}
                                        placeholder="1, 2, 3, dst"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Waktu Mulai</Label>
                                    <Input
                                        id="startTime"
                                        name="startTime"
                                        type="datetime-local"
                                        defaultValue={editingTest?.startTime ? new Date(editingTest.startTime).toISOString().slice(0, 16) : ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endTime">Waktu Selesai</Label>
                                    <Input
                                        id="endTime"
                                        name="endTime"
                                        type="datetime-local"
                                        defaultValue={editingTest?.endTime ? new Date(editingTest.endTime).toISOString().slice(0, 16) : ''}
                                    />
                                </div>
                                <div className="space-y-2 flex items-center gap-2 md:col-span-2">
                                    <input
                                        id="cheatDetectionEnabled"
                                        name="cheatDetectionEnabled"
                                        type="checkbox"
                                        defaultChecked={editingTest?.cheatDetectionEnabled ?? true}
                                        className="w-4 h-4"
                                    />
                                    <Label htmlFor="cheatDetectionEnabled" className="cursor-pointer">
                                        Aktifkan Deteksi Kecurangan
                                    </Label>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingTest ? 'Update' : 'Buat Ujian'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingTest(null); }}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Judul</TableHead>
                                        <TableHead>Mapel</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Durasi</TableHead>
                                        <TableHead>Soal</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {testsData?.data?.length > 0 ? (
                                        testsData.data.map((test: any) => (
                                            <TableRow key={test.id}>
                                                <TableCell className="font-medium">{test.title}</TableCell>
                                                <TableCell>{test.subject?.name || '-'}</TableCell>
                                                <TableCell>{test.class?.name || '-'}</TableCell>
                                                <TableCell>{test.duration} menit</TableCell>
                                                <TableCell>{test._count?.questions || 0} soal</TableCell>
                                                <TableCell>{getStatusBadge(test)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <Link href={`/dashboard/admin/cbt/ujian/${test.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingTest(test);
                                                                setIsFormOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => togglePublishMutation.mutate(test.id)}
                                                            title={test.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                        >
                                                            {test.isActive ? (
                                                                <PowerOff className="w-4 h-4 text-orange-600" />
                                                            ) : (
                                                                <Power className="w-4 h-4 text-green-600" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => duplicateMutation.mutate(test.id)}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm('Hapus ujian ini?')) {
                                                                    deleteMutation.mutate(test.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                Tidak ada ujian
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {testsData?.total > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, testsData.total)} dari {testsData.total} ujian
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <span className="text-sm">
                                            Halaman {currentPage} dari {testsData.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(testsData.totalPages, p + 1))}
                                            disabled={currentPage === testsData.totalPages}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
