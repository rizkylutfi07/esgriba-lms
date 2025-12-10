import { useState, useEffect, useCallback, useRef } from "react";
import { MathContent } from "../../components/MathContent";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import testAttemptService from "../../lib/services/testAttemptService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Textarea } from "../../components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Send,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const MAX_CHEAT_WARNINGS = 1;
const FONT_SIZES = ["base", "lg", "xl"] as const;

interface Question {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "essay";
  points: number;
  order_number?: number;
  options?: {
    id: number;
    option_text: string;
  }[];
}

interface TestData {
  id: number;
  title: string;
  description: string;
  subject: string;
  kelas: string;
  duration: number; // fallback duration if end_time not provided
  passing_score: number;
  total_points?: number;
  questions: Question[];
  start_time?: string; // scheduled start (ISO or 'YYYY-MM-DD HH:mm:ss')
  end_time?: string; // scheduled end (same formats)
}

interface AttemptData {
  id: number;
  test_id: number;
  started_at: string;
  finished_at?: string | null;
  status: "in_progress" | "completed" | "blocked" | "abandoned";
  is_blocked?: boolean;
  blocked_reason?: string | null;
  blocked_at?: string | null;
  cheat_count?: number;
  last_activity_at?: string | null;
  test: TestData;
  answers?: {
    id: number;
    question_id: number;
    option_id?: number | null;
    answer_text?: string | null;
  }[];
}

