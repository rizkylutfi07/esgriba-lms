'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function TakeTestPage() {
    const params = useParams();
    const router = useRouter();
    const testId = params.id as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [cheatCount, setCheatCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);

    // Fetch or start test attempt
    const { data: attempt, isLoading } = useQuery({
        queryKey: ['attempt', attemptId],
        queryFn: () => attemptId ? api.getAttempt(attemptId) : null,
        enabled: !!attemptId,
    });

    // Start test mutation
    const startTestMutation = useMutation({
        mutationFn: () => api.startTest(testId),
        onSuccess: (data) => {
            setAttemptId(data.id);
            setTimeLeft(data.test.duration * 60); // Convert to seconds
            toast({ title: 'Ujian dimulai', description: 'Selamat mengerjakan!' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
            router.push('/dashboard/siswa/cbt');
        },
    });

    // Submit answer mutation
    const submitAnswerMutation = useMutation({
        mutationFn: ({ questionId, answerText }: { questionId: string; answerText: string }) =>
            api.submitAnswer(attemptId!, { questionId, answerText }),
        onSuccess: () => {
            // Silent success, auto-save
        },
    });

    // Finish test mutation
    const finishTestMutation = useMutation({
        mutationFn: () => api.finishTest(attemptId!),
        onSuccess: (data) => {
            toast({
                title: 'Ujian selesai!',
                description: `Nilai Anda: ${data.score?.toFixed(0)}`
            });
            router.push(`/dashboard/siswa/cbt/hasil/${attemptId}`);
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Record cheat event mutation
    const recordCheatMutation = useMutation({
        mutationFn: (data: { eventType: string; description: string }) =>
            api.recordCheatEvent(attemptId!, data),
        onSuccess: (data) => {
            setCheatCount(data.cheatCount);
            if (data.cheatCount >= 3) {
                toast({
                    title: 'Anda telah diblokir',
                    description: 'Terlalu banyak pelanggaran terdeteksi',
                    variant: 'destructive',
                });
                router.push('/dashboard/siswa/cbt');
            } else {
                setShowWarning(true);
                setTimeout(() => setShowWarning(false), 5000);
            }
        },
    });

    // Start test on mount
    useEffect(() => {
        if (!attemptId) {
            startTestMutation.mutate();
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (!attemptId || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleFinishTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [attemptId, timeLeft]);

    // Cheat detection - Tab visibility
    useEffect(() => {
        if (!attemptId) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                recordCheatMutation.mutate({
                    eventType: 'tab_hidden',
                    description: 'Tab ujian tidak aktif / berpindah tab',
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [attemptId]);

    // Cheat detection - Window blur
    useEffect(() => {
        if (!attemptId) return;

        const handleWindowBlur = () => {
            recordCheatMutation.mutate({
                eventType: 'window_blur',
                description: 'Jendela ujian kehilangan fokus',
            });
        };

        window.addEventListener('blur', handleWindowBlur);
        return () => window.removeEventListener('blur', handleWindowBlur);
    }, [attemptId]);

    // Prevent right click and copy
    useEffect(() => {
        const preventContextMenu = (e: MouseEvent) => e.preventDefault();
        const preventCopy = (e: ClipboardEvent) => e.preventDefault();

        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('copy', preventCopy);

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('copy', preventCopy);
        };
    }, []);

    const handleAnswerChange = useCallback((questionId: string, answerText: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answerText }));

        // Auto-save answer
        if (attemptId) {
            submitAnswerMutation.mutate({ questionId, answerText });
        }
    }, [attemptId]);

    const handleFinishTest = () => {
        if (attemptId && !finishTestMutation.isPending) {
            finishTestMutation.mutate();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading || !attempt) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
                <Card>
                    <CardContent className="pt-6">
                        <p>Memuat ujian...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (attempt.status === 'BLOCKED') {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Ujian Diblokir</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Anda telah diblokir dari ujian ini karena terlalu banyak pelanggaran.</p>
                        <p className="text-sm text-muted-foreground mt-2">Alasan: {attempt.blockedReason}</p>
                        <Button onClick={() => router.push('/dashboard/siswa/cbt')} className="mt-4">
                            Kembali
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const questions = attempt.test?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
                <Card>
                    <CardContent className="pt-6">
                        <p>Tidak ada soal dalam ujian ini.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isTimeWarning = timeLeft <= 300; // 5 minutes

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Warning Banner */}
            {showWarning && (
                <div className="bg-red-600 text-white p-4 text-center">
                    <AlertTriangle className="inline w-5 h-5 mr-2" />
                    Peringatan! Aktivitas mencurigakan terdeteksi. Pelanggaran: {cheatCount}/3
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">{attempt.test?.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                Soal {currentQuestionIndex + 1} dari {questions.length}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 ${isTimeWarning ? 'text-red-600' : ''}`}>
                                <Clock className="w-5 h-5" />
                                <span className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</span>
                            </div>
                            <Button onClick={handleFinishTest} variant="destructive">
                                Selesai
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-4xl">
                {/* Question Navigation */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2">
                            {questions.map((q: any, index: number) => {
                                const isAnswered = answers[q.id] || attempt.answers?.some((a: any) => a.questionId === q.id);
                                return (
                                    <Button
                                        key={q.id}
                                        variant={currentQuestionIndex === index ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className="w-12 h-12"
                                    >
                                        {isAnswered && <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-green-500" />}
                                        {index + 1}
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Question */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>Soal {currentQuestionIndex + 1}</CardTitle>
                            <Badge>{currentQuestion.points} Poin</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose max-w-none">
                            <p className="text-lg whitespace-pre-wrap">{currentQuestion.questionText}</p>
                        </div>

                        {/* Answer Input */}
                        {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
                            <div className="space-y-3">
                                {currentQuestion.options?.map((option: any, index: number) => (
                                    <label
                                        key={option.id}
                                        className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion.id}`}
                                            value={option.id}
                                            checked={answers[currentQuestion.id] === option.id}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                            className="mt-1 w-4 h-4"
                                        />
                                        <span className="flex-1">{option.optionText}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {currentQuestion.questionType === 'ESSAY' && (
                            <textarea
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                className="w-full min-h-[200px] p-4 border rounded-lg"
                                placeholder="Tulis jawaban Anda di sini..."
                            />
                        )}

                        {currentQuestion.questionType === 'TRUE_FALSE' && (
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value="true"
                                        checked={answers[currentQuestion.id] === 'true'}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span>Benar</span>
                                </label>
                                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value="false"
                                        checked={answers[currentQuestion.id] === 'false'}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span>Salah</span>
                                </label>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
