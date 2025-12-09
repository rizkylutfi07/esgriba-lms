import { Module } from '@nestjs/common';
import { NilaiService } from './nilai.service';
import { NilaiController } from './nilai.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [NilaiController],
  providers: [NilaiService, PrismaService],
})
export class NilaiModule {}
