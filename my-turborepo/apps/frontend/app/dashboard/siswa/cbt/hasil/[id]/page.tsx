'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Award, AlertTriangle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResultPage() {
    const params = useParams();
    const router = useRouter();
    const attemptId = params.id as string;

    const { data: result, isLoading } = useQuery({
        queryKey: ['attempt-result', attemptId],
        queryFn: () => api.getAttemptResult(attemptId),
    });

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
                <p>Memuat hasil...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
                <Card>
                    <CardContent className="pt-6">
                        <p>Hasil tidak ditemukan</p>
                        <Link href="/dashboard/siswa/cbt">
                            <Button className="mt-4">Kembali</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalQuestions = result.test?.questions?.length || 0;
    const answeredQuestions = result.answers?.length || 0;
    const correctAnswers = result.answers?.filter((a: any) => a.isCorrect).length || 0;
    const duration = result.test?.duration || 0;
    const timeSpent = result.finishedAt && result.createdAt
        ? Math.floor((new Date(result.finishedAt).getTime() - new Date(result.createdAt).getTime()) / 1000 / 60)
        : 0;

    const typeLabels = {
        MULTIPLE_CHOICE: 'Pilihan Ganda',
        ESSAY: 'Essay',
        TRUE_FALSE: 'Benar/Salah',
    };

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-4xl">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">{result.test?.title}</h1>
                <div className="flex items-center justify-center gap-4">
                    {result.isPassed ? (
                        <Badge className="bg-green-500 text-lg px-4 py-2">
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            LULUS
                        </Badge>
                    ) : (
                        <Badge className="bg-red-500 text-lg px-4 py-2">
                            <XCircle className="w-5 h-5 mr-2" />
                            TIDAK LULUS
                        </Badge>
                    )}
                </div>
            </div>

            {/* Score Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Nilai Anda</p>
                        <p className="text-6xl font-bold text-blue-600">{result.score?.toFixed(0) || 0}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Nilai Lulus: {result.test?.passingScore}%
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Award className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{correctAnswers}/{totalQuestions}</p>
                        <p className="text-sm text-muted-foreground">Benar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <XCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{answeredQuestions - correctAnswers}</p>
                        <p className="text-sm text-muted-foreground">Salah</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{timeSpent}/{duration}</p>
                        <p className="text-sm text-muted-foreground">Menit</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{result.cheatCount || 0}</p>
                        <p className="text-sm text-muted-foreground">Pelanggaran</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Answers */}
            <Card>
                <CardHeader>
                    <CardTitle>Pembahasan Soal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {result.test?.questions?.map((question: any, index: number) => {
                        const userAnswer = result.answers?.find((a: any) => a.questionId === question.id);
                        const isCorrect = userAnswer?.isCorrect || false;

                        return (
                            <div key={question.id} className="border-b pb-6 last:border-0">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold">Soal {index + 1}</span>
                                            <Badge variant="outline">{typeLabels[question.questionType as keyof typeof typeLabels]}</Badge>
                                            <Badge variant="secondary">{question.points} poin</Badge>
                                        </div>
                                        <p className="text-gray-700 mb-3">{question.questionText}</p>

                                        {question.questionType === 'MULTIPLE_CHOICE' && (
                                            <div className="space-y-2">
                                                {question.options?.map((option: any) => {
                                                    const isUserAnswer = userAnswer?.answerText === option.id;
                                                    const isCorrectOption = option.isCorrect;

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className={`p-3 rounded-lg border ${isCorrectOption
                                                                    ? 'bg-green-50 border-green-300'
                                                                    : isUserAnswer
                                                                        ? 'bg-red-50 border-red-300'
                                                                        : 'bg-gray-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isCorrectOption && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                                                {isUserAnswer && !isCorrectOption && <XCircle className="w-4 h-4 text-red-600" />}
                                                                <span>{option.optionText}</span>
                                                                {isCorrectOption && <Badge className="ml-auto bg-green-600">Jawaban Benar</Badge>}
                                                                {isUserAnswer && !isCorrectOption && <Badge className="ml-auto bg-red-600">Jawaban Anda</Badge>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {question.questionType === 'ESSAY' && (
                                            <div className="space-y-2">
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-blue-900 mb-1">Jawaban Anda:</p>
                                                    <p className="text-gray-700">{userAnswer?.answerText || '-'}</p>
                                                </div>
                                                {question.expectedAnswer && (
                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <p className="text-sm font-medium text-green-900 mb-1">Jawaban yang Diharapkan:</p>
                                                        <p className="text-gray-700">{question.expectedAnswer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {userAnswer && (
                                            <div className="mt-3">
                                                <p className="text-sm">
                                                    <span className="font-medium">Poin didapat:</span> {userAnswer.pointsEarned}/{question.points}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center gap-4">
                <Link href="/dashboard/siswa/cbt">
                    <Button>Kembali ke Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
