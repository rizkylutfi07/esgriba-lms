import { Module } from '@nestjs/common';
import { KelasService } from './kelas.service';
import { KelasController } from './kelas.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [KelasController],
  providers: [KelasService, PrismaService],
})
export class KelasModule {}
