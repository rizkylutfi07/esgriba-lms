-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'ESSAY', 'TRUE_FALSE');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'BLOCKED');

-- CreateTable
CREATE TABLE "question_banks" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "subjectId" TEXT,
    "category" TEXT,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "expectedAnswer" TEXT,
    "difficultyLevel" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "options" JSONB,
    "correctAnswer" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "question_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "cheatDetectionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "subjectId" TEXT,
    "classId" TEXT,
    "session" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "expectedAnswer" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "isPassed" BOOLEAN,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedAt" TIMESTAMP(3),
    "blockedReason" TEXT,
    "cheatCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_attempt_events" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL DEFAULT 'student',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_attempt_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TestAllowedStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PackageQuestions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "question_banks_createdBy_subjectId_idx" ON "question_banks"("createdBy", "subjectId");

-- CreateIndex
CREATE INDEX "question_banks_category_idx" ON "question_banks"("category");

-- CreateIndex
CREATE INDEX "questions_testId_idx" ON "questions"("testId");

-- CreateIndex
CREATE INDEX "question_options_questionId_idx" ON "question_options"("questionId");

-- CreateIndex
CREATE INDEX "test_attempts_testId_idx" ON "test_attempts"("testId");

-- CreateIndex
CREATE INDEX "test_attempts_siswaId_idx" ON "test_attempts"("siswaId");

-- CreateIndex
CREATE INDEX "user_answers_attemptId_idx" ON "user_answers"("attemptId");

-- CreateIndex
CREATE INDEX "user_answers_questionId_idx" ON "user_answers"("questionId");

-- CreateIndex
CREATE INDEX "test_attempt_events_attemptId_idx" ON "test_attempt_events"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "_TestAllowedStudents_AB_unique" ON "_TestAllowedStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_TestAllowedStudents_B_index" ON "_TestAllowedStudents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PackageQuestions_AB_unique" ON "_PackageQuestions"("A", "B");

-- CreateIndex
CREATE INDEX "_PackageQuestions_B_index" ON "_PackageQuestions"("B");

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "mapel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_packages" ADD CONSTRAINT "question_packages_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_packages" ADD CONSTRAINT "question_packages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "mapel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_classId_fkey" FOREIGN KEY ("classId") REFERENCES "kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempt_events" ADD CONSTRAINT "test_attempt_events_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestAllowedStudents" ADD CONSTRAINT "_TestAllowedStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestAllowedStudents" ADD CONSTRAINT "_TestAllowedStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageQuestions" ADD CONSTRAINT "_PackageQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageQuestions" ADD CONSTRAINT "_PackageQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "question_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
