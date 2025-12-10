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
import { ArrowLeft, Plus, Pencil, Trash2, Database } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function TestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const testId = params.id as string;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);
    const [showBankSoal, setShowBankSoal] = useState(false);
    const [selectedBankQuestions, setSelectedBankQuestions] = useState<string[]>([]);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch test details
    const { data: test, isLoading } = useQuery({
        queryKey: ['test', testId],
        queryFn: () => api.getTestById(testId),
    });

    // Fetch question bank for adding
    const { data: bankQuestions } = useQuery({
        queryKey: ['question-bank-for-test'],
        queryFn: () => api.getQuestionBank({ limit: 100, myQuestions: 'true' }),
        enabled: showBankSoal,
    });

    // Add question mutation
    const addQuestionMutation = useMutation({
        mutationFn: (data: any) => api.addQuestionToTest(testId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test', testId] });
            toast({ title: 'Soal berhasil ditambahkan' });
            setIsFormOpen(false);
            setEditingQuestion(null);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Update question mutation
    const updateQuestionMutation = useMutation({
        mutationFn: ({ questionId, data }: { questionId: string; data: any }) =>
            api.updateTestQuestion(testId, questionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test', testId] });
            toast({ title: 'Soal berhasil diupdate' });
            setIsFormOpen(false);
            setEditingQuestion(null);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Delete question mutation
    const deleteQuestionMutation = useMutation({
        mutationFn: (questionId: string) => api.deleteTestQuestion(testId, questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test', testId] });
            toast({ title: 'Soal berhasil dihapus' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Bulk add from bank
    const bulkAddMutation = useMutation({
        mutationFn: (questionIds: string[]) => api.bulkAddToTest({ questionIds, testId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test', testId] });
            toast({ title: 'Soal berhasil ditambahkan dari bank' });
            setShowBankSoal(false);
            setSelectedBankQuestions([]);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const questionType = formData.get('questionType') as string;
        let options = null;

        if (questionType === 'MULTIPLE_CHOICE') {
            options = [
                { optionText: formData.get('option1'), isCorrect: formData.get('correctOption') === '0' },
                { optionText: formData.get('option2'), isCorrect: formData.get('correctOption') === '1' },
                { optionText: formData.get('option3'), isCorrect: formData.get('correctOption') === '2' },
                { optionText: formData.get('option4'), isCorrect: formData.get('correctOption') === '3' },
                { optionText: formData.get('option5'), isCorrect: formData.get('correctOption') === '4' },
            ].filter(opt => opt.optionText);
        }

        const data = {
            questionText: formData.get('questionText'),
            questionType,
            expectedAnswer: formData.get('expectedAnswer') || null,
            points: parseInt(formData.get('points') as string),
            options,
        };

        if (editingQuestion) {
            updateQuestionMutation.mutate({ questionId: editingQuestion.id, data });
        } else {
            addQuestionMutation.mutate(data);
        }
    };

    const handleBulkAdd = () => {
        if (selectedBankQuestions.length > 0) {
            bulkAddMutation.mutate(selectedBankQuestions);
        }
    };

    if (isLoading) {
        return <div className="container mx-auto p-6">Loading...</div>;
    }

    if (!test) {
        return <div className="container mx-auto p-6">Ujian tidak ditemukan</div>;
    }

    const typeLabels = {
        MULTIPLE_CHOICE: 'Pilihan Ganda',
        ESSAY: 'Essay',
        TRUE_FALSE: 'Benar/Salah',
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin/cbt/ujian">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">{test.title}</h1>
            </div>

            {/* Test Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Ujian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Durasi</p>
                            <p className="font-medium">{test.duration} menit</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Nilai Lulus</p>
                            <p className="font-medium">{test.passingScore}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Soal</p>
                            <p className="font-medium">{test.questions?.length || 0} soal</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={test.isActive ? 'default' : 'secondary'}>
                                {test.isActive ? 'Aktif' : 'Draft'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
                <Button onClick={() => { setEditingQuestion(null); setIsFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Soal Baru
                </Button>
                <Button variant="outline" onClick={() => setShowBankSoal(!showBankSoal)}>
                    <Database className="w-4 h-4 mr-2" />
                    Tambah dari Bank Soal
                </Button>
            </div>

            {/* Bank Soal Selection */}
            {showBankSoal && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Pilih dari Bank Soal</CardTitle>
                            <Button
                                onClick={handleBulkAdd}
                                disabled={selectedBankQuestions.length === 0 || bulkAddMutation.isPending}
                            >
                                Tambahkan {selectedBankQuestions.length} Soal
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input type="checkbox" className="w-4 h-4" />
                                    </TableHead>
                                    <TableHead>Soal</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Poin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bankQuestions?.data?.map((q: any) => (
                                    <TableRow key={q.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedBankQuestions.includes(q.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedBankQuestions([...selectedBankQuestions, q.id]);
                                                    } else {
                                                        setSelectedBankQuestions(selectedBankQuestions.filter(id => id !== q.id));
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">{q.questionText}</TableCell>
                                        <TableCell>{typeLabels[q.questionType as keyof typeof typeLabels]}</TableCell>
                                        <TableCell>{q.points}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Question Form */}
            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="questionType">Tipe Soal</Label>
                                    <select
                                        id="questionType"
                                        name="questionType"
                                        defaultValue={editingQuestion?.questionType || 'MULTIPLE_CHOICE'}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                        required
                                    >
                                        <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                                        <option value="ESSAY">Essay</option>
                                        <option value="TRUE_FALSE">Benar/Salah</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="points">Poin</Label>
                                    <Input
                                        id="points"
                                        name="points"
                                        type="number"
                                        min="1"
                                        defaultValue={editingQuestion?.points || '10'}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="questionText">Teks Soal</Label>
                                <textarea
                                    id="questionText"
                                    name="questionText"
                                    defaultValue={editingQuestion?.questionText}
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Pilihan Jawaban (untuk Pilihan Ganda)</Label>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <div key={num} className="flex gap-2">
                                        <Input
                                            name={`option${num}`}
                                            placeholder={`Pilihan ${num}`}
                                            defaultValue={editingQuestion?.options?.[num - 1]?.optionText}
                                        />
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            value={num - 1}
                                            defaultChecked={editingQuestion?.options?.[num - 1]?.isCorrect}
                                            className="w-5"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expectedAnswer">Jawaban yang Diharapkan (untuk Essay)</Label>
                                <textarea
                                    id="expectedAnswer"
                                    name="expectedAnswer"
                                    defaultValue={editingQuestion?.expectedAnswer}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={addQuestionMutation.isPending || updateQuestionMutation.isPending}>
                                    {editingQuestion ? 'Update' : 'Tambah'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingQuestion(null); }}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Questions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Soal ({test.questions?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Soal</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Poin</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {test.questions && test.questions.length > 0 ? (
                                test.questions.map((question: any, index: number) => (
                                    <TableRow key={question.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="max-w-md">
                                            <div className="truncate">{question.questionText}</div>
                                        </TableCell>
                                        <TableCell>{typeLabels[question.questionType as keyof typeof typeLabels]}</TableCell>
                                        <TableCell>{question.points}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-1 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingQuestion(question);
                                                        setIsFormOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm('Hapus soal ini?')) {
                                                            deleteQuestionMutation.mutate(question.id);
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
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Belum ada soal. Tambahkan soal untuk ujian ini.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
