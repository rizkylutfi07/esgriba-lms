/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `guru` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `siswa` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "guru" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "siswa" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "guru_userId_key" ON "guru"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_userId_key" ON "siswa"("userId");

-- AddForeignKey
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru" ADD CONSTRAINT "guru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
