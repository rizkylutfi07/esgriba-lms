import { Module } from '@nestjs/common';
import { MateriService } from './materi.service';
import { MateriController } from './materi.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MateriController],
  providers: [MateriService, PrismaService],
})
export class MateriModule {}
