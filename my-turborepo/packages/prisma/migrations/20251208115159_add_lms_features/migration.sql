-- CreateEnum
CREATE TYPE "TugasStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PengumpulanStatus" AS ENUM ('SUBMITTED', 'LATE', 'GRADED');

-- CreateEnum
CREATE TYPE "AbsensiStatus" AS ENUM ('HADIR', 'IZIN', 'SAKIT', 'ALPHA');

-- CreateTable
CREATE TABLE "materi" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "status" "TugasStatus" NOT NULL DEFAULT 'DRAFT',
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengumpulan_tugas" (
    "id" TEXT NOT NULL,
    "tugasId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "content" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "status" "PengumpulanStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengumpulan_tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi" (
    "id" TEXT NOT NULL,
    "jadwalId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AbsensiStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "nilaiTugas" DOUBLE PRECISION,
    "nilaiUTS" DOUBLE PRECISION,
    "nilaiUAS" DOUBLE PRECISION,
    "nilaiAkhir" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengumpulan_tugas_tugasId_siswaId_key" ON "pengumpulan_tugas"("tugasId", "siswaId");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_jadwalId_siswaId_date_key" ON "absensi"("jadwalId", "siswaId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_siswaId_subjectId_semester_tahunAjaran_key" ON "nilai"("siswaId", "subjectId", "semester", "tahunAjaran");

-- AddForeignKey
ALTER TABLE "materi" ADD CONSTRAINT "materi_classId_fkey" FOREIGN KEY ("classId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materi" ADD CONSTRAINT "materi_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "mapel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materi" ADD CONSTRAINT "materi_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_classId_fkey" FOREIGN KEY ("classId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "mapel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengumpulan_tugas" ADD CONSTRAINT "pengumpulan_tugas_tugasId_fkey" FOREIGN KEY ("tugasId") REFERENCES "tugas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengumpulan_tugas" ADD CONSTRAINT "pengumpulan_tugas_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "jadwal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_classId_fkey" FOREIGN KEY ("classId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "mapel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
