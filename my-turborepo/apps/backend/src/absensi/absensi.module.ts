import { Module } from '@nestjs/common';
import { AbsensiService } from './absensi.service';
import { AbsensiController } from './absensi.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AbsensiController],
  providers: [AbsensiService, PrismaService],
})
export class AbsensiModule {}
