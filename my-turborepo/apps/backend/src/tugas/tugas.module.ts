import { Module } from '@nestjs/common';
import { TugasService } from './tugas.service';
import { TugasController } from './tugas.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TugasController],
  providers: [TugasService, PrismaService],
})
export class TugasModule {}
