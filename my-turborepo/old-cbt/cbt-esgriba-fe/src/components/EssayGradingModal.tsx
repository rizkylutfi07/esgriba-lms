import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import apiClient from "../lib/api";
import { useToast } from "../hooks/use-toast";
import MathContent from "./MathContent";

interface EssayAnswer {
  answer_id: number;
  question_id: number;
  question_text: string;
  expected_answer: string | null;
  max_points: number;
  answer_text: string;
  points_earned: number | null;
  is_correct: boolean | null;
}

interface EssayGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
  attemptId: number;
  studentName: string;
  onGradeSubmitted: () => void;
}

export default function EssayGradingModal({
  isOpen,
  onClose,
  testId,
  attemptId,
  studentName,
  onGradeSubmitted,
}: EssayGradingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [essayAnswers, setEssayAnswers] = useState<EssayAnswer[]>([]);
  const [scores, setScores] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (isOpen && attemptId) {
      loadEssayAnswers();
    }
  }, [isOpen, attemptId]);

  const loadEssayAnswers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/tests/${testId}/attempts/${attemptId}/essays`
      );
      const answers = response.data.essay_answers || [];
      setEssayAnswers(answers);

      // Initialize scores with existing values
      const initialScores: { [key: number]: number } = {};
      answers.forEach((answer: EssayAnswer) => {
        initialScores[answer.answer_id] = answer.points_earned || 0;
      });
      setScores(initialScores);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Gagal memuat jawaban essay",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (answerId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setScores((prev) => ({ ...prev, [answerId]: numValue }));
  };

  const handleSubmitGrade = async (answerId: number) => {
    setSubmitting(true);
    try {
      await apiClient.post(
        `/tests/${testId}/attempts/${attemptId}/essays/${answerId}/grade`,
        {
          points_earned: scores[answerId],
        }
      );

      toast({
        title: "Berhasil",
        description: "Nilai berhasil disimpan",
      });

      // Reload answers to get updated data
      await loadEssayAnswers();
      onGradeSubmitted();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan nilai",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    try {
      // Submit all grades one by one
      for (const answer of essayAnswers) {
        await apiClient.post(
          `/tests/${testId}/attempts/${attemptId}/essays/${answer.answer_id}/grade`,
          {
            points_earned: scores[answer.answer_id],
          }
        );
      }

      toast({
        title: "Berhasil",
        description: "Semua nilai berhasil disimpan",
      });

      await loadEssayAnswers();
      onGradeSubmitted();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan nilai",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Penilaian Essay - {studentName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : essayAnswers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada soal essay dalam ujian ini
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {essayAnswers.map((answer, index) => (
                  <div
                    key={answer.answer_id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-base py-1">
                            Soal {index + 1}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700"
                          >
                            Bobot: {answer.max_points} poin
                          </Badge>
                          {answer.points_earned !== null && (
                            <Badge
                              className={
                                answer.points_earned > 0
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-gray-400 hover:bg-gray-500"
                              }
                            >
                              {answer.points_earned > 0 ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              ✓ {answer.points_earned} poin
                            </Badge>
                          )}
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                          <p className="text-xs font-semibold text-gray-600 mb-2">
                            PERTANYAAN:
                          </p>
                          <div className="text-sm text-gray-900">
                            <MathContent content={answer.question_text} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Label className="text-sm text-green-700 font-bold">
                          KUNCI JAWABAN / JAWABAN YANG BENAR:
                        </Label>
                      </div>
                      <div className="text-sm whitespace-pre-wrap text-green-900 leading-relaxed pl-6">
                        {answer.expected_answer ? (
                          <MathContent content={answer.expected_answer} />
                        ) : (
                          <span className="text-gray-500 italic">
                            (Kunci jawaban belum diisi oleh guru saat membuat
                            soal)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            S
                          </span>
                        </div>
                        <Label className="text-sm text-blue-700 font-bold">
                          JAWABAN SISWA:
                        </Label>
                      </div>
                      <div className="text-sm whitespace-pre-wrap text-blue-900 leading-relaxed pl-6">
                        {answer.answer_text || (
                          <span className="text-gray-500 italic">
                            Tidak dijawab
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end gap-3 pt-4 border-t-2 border-gray-200">
                      <div className="flex-1">
                        <Label
                          htmlFor={`score-${answer.answer_id}`}
                          className="text-sm font-bold text-gray-700 mb-2 block"
                        >
                          BERIKAN NILAI:
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`score-${answer.answer_id}`}
                            type="number"
                            min="0"
                            max={answer.max_points}
                            value={scores[answer.answer_id] || 0}
                            onChange={(e) =>
                              handleScoreChange(
                                answer.answer_id,
                                e.target.value
                              )
                            }
                            placeholder="0"
                            disabled={submitting}
                            className="text-lg font-semibold text-center"
                          />
                          <span className="text-gray-500 font-medium">
                            / {answer.max_points}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Masukkan nilai antara 0 - {answer.max_points} poin
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSubmitGrade(answer.answer_id)}
                        disabled={
                          submitting ||
                          scores[answer.answer_id] > answer.max_points
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Simpan"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Tutup
              </Button>
              <Button onClick={handleSubmitAll} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Semua Nilai"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
