import { Module } from '@nestjs/common';
import { MapelService } from './mapel.service';
import { MapelController } from './mapel.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MapelController],
  providers: [MapelService, PrismaService],
})
export class MapelModule {}
