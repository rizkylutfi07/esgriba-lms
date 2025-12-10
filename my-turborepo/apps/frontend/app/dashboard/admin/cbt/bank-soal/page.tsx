'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, Copy, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function BankSoalPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [filterSubject, setFilterSubject] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [filterType, setFilterType] = useState('');

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch questions
    const { data: questionsData, isLoading } = useQuery({
        queryKey: ['question-bank', currentPage, searchQuery, filterSubject, filterDifficulty, filterType],
        queryFn: () => api.getQuestionBank({
            page: currentPage,
            limit: 10,
            search: searchQuery,
            subjectId: filterSubject || undefined,
            difficultyLevel: filterDifficulty || undefined,
            questionType: filterType || undefined,
            // myQuestions: 'true', // Temporarily disabled to show all questions
        }),
    });

    // Fetch subjects for filter
    const { data: subjects } = useQuery({
        queryKey: ['mapel'],
        queryFn: () => api.getMapel(),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => api.createQuestionBank(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-bank'] });
            toast({ title: 'Soal berhasil ditambahkan' });
            setIsFormOpen(false);
            setEditingQuestion(null);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateQuestionBank(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-bank'] });
            toast({ title: 'Soal berhasil diupdate' });
            setIsFormOpen(false);
            setEditingQuestion(null);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteQuestionBank(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-bank'] });
            toast({ title: 'Soal berhasil dihapus' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Duplicate mutation
    const duplicateMutation = useMutation({
        mutationFn: (id: string) => api.duplicateQuestionBank(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-bank'] });
            toast({ title: 'Soal berhasil diduplikasi' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const questionType = formData.get('questionType') as string;

        // Debug: Log form data
        console.log('Form Data:', {
            questionType,
            questionText: formData.get('questionText'),
            category: formData.get('category'),
            difficultyLevel: formData.get('difficultyLevel'),
            points: formData.get('points'),
        });

        // Validate questionType
        if (!questionType || questionType === 'undefined' || questionType === '') {
            toast({
                title: 'Error',
                description: 'Tipe Soal harus dipilih!',
                variant: 'destructive'
            });
            return;
        }

        let options = null;
        let correctAnswer = null;

        if (questionType === 'MULTIPLE_CHOICE') {
            options = [
                formData.get('option1'),
                formData.get('option2'),
                formData.get('option3'),
                formData.get('option4'),
                formData.get('option5'),
            ].filter(Boolean);

            const correctIndex = parseInt(formData.get('correctOption') as string);
            correctAnswer = [options[correctIndex]];
        }

        const data = {
            subjectId: formData.get('subjectId') || null,
            category: formData.get('category'),
            questionText: formData.get('questionText'),
            questionType,
            expectedAnswer: formData.get('expectedAnswer') || null,
            difficultyLevel: parseInt(formData.get('difficultyLevel') as string),
            points: parseInt(formData.get('points') as string),
            explanation: formData.get('explanation') || null,
            options,
            correctAnswer,
        };

        console.log('Sending data:', data);

        if (editingQuestion) {
            updateMutation.mutate({ id: editingQuestion.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleSelectQuestion = (id: string) => {
        setSelectedQuestions(prev =>
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedQuestions.length === questionsData?.data?.length) {
            setSelectedQuestions([]);
        } else {
            setSelectedQuestions(questionsData?.data?.map((q: any) => q.id) || []);
        }
    };

    const difficultyLabels = ['', 'Mudah', 'Sedang', 'Sulit'];
    const typeLabels = {
        MULTIPLE_CHOICE: 'Pilihan Ganda',
        ESSAY: 'Essay',
        TRUE_FALSE: 'Benar/Salah',
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Bank Soal</h1>
                <Button onClick={() => { setEditingQuestion(null); setIsFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Soal
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label>Cari Soal</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Cari teks soal..."
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
                        <div>
                            <Label>Tingkat Kesulitan</Label>
                            <select
                                value={filterDifficulty}
                                onChange={(e) => {
                                    setFilterDifficulty(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            >
                                <option value="">Semua Tingkat</option>
                                <option value="1">Mudah</option>
                                <option value="2">Sedang</option>
                                <option value="3">Sulit</option>
                            </select>
                        </div>
                        <div>
                            <Label>Tipe Soal</Label>
                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                                <option value="ESSAY">Essay</option>
                                <option value="TRUE_FALSE">Benar/Salah</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Actions */}
            {selectedQuestions.length > 0 && (
                <Card className="bg-blue-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {selectedQuestions.length} soal dipilih
                            </span>
                            <Button variant="outline" size="sm">
                                Tambahkan ke Ujian
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subjectId">Mata Pelajaran</Label>
                                    <select
                                        id="subjectId"
                                        name="subjectId"
                                        defaultValue={editingQuestion?.subjectId || ''}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    >
                                        <option value="">Pilih Mapel</option>
                                        {subjects?.map((subject: any) => (
                                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Input id="category" name="category" defaultValue={editingQuestion?.category} placeholder="Misal: Trigonometri" />
                                </div>
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
                                    <Label htmlFor="difficultyLevel">Tingkat Kesulitan</Label>
                                    <select
                                        id="difficultyLevel"
                                        name="difficultyLevel"
                                        defaultValue={editingQuestion?.difficultyLevel || '2'}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                        required
                                    >
                                        <option value="1">Mudah</option>
                                        <option value="2">Sedang</option>
                                        <option value="3">Sulit</option>
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

                            {/* Options for Multiple Choice */}
                            <div id="options-section" className="space-y-2">
                                <Label>Pilihan Jawaban (untuk Pilihan Ganda)</Label>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <div key={num} className="flex gap-2">
                                        <Input
                                            name={`option${num}`}
                                            placeholder={`Pilihan ${num}`}
                                            defaultValue={editingQuestion?.options?.[num - 1]}
                                        />
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            value={num - 1}
                                            defaultChecked={editingQuestion?.correctAnswer?.[0] === editingQuestion?.options?.[num - 1]}
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

                            <div className="space-y-2">
                                <Label htmlFor="explanation">Penjelasan/Pembahasan</Label>
                                <textarea
                                    id="explanation"
                                    name="explanation"
                                    defaultValue={editingQuestion?.explanation}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    placeholder="Penjelasan jawaban yang benar"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingQuestion ? 'Update' : 'Simpan'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingQuestion(null); }}>
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
                                        <TableHead className="w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions.length === questionsData?.data?.length && questionsData?.data?.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4"
                                            />
                                        </TableHead>
                                        <TableHead>Soal</TableHead>
                                        <TableHead>Mapel</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead>Kesulitan</TableHead>
                                        <TableHead>Poin</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questionsData?.data?.length > 0 ? (
                                        questionsData.data.map((question: any) => (
                                            <TableRow key={question.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedQuestions.includes(question.id)}
                                                        onChange={() => handleSelectQuestion(question.id)}
                                                        className="w-4 h-4"
                                                    />
                                                </TableCell>
                                                <TableCell className="max-w-md">
                                                    <div className="truncate">{question.questionText}</div>
                                                </TableCell>
                                                <TableCell>{question.subject?.name || '-'}</TableCell>
                                                <TableCell>{question.category || '-'}</TableCell>
                                                <TableCell>{typeLabels[question.questionType as keyof typeof typeLabels]}</TableCell>
                                                <TableCell>{difficultyLabels[question.difficultyLevel]}</TableCell>
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
                                                            onClick={() => duplicateMutation.mutate(question.id)}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm('Hapus soal ini?')) {
                                                                    deleteMutation.mutate(question.id);
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
                                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                Tidak ada soal
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {questionsData?.total > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, questionsData.total)} dari {questionsData.total} soal
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
                                            Halaman {currentPage} dari {questionsData.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(questionsData.totalPages, p + 1))}
                                            disabled={currentPage === questionsData.totalPages}
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
