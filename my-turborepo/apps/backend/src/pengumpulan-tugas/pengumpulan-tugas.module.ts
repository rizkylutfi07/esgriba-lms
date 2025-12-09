import { Module } from '@nestjs/common';
import { PengumpulanTugasService } from './pengumpulan-tugas.service';
import { PengumpulanTugasController } from './pengumpulan-tugas.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PengumpulanTugasController],
  providers: [PengumpulanTugasService, PrismaService],
})
export class PengumpulanTugasModule {}
