import { Module } from '@nestjs/common';
import { JurusanService } from './jurusan.service';
import { JurusanController } from './jurusan.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [JurusanController],
  providers: [JurusanService, PrismaService],
})
export class JurusanModule {}
