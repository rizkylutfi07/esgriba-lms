import { Module } from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { JadwalController } from './jadwal.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [JadwalController],
  providers: [JadwalService, PrismaService],
})
export class JadwalModule {}