interface Answer {
  question_id: number;
  option_id?: number;
  answer_text?: string;
}

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [blockedNotified, setBlockedNotified] = useState(false);
  const [lastCheatCount, setLastCheatCount] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<
    Record<number, boolean>
  >({});
  const [questionFontSize, setQuestionFontSize] = useState<
    "base" | "lg" | "xl"
  >("base");
  const [showCheatWarningDialog, setShowCheatWarningDialog] = useState(false);
  const [cheatWarningData, setCheatWarningData] = useState<{
    count: number;
    reason?: string;
  } | null>(null);
  const eventCooldownRef = useRef<Record<string, number>>({});
  const pendingSaveTimersRef = useRef<Record<number, number>>({});
  const hasLoadedSuccessfully = useRef(false); // Track if data was loaded successfully

  const hydrateAnswersFromAttempt = useCallback((attemptData: AttemptData) => {
    if (!Array.isArray(attemptData.answers)) {
      return undefined;
    }

    const mapped = attemptData.answers.reduce<Record<number, Answer>>(
      (acc, answer) => {
        const record: Answer = {
          question_id: answer.question_id,
        };

        if (typeof answer.option_id === "number") {
          record.option_id = answer.option_id;
        }

        if (
          typeof answer.answer_text === "string" &&
          answer.answer_text.length > 0
        ) {
          record.answer_text = answer.answer_text;
        }

        acc[answer.question_id] = record;
        return acc;
      },
      {}
    );

    // Merge server answers into local answers, but keep any local (newer) selections
    setAnswers((prev) => ({ ...mapped, ...prev }));
    return mapped;
  }, []);

  const handleBlocked = useCallback(
    (blockedAttempt: AttemptData) => {
      // Merge with existing attempt to preserve questions if they exist
      setAttempt((prev) => {
        if (!prev) return blockedAttempt;

        // If prev has questions but blockedAttempt doesn't, preserve them
        if (prev.test?.questions && !blockedAttempt.test?.questions) {
          return {
            ...blockedAttempt,
            test: {
              ...blockedAttempt.test,
              questions: prev.test.questions,
            },
          };
        }

        return blockedAttempt;
      });
      hydrateAnswersFromAttempt(blockedAttempt);

      if (!blockedNotified) {
        // Show dialog instead of toast
        setCheatWarningData({
          count: blockedAttempt.cheat_count ?? 0,
          reason: blockedAttempt.blocked_reason || undefined,
        });
        setShowCheatWarningDialog(true);
        setBlockedNotified(true);
      }
    },
    [blockedNotified, hydrateAnswersFromAttempt]
  );

  const startTest = useCallback(async () => {
    console.log("🔵 startTest called");

    // Guard: prevent multiple simultaneous calls
    if (hasLoadedSuccessfully.current) {
      console.log("🔵 Already loaded, skipping");
      return;
    }

    // Mark as loading immediately to prevent race condition
    hasLoadedSuccessfully.current = true;

    try {
      if (!id) {
        hasLoadedSuccessfully.current = false; // Reset on error
        throw new Error("ID ujian tidak ditemukan");
      }

      setLoading(true);
      console.log("🔵 Fetching test data...");
      const response = await api.post(`/tests/${id}/start`);
      console.log("🔵 Response received:", response.status);

      const attemptData = response.data.attempt || response.data;
      console.log("🔵 Attempt data:", attemptData);

      // Validate attempt data
      if (!attemptData) {
        hasLoadedSuccessfully.current = false; // Reset on error
        throw new Error("Data attempt tidak ditemukan");
      }

      if (!attemptData.test) {
        hasLoadedSuccessfully.current = false; // Reset on error
        throw new Error("Data test tidak ditemukan");
      }

      // Check if questions exist and is an array
      if (
        !attemptData.test.questions ||
        !Array.isArray(attemptData.test.questions)
      ) {
        console.error("Questions data:", attemptData.test.questions);
        hasLoadedSuccessfully.current = false; // Reset on error
        throw new Error("Data soal tidak ditemukan atau format tidak valid");
      }

      if (attemptData.test.questions.length === 0) {
        hasLoadedSuccessfully.current = false; // Reset on error
        throw new Error("Ujian ini belum memiliki soal");
      }

      console.log("🔵 Setting attempt data...");
      console.log("🔵 Attempt before setState:", {
        id: attemptData.id,
        hasTest: !!attemptData.test,
        hasQuestions: !!attemptData.test?.questions,
        questionsLength: attemptData.test?.questions?.length,
      });
      setAttempt(attemptData);
      const restoredAnswers = hydrateAnswersFromAttempt(attemptData) ?? {};
      setLastCheatCount(attemptData.cheat_count ?? 0);
      setBlockedNotified(false);
      console.log("🔵 Data set successfully");

      if (attemptData.test.questions.length > 0) {
        const firstUnansweredIndex = attemptData.test.questions.findIndex(
          (question: Question) => !restoredAnswers[question.id]
        );

        setCurrentQuestionIndex(
          firstUnansweredIndex === -1 ? 0 : firstUnansweredIndex
        );
      } else {
        setCurrentQuestionIndex(0);
      }

      // Calculate time remaining based on scheduled end_time if available
      setTimeRemaining(computeScheduledRemainingSeconds(attemptData));

      toast({
        title: "Ujian dimulai",
        description: `Waktu mengerjakan: ${attemptData.test.duration} menit. Total ${attemptData.test.questions.length} soal.`,
      });

      if (attemptData.is_blocked || attemptData.status === "blocked") {
        handleBlocked(attemptData);
      }
    } catch (error: any) {
      if (error.response?.status === 423 && error.response?.data?.attempt) {
        console.log("🔵 Handling 423 blocked attempt");
        // Set the attempt data even if it's blocked, so we can show proper UI
        const blockedAttempt = error.response.data.attempt;

        // Merge with existing attempt to preserve questions if they exist
        setAttempt((prev) => {
          if (!prev) return blockedAttempt;

          // If prev has questions but blockedAttempt doesn't, preserve them
          if (prev.test?.questions && !blockedAttempt.test?.questions) {
            return {
              ...blockedAttempt,
              test: {
                ...blockedAttempt.test,
                questions: prev.test.questions,
              },
            };
          }

          return blockedAttempt;
        });
        // Keep hasLoadedSuccessfully as true since we got valid data

        // Restore answers if any
        const restoredAnswers = hydrateAnswersFromAttempt(blockedAttempt) ?? {};
        setAnswers(restoredAnswers);
        setLastCheatCount(blockedAttempt.cheat_count ?? 0);

        // Calculate time remaining (scheduled)
        setTimeRemaining(computeScheduledRemainingSeconds(blockedAttempt));

        // Show dialog
        setCheatWarningData({
          count: blockedAttempt.cheat_count ?? 0,
          reason: blockedAttempt.blocked_reason || undefined,
        });
        setShowCheatWarningDialog(true);
        setBlockedNotified(true);

        return;
      }

      console.error("Error starting test:", error);
      console.error("Error details:", error.response?.data);

      // Reset flag on error so user can retry
      hasLoadedSuccessfully.current = false;

      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Gagal memulai ujian",
      });

      // Don't navigate immediately, give user time to see error
      setTimeout(() => {
        navigate("/tests");
      }, 3000);
    } finally {
      console.log("🔵 Finally block - setting loading to false");
      setLoading(false);
    }
  }, [handleBlocked, hydrateAnswersFromAttempt, id, navigate, toast]);

  // Start test or resume
  useEffect(() => {
    console.log(
      "🟢 useEffect startTest triggered, id:",
      id,
      "hasLoaded:",
      hasLoadedSuccessfully.current
    );

    if (!id) {
      console.log("🟢 No id, skipping");
      return;
    }

    // Only start once - prevent infinite loop
    if (hasLoadedSuccessfully.current) {
      console.log("🟢 Already loaded successfully, skipping");
      return;
    }

    console.log("🟢 Calling startTest()");
    startTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id, not startTest

  // Timer countdown
  useEffect(() => {
    if (
      timeRemaining <= 0 ||
      !attempt ||
      attempt.status !== "in_progress" ||
      attempt.is_blocked
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, attempt]);

  // Auto-save answers
  const saveAnswer = useCallback(
    async (answer: Answer) => {
      if (!attempt || attempt.is_blocked) return;

      try {
        setAutoSaving(true);
        await api.post(`/attempts/${attempt.id}/answer`, answer);
      } catch (error) {
        console.error("Failed to save answer:", error);
      } finally {
        setAutoSaving(false);
      }
    },
    [attempt]
  );

  const logCheatEvent = useCallback(
    async (eventType: string, description?: string) => {
      if (!attempt || attempt.status !== "in_progress" || attempt.is_blocked) {
        return;
      }

      const now = Date.now();
      const lastTrigger = eventCooldownRef.current[eventType] ?? 0;
      if (now - lastTrigger < 5000) {
        return;
      }
      eventCooldownRef.current[eventType] = now;

      try {
        const response = await testAttemptService.logEvent(attempt.id, {
          event_type: eventType,
          description,
        });

        const updatedAttempt: AttemptData | undefined = response?.attempt;

        if (typeof response?.cheat_count === "number") {
          if (response.cheat_count > lastCheatCount) {
            // Tampilkan popup jumlah pelanggaran (1..MAX)
            setCheatWarningData({ count: response.cheat_count });
            setShowCheatWarningDialog(true);
            setLastCheatCount(response.cheat_count);
          }
        }

        if (response?.auto_blocked && updatedAttempt) {
          handleBlocked(updatedAttempt);
          return;
        }

        if (updatedAttempt) {
          if (
            updatedAttempt.is_blocked ||
            updatedAttempt.status === "blocked"
          ) {
            handleBlocked(updatedAttempt);
          } else {
            // Merge with existing state to preserve questions
            setAttempt((prev) => {
              if (!prev) return updatedAttempt;

              // If prev has questions but updatedAttempt doesn't, preserve them
              if (prev.test?.questions && !updatedAttempt.test?.questions) {
                return {
                  ...updatedAttempt,
                  test: {
                    ...updatedAttempt.test,
                    questions: prev.test.questions,
                  },
                };
              }

              return updatedAttempt;
            });
            if (typeof updatedAttempt.cheat_count === "number") {
              setLastCheatCount(updatedAttempt.cheat_count);
            }
          }
        }
      } catch (error: any) {
        if (error?.response?.status === 423 && error.response?.data?.attempt) {
          handleBlocked(error.response.data.attempt);
        } else if (error?.response?.status === 403) {
          setPermissionError(
            error.response?.data?.message ||
              "Anda tidak memiliki izin untuk melakukan aksi ini."
          );
        } else {
          console.error("Failed to log attempt event", error);
        }
      }
    },
    [attempt, handleBlocked, lastCheatCount, toast]
  );

  // Flush any pending debounced saves (used before finish)
  const flushPendingSaves = useCallback(async () => {
    if (!attempt || attempt.is_blocked) return;

    // Clear timers first to avoid duplicate posts
    const timers = pendingSaveTimersRef.current;
    Object.keys(timers).forEach((qid) => {
      try {
        window.clearTimeout(timers[Number(qid)]);
      } catch {}
      delete timers[Number(qid)];
    });

    // Push all current answers to server to be safe
    const payloads = Object.values(answers);
    if (payloads.length === 0) return;

    try {
      setAutoSaving(true);
      await Promise.allSettled(
        payloads.map((a) => api.post(`/attempts/${attempt.id}/answer`, a))
      );
    } catch (e) {
      console.error("Failed to flush answers before finish", e);
    } finally {
      setAutoSaving(false);
    }
  }, [answers, attempt]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress" || attempt.is_blocked)
      return;

    let blurTimeout: NodeJS.Timeout | null = null;
    let visibilityTimeout: NodeJS.Timeout | null = null;

    const handleBlur = () => {
      // Give 3 seconds grace period before logging (untuk notifikasi, dropdown, etc)
      blurTimeout = setTimeout(() => {
        // Only log if window is still blurred and document is hidden (actual switch)
        if (document.hidden) {
          logCheatEvent("window_blur", "Jendela ujian kehilangan fokus");
        }
      }, 2000);
    };

    const handleFocus = () => {
      // Cancel the blur timeout if user comes back quickly
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        // Give 1 seconds grace period for quick tab switches
        visibilityTimeout = setTimeout(() => {
          if (document.hidden) {
            logCheatEvent("tab_hidden", "Tab ujian tidak aktif");
          }
        }, 1000);
      } else {
        // User came back, cancel the timeout
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
          visibilityTimeout = null;
        }
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (blurTimeout) clearTimeout(blurTimeout);
      if (visibilityTimeout) clearTimeout(visibilityTimeout);
    };
  }, [attempt, logCheatEvent]);

  useEffect(() => {
    if (!attempt) return;

    if (typeof attempt.cheat_count === "number") {
      if (attempt.cheat_count > lastCheatCount) {
        // Tampilkan popup jumlah pelanggaran saat bertambah
        setCheatWarningData({ count: attempt.cheat_count });
        setShowCheatWarningDialog(true);
      }
      setLastCheatCount(attempt.cheat_count);
    }
  }, [attempt, lastCheatCount, toast]);

  useEffect(() => {
    if (
      !attempt ||
      (attempt.status !== "in_progress" && attempt.status !== "blocked")
    ) {
      return;
    }

    let isMounted = true;
    const attemptId = attempt.id;
    const wasBlocked = Boolean(
      attempt.is_blocked || attempt.status === "blocked"
    );

    const syncAttempt = async () => {
      try {
        const response = await testAttemptService.getAttempt(attemptId);
        const updatedAttempt: AttemptData | undefined =
          response?.attempt || response;

        console.log("🟡 syncAttempt response:", {
          hasUpdatedAttempt: !!updatedAttempt,
          hasTest: !!updatedAttempt?.test,
          hasQuestions: !!updatedAttempt?.test?.questions,
          questionsLength: updatedAttempt?.test?.questions?.length,
        });

        if (!isMounted || !updatedAttempt) {
          return;
        }

        // Validate that we have test data with questions
        if (
          !updatedAttempt.test ||
          !Array.isArray(updatedAttempt.test.questions) ||
          updatedAttempt.test.questions.length === 0
        ) {
          console.warn(
            "Sync received invalid test data (no questions), keeping current state"
          );
          return; // Don't update if no questions - keep existing state
        }

        if (updatedAttempt.is_blocked || updatedAttempt.status === "blocked") {
          handleBlocked(updatedAttempt);
          return;
        }

        if (wasBlocked) {
          // Attempt baru sudah tidak diblokir: update state langsung tanpa perlu refresh/start ulang
          setBlockedNotified(false);

          // Merge attempt agar pertanyaan tetap ada jika API tidak mengembalikan lengkap
          setAttempt((prev) => {
            if (!prev) return updatedAttempt;

            // Preserve questions jika respons tidak menyertakan
            if (prev.test?.questions && !updatedAttempt.test?.questions) {
              return {
                ...updatedAttempt,
                test: {
                  ...updatedAttempt.test,
                  questions: prev.test.questions,
                },
              } as AttemptData;
            }

            return updatedAttempt as AttemptData;
          });

          // Re-hydrate answers bila tersedia
          if (
            Array.isArray(updatedAttempt.answers) &&
            updatedAttempt.answers.length > 0
          ) {
            hydrateAnswersFromAttempt(updatedAttempt as AttemptData);
          }

          // Recalculate sisa waktu (berdasarkan jadwal)
          setTimeRemaining(computeScheduledRemainingSeconds(updatedAttempt));

          return;
        }

        setBlockedNotified(false);

        setAttempt((prev) => {
          if (!prev) {
            return updatedAttempt;
          }

          const hasMeaningfulChange =
            updatedAttempt.cheat_count !== prev.cheat_count ||
            updatedAttempt.status !== prev.status ||
            updatedAttempt.last_activity_at !== prev.last_activity_at;

          if (!hasMeaningfulChange) {
            return prev;
          }

          const mergedTest = (() => {
            if (!updatedAttempt.test) {
              return prev.test;
            }

            const nextQuestions = updatedAttempt.test.questions;
            return {
              ...prev.test,
              ...updatedAttempt.test,
              questions:
                Array.isArray(nextQuestions) && nextQuestions.length > 0
                  ? nextQuestions
                  : prev.test?.questions || [],
            };
          })();

          // Destructure to exclude test from updatedAttempt
          const { test: _, ...updatedAttemptWithoutTest } = updatedAttempt;

          return {
            ...prev,
            ...updatedAttemptWithoutTest, // Spread without test
            test: mergedTest, // Set merged test explicitly
            answers: updatedAttempt.answers || prev.answers,
          };
        });

        if (
          Array.isArray(updatedAttempt.answers) &&
          updatedAttempt.answers.length > 0
        ) {
          hydrateAnswersFromAttempt(updatedAttempt);
        }
        // Update remaining time each sync tick
        setTimeRemaining(computeScheduledRemainingSeconds(updatedAttempt));
      } catch (error) {
        console.error("Failed to sync attempt status:", error);
      }
    };

    syncAttempt();
    // Saat diblokir, polling lebih cepat agar auto-lanjut lebih responsif
    const intervalId = window.setInterval(
      syncAttempt,
      wasBlocked ? 2000 : 5000
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [
    attempt?.id,
    attempt?.status,
    attempt?.is_blocked,
    handleBlocked,
    hydrateAnswersFromAttempt,
    id,
    startTest,
  ]);

  const handleAnswerChange = (
    questionId: number,
    value: any,
    type: "option" | "text"
  ) => {
    const newAnswer: Answer = {
      question_id: questionId,
      ...(type === "option"
        ? { option_id: parseInt(value) }
        : { answer_text: value }),
    };

    setAnswers((prev) => ({
      ...prev,
      [questionId]: newAnswer,
    }));

    // Debounce save per-question independently of currentQuestionIndex
    const timers = pendingSaveTimersRef.current;
    if (timers[questionId]) {
      window.clearTimeout(timers[questionId]);
    }
    timers[questionId] = window.setTimeout(() => {
      // Use latest state for this question if available
      const latest = answers[questionId] || newAnswer;
      saveAnswer(latest);
      delete timers[questionId];
    }, 600);
  };

  const toggleFlagQuestion = useCallback((questionId: number) => {
    setFlaggedQuestions((prev) => {
      const next = { ...prev };
      if (next[questionId]) {
        delete next[questionId];
      } else {
        next[questionId] = true;
      }
      return next;
    });
  }, []);

  const handleSubmit = async (autoSubmit = false) => {
    if (!attempt) return;

    if (attempt.is_blocked || attempt.status === "blocked") {
      toast({
        variant: "destructive",
        title: "Ujian diblokir",
        description:
          attempt.blocked_reason ||
          "Attempt Anda diblokir oleh pengawas. Jawaban tidak dapat dikirim.",
      });
      return;
    }

    try {
      setSubmitting(true);
      // Ensure all pending answers are flushed before finishing
      await flushPendingSaves();
      await api.post(`/attempts/${attempt.id}/finish`);

      toast({
        title: autoSubmit ? "Waktu habis" : "Ujian selesai",
        description: "Jawaban Anda telah tersimpan",
      });

      navigate(`/results/${attempt.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Gagal mengirim jawaban",
      });
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleContinueAfterWarning = useCallback(async () => {
    setShowCheatWarningDialog(false);

    // Reload attempt data to get fresh status (in case it was unblocked)
    if (!attempt?.id) return;

    try {
      console.log("🔄 Reloading attempt data after warning dialog closed...");
      const response = await testAttemptService.getAttempt(attempt.id);

      if (response.data) {
        console.log("✅ Fresh data loaded:", {
          status: response.data.status,
          isBlocked: response.data.is_blocked,
          hasQuestions: !!response.data.test?.questions,
          questionsCount: response.data.test?.questions?.length,
        });

        // Merge fresh data with existing state
        setAttempt((prev) => {
          if (!prev) return response.data;

          // Preserve questions if new data doesn't have them
          if (prev.test?.questions && !response.data.test?.questions) {
            return {
              ...response.data,
              test: {
                ...response.data.test,
                questions: prev.test.questions,
              },
            };
          }

          return response.data;
        });

        // If unblocked and we have questions, show success message
        if (
          !response.data.is_blocked &&
          response.data.status === "in_progress"
        ) {
          toast({
            title: "Ujian dilanjutkan",
            description: "Anda dapat melanjutkan mengerjakan soal.",
          });
        }
      }
    } catch (error) {
      console.error("Failed to reload attempt:", error);
      // Silently fail - user can continue with cached data
    }
  }, [attempt?.id, toast]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return "text-red-600"; // Less than 5 minutes
    if (timeRemaining < 600) return "text-yellow-600"; // Less than 10 minutes
    return "text-green-600";
  };

  // Helper: hitung sisa detik sampai end_time terjadwal (fallback ke started_at + duration bila end_time tidak ada)
  const computeScheduledRemainingSeconds = (attemptLike: AttemptData) => {
    try {
      const testData = attemptLike.test;
      const normalize = (dt?: string) =>
        dt ? dt.replace(" ", "T") : undefined;
      const endDt = normalize(testData.end_time);
      if (endDt) {
        const end = new Date(endDt);
        if (!Number.isNaN(end.getTime())) {
          const diffMs = end.getTime() - Date.now();
          return Math.max(0, Math.floor(diffMs / 1000));
        }
      }
      // fallback: gunakan started_at + duration
      if (attemptLike.started_at && testData.duration) {
        const start = new Date(attemptLike.started_at).getTime();
        const totalMs = testData.duration * 60 * 1000;
        const remainingMs = start + totalMs - Date.now();
        return Math.max(0, Math.floor(remainingMs / 1000));
      }
    } catch (e) {
      console.warn("Gagal menghitung sisa waktu jadwal", e);
    }
    return 0;
  };

  const formatScheduleRange = (start?: string, end?: string) => {
    if (!start || !end) return "";
    const normalize = (dt: string) => dt.replace(" ", "T");
    const s = new Date(normalize(start));
    const e = new Date(normalize(end));
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(
      e.getHours()
    )}:${pad(e.getMinutes())}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter((a) => {
      const hasOption =
        typeof a.option_id === "number" && !Number.isNaN(a.option_id);
      const hasText =
        typeof a.answer_text === "string" && a.answer_text.trim().length > 0;
      return hasOption || hasText;
    }).length;
  };

  const currentQuestion = attempt?.test?.questions?.[currentQuestionIndex];
  const totalQuestions = attempt?.test?.questions?.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isBlocked = Boolean(
    attempt?.is_blocked || attempt?.status === "blocked"
  );
  const cheatCount = attempt?.cheat_count ?? 0;

  console.log("🟣 Render check:", {
    loading,
    hasAttempt: !!attempt,
    hasTest: !!attempt?.test,
    questionsLength: attempt?.test?.questions?.length,
    currentQuestionIndex,
    currentQuestion: !!currentQuestion,
    hasLoadedSuccessfully: hasLoadedSuccessfully.current,
  });

  const fontSizeMap = {
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  } as const;
  const currentQuestionFlagged = currentQuestion
    ? Boolean(flaggedQuestions[currentQuestion.id])
    : false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat ujian...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !attempt.test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Data ujian tidak ditemukan. Silakan kembali ke daftar ujian.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/tests")}>
          Kembali ke Daftar Ujian
        </Button>
      </div>
    );
  }

  if (isBlocked && attempt) {
    return (
      <>
        <Dialog open>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600">Ujian Diblokir</DialogTitle>
              <DialogDescription>
                {attempt.blocked_reason ||
                  "Pengawas memblokir attempt ini karena aktivitas mencurigakan."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Hubungi guru atau pengawas untuk membuka blokir. Setelah blokir
                dicabut, halaman ini akan otomatis melanjutkan ujian tanpa perlu
                refresh.
              </p>
            </div>
            {/* Tidak ada tombol refresh. Halaman akan otomatis melanjutkan setelah dibuka oleh pengawas. */}
          </DialogContent>
        </Dialog>

        {permissionError && (
          <Dialog
            open
            onOpenChange={(open) => {
              if (!open) {
                setPermissionError(null);
              }
            }}
          >
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  Akses Ditolak
                </DialogTitle>
                <DialogDescription>
                  {permissionError ||
                    "Anda tidak memiliki izin untuk melakukan aksi ini."}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setPermissionError(null)}>Tutup</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // Only show this error if we've finished loading and still no questions
  // Don't show if we've already loaded successfully (prevents flash during re-render)
  if (
    !loading &&
    !hasLoadedSuccessfully.current &&
    attempt &&
    (!attempt.test.questions ||
      !Array.isArray(attempt.test.questions) ||
      attempt.test.questions.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ujian ini belum memiliki soal. Silakan hubungi guru untuk
            menambahkan soal terlebih dahulu.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/tests")}>
          Kembali ke Daftar Ujian
        </Button>
      </div>
    );
  }

  // Only show this error if we've finished loading and still no current question
  // Don't show if we've already loaded successfully
  if (
    !loading &&
    !hasLoadedSuccessfully.current &&
    attempt &&
    totalQuestions > 0 &&
    !currentQuestion
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Soal tidak dapat dimuat. Silakan refresh halaman atau hubungi
            administrator.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Halaman
          </Button>
          <Button onClick={() => navigate("/tests")}>
            Kembali ke Daftar Ujian
          </Button>
        </div>
      </div>
    );
  }

  // If still no currentQuestion after all checks, show temporary loading
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat soal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={Boolean(permissionError)}
        onOpenChange={(open) => {
          if (!open) {
            setPermissionError(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Akses Ditolak</DialogTitle>
            <DialogDescription>
              {permissionError ||
                "Anda tidak memiliki izin untuk melakukan aksi ini."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setPermissionError(null)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showCheatWarningDialog}
        onOpenChange={setShowCheatWarningDialog}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Peringatan Kecurangan
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Sistem mendeteksi aktivitas mencurigakan pada ujian Anda.</p>
              {cheatWarningData && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  {cheatWarningData.reason && (
                    <p className="text-sm text-red-800">
                      Alasan: {cheatWarningData.reason}
                    </p>
                  )}
                </div>
              )}
              <p className="text-sm">
                Anda masih dapat melanjutkan ujian, namun aktivitas Anda sedang
                dipantau. Hindari tindakan mencurigakan untuk mencegah ujian
                diblokir secara permanen.
              </p>
              {cheatWarningData &&
                cheatWarningData.count >= MAX_CHEAT_WARNINGS && (
                  <p className="text-sm font-semibold text-red-600">
                    ⚠️ Peringatan maksimal tercapai! Satu pelanggaran lagi akan
                    memblokir ujian Anda.
                  </p>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleContinueAfterWarning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Saya Mengerti, Lanjutkan Ujian
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100 px-3 py-4 md:px-6 md:py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-6">
          <div className="flex flex-col items-center gap-2 text-center px-2">
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 text-blue-700 text-xs md:text-sm"
            >
              Ujian Berlangsung
            </Badge>
          </div>

          <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-slate-100 bg-white/95 shadow-[0_20px_60px_-30px_rgba(30,64,175,0.45)]">
            <div className="flex flex-col items-center gap-4 p-4 md:gap-6 md:p-6 text-center">
              <div className="relative flex w-full max-w-xs flex-col items-center gap-1 rounded-2xl md:rounded-3xl bg-slate-900 px-4 py-3 md:px-6 md:py-4 text-white shadow-lg">
                <span className="text-xs md:text-sm font-medium text-slate-200">
                  Sisa Waktu
                </span>
                <span
                  className={`text-2xl md:text-3xl font-semibold tracking-tight ${getTimeColor()}`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
              {autoSaving && (
                <span className="text-center text-xs font-medium text-blue-500">
                  Menyimpan jawaban...
                </span>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500">
                <span>Ukuran Font Soal:</span>
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setQuestionFontSize(size)}
                    className={`rounded-full border px-3 py-1 transition ${
                      questionFontSize === size
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"
                    }`}
                  >
                    {size === "base" ? "A" : size === "lg" ? "A+" : "A++"}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-3 md:px-6 md:py-4">
              <div className="flex flex-col items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-600 md:flex-row md:justify-between">
                <div className="flex flex-col items-center gap-1 md:flex-row md:items-center md:gap-3">
                  <span className="font-medium text-slate-900 text-xs md:text-sm">
                    Soal {currentQuestionIndex + 1} dari {totalQuestions}
                  </span>
                  <span
                    className="hidden h-1.5 w-1.5 rounded-full bg-slate-300 md:inline-block"
                    aria-hidden
                  />
                  <span className="text-center">
                    Terjawab {getAnsweredCount()} / {totalQuestions}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 md:w-72">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 transition-all duration-500"
                    style={{
                      width: `${
                        totalQuestions > 0
                          ? Math.min(
                              100,
                              (getAnsweredCount() / totalQuestions) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-[360px_1fr]">
            <Card className="border-0 bg-white/90 shadow-xl shadow-slate-900/5 min-w-0">
              <CardHeader className="pb-3 px-4 pt-4 md:px-6 md:pt-6">
                <CardTitle className="text-sm md:text-base font-semibold text-slate-800">
                  Navigasi Soal ({attempt?.test?.questions?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-4 md:pb-6 md:px-6 min-w-0">
                {/* Mobile: scroll horizontal, Desktop: wrap multiple rows */}
                <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1 scrollbar-hide touch-pan-x scroll-smooth md:overflow-visible">
                  {/* Mobile: single row flex-nowrap, Desktop: multi-row flex-wrap */}
                  <div className="flex w-max flex-nowrap gap-2 pr-4 md:w-auto md:flex-wrap md:pr-0">
                    {(attempt?.test?.questions || []).map((q, index) => {
                      const isAnswered = !!answers[q.id];
                      const isCurrent = index === currentQuestionIndex;
                      const isFlagged = flaggedQuestions[q.id];
                      return (
                        <button
                          type="button"
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`relative flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-xl border text-xs md:text-sm font-medium transition ${
                            isCurrent
                              ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                              : isAnswered
                              ? "border-green-100 bg-green-50 text-green-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                          }`}
                        >
                          {index + 1}
                          {isFlagged && (
                            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500" />
                          )}
                          {isAnswered && !isCurrent && !isFlagged && (
                            <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 md:space-y-4">
              <Card className="overflow-hidden border-0 bg-white/95 shadow-xl shadow-slate-900/5">
                <CardHeader className="border-b border-slate-100 pb-3 px-4 pt-4 md:pb-4 md:px-6 md:pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Badge className="rounded-full bg-blue-100 text-blue-700 text-xs md:text-sm px-2 py-1 md:px-3">
                        Soal No {currentQuestionIndex + 1}
                      </Badge>
                      {currentQuestion.question_type === "essay" && (
                        <Badge
                          variant="outline"
                          className="rounded-full bg-purple-50 text-purple-600"
                        >
                          <FileText className="mr-1 h-3 w-3" /> Essay
                        </Badge>
                      )}
                    </div>
                    {currentQuestionFlagged && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        Ditandai ragu-ragu
                      </span>
                    )}
                  </div>
                  <CardTitle
                    className={`mt-2 md:mt-3 font-semibold text-slate-900 ${fontSizeMap[questionFontSize]} leading-snug break-words`}
                    style={{
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {/* Render HTML to support images and formatted text */}
                    <span
                      className="prose max-w-none break-words"
                      style={{
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      <MathContent content={currentQuestion.question_text} />
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-5 py-4 px-4 md:py-6 md:px-6">
                  {currentQuestion.question_type === "multiple_choice" &&
                    currentQuestion.options && (
                      <RadioGroup
                        value={answers[
                          currentQuestion.id
                        ]?.option_id?.toString()}
                        onValueChange={(value: string) =>
                          handleAnswerChange(
                            currentQuestion.id,
                            value,
                            "option"
                          )
                        }
                        className="space-y-3"
                      >
                        {currentQuestion.options.map((option, idx) => (
                          <label
                            key={option.id}
                            htmlFor={`option-${option.id}`}
                            className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                              answers[currentQuestion.id]?.option_id ===
                              option.id
                                ? "border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-200"
                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                            }`}
                          >
                            <RadioGroupItem
                              value={option.id.toString()}
                              id={`option-${option.id}`}
                              className="sr-only"
                            />
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600 group-hover:border-blue-400 group-hover:text-blue-600 flex-shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span
                              className={`flex-1 text-slate-700 ${fontSizeMap[questionFontSize]} prose max-w-none break-words min-w-0`}
                              style={{
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                              }}
                            >
                              <MathContent content={option.option_text} />
                            </span>
                          </label>
                        ))}
                      </RadioGroup>
                    )}

                  {currentQuestion.question_type === "essay" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Ketik jawaban Anda di sini..."
                        className={`min-h-[220px] rounded-2xl border-slate-200 bg-slate-50/60 ${fontSizeMap[questionFontSize]}`}
                        value={answers[currentQuestion.id]?.answer_text || ""}
                        onChange={(e) =>
                          handleAnswerChange(
                            currentQuestion.id,
                            e.target.value,
                            "text"
                          )
                        }
                      />
                      <p className="text-xs font-medium text-slate-500">
                        {answers[currentQuestion.id]?.answer_text?.length || 0}{" "}
                        karakter
                      </p>
                    </div>
                  )}
                </CardContent>

                <div className="flex flex-col gap-2 md:gap-3 border-t border-slate-100 bg-slate-50/70 p-3 md:p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={isFirstQuestion}
                      className="flex-1 md:flex-none group gap-1 md:gap-2 rounded-full border-slate-300 px-3 md:px-5 text-xs md:text-sm"
                    >
                      <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                      Sebelumnya
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => toggleFlagQuestion(currentQuestion.id)}
                      className={`flex-1 md:flex-none gap-1 md:gap-2 rounded-full px-3 md:px-5 text-xs md:text-sm ${
                        currentQuestionFlagged
                          ? "border-amber-400 bg-amber-100 text-amber-700"
                          : "border-slate-300 text-slate-600 hover:border-amber-400 hover:text-amber-600"
                      }`}
                    >
                      {currentQuestionFlagged ? "Batal Ragu" : "Tandai Ragu"}
                    </Button>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    {!isLastQuestion ? (
                      <Button
                        size="default"
                        onClick={() =>
                          setCurrentQuestionIndex((prev) => prev + 1)
                        }
                        className="w-full md:w-auto gap-1 md:gap-2 rounded-full bg-blue-600 px-4 md:px-6 text-xs md:text-sm text-white shadow-md hover:bg-blue-700"
                      >
                        Selanjutnya
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="default"
                        onClick={() => setShowSubmitDialog(true)}
                        className="w-full md:w-auto gap-1 md:gap-2 rounded-full bg-emerald-600 px-4 md:px-6 text-xs md:text-sm text-white shadow-md hover:bg-emerald-700"
                        disabled={submitting}
                      >
                        <Send className="h-3 w-3 md:h-4 md:w-4" />
                        {submitting ? "Mengirim..." : "Selesai & Kirim"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {timeRemaining < 300 && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-0 bg-red-50 text-red-700"
                >
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="text-sm font-medium">
                    Waktu Anda tersisa kurang dari 5 menit. Segera selesaikan
                    ujian.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <AlertDialog
            open={showSubmitDialog}
            onOpenChange={setShowSubmitDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kirim Jawaban?</AlertDialogTitle>
                <AlertDialogDescription>
                  Anda telah menjawab {getAnsweredCount()} dari {totalQuestions}{" "}
                  soal.
                  {getAnsweredCount() < totalQuestions && (
                    <span className="mt-2 block text-amber-600">
                      ⚠️ Masih ada {totalQuestions - getAnsweredCount()} soal
                      yang belum dijawab!
                    </span>
                  )}
                  <span className="mt-2 block">
                    Setelah dikirim, Anda tidak dapat mengubah jawaban lagi.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={submitting}>
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? "Mengirim..." : "Ya, Kirim Sekarang"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
