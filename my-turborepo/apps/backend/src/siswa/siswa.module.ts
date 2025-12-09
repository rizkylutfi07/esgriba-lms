import { Module } from '@nestjs/common';
import { SiswaService } from './siswa.service';
import { SiswaController } from './siswa.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SiswaController],
  providers: [SiswaService, PrismaService],
})
export class SiswaModule {}
