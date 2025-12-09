import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMapelDto } from './dto/create-mapel.dto';
import { UpdateMapelDto } from './dto/update-mapel.dto';

@Injectable()
export class MapelService {
  constructor(private prisma: PrismaService) {}

  async create(createMapelDto: CreateMapelDto) {
    const existingCode = await this.prisma.mapel.findUnique({
      where: { code: createMapelDto.code },
    });

    if (existingCode) {
      throw new ConflictException('Code already exists');
    }

    return this.prisma.mapel.create({
      data: createMapelDto,
      include: {
        teacher: true,
      },
    });
  }

  async findAll() {
    return this.prisma.mapel.findMany({
      include: {
        teacher: true,
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const mapel = await this.prisma.mapel.findUnique({
      where: { id },
      include: {
        teacher: true,
        schedules: {
          include: {
            class: true,
            teacher: true,
          },
        },
      },
    });

    if (!mapel) {
      throw new NotFoundException('Mapel not found');
    }

    return mapel;
  }

  async update(id: string, updateMapelDto: UpdateMapelDto) {
    await this.findOne(id);

    if (updateMapelDto.code) {
      const existingCode = await this.prisma.mapel.findFirst({
        where: {
          code: updateMapelDto.code,
          id: { not: id },
        },
      });

      if (existingCode) {
        throw new ConflictException('Code already exists');
      }
    }

    return this.prisma.mapel.update({
      where: { id },
      data: updateMapelDto,
      include: {
        teacher: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.mapel.delete({
      where: { id },
    });

    return { message: 'Mapel deleted successfully' };
  }
}
