import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateJurusanDto } from './dto/create-jurusan.dto';
import { UpdateJurusanDto } from './dto/update-jurusan.dto';

@Injectable()
export class JurusanService {
  constructor(private prisma: PrismaService) {}

  async create(createJurusanDto: CreateJurusanDto) {
    const existingCode = await this.prisma.jurusan.findUnique({
      where: { code: createJurusanDto.code },
    });

    if (existingCode) {
      throw new ConflictException('Code already exists');
    }

    return this.prisma.jurusan.create({
      data: createJurusanDto,
    });
  }

  async findAll() {
    return this.prisma.jurusan.findMany({
      include: {
        _count: {
          select: {
            classes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const jurusan = await this.prisma.jurusan.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            homeroomTeacher: true,
          },
        },
      },
    });

    if (!jurusan) {
      throw new NotFoundException('Jurusan not found');
    }

    return jurusan;
  }

  async update(id: string, updateJurusanDto: UpdateJurusanDto) {
    await this.findOne(id);

    if (updateJurusanDto.code) {
      const existingCode = await this.prisma.jurusan.findFirst({
        where: {
          code: updateJurusanDto.code,
          id: { not: id },
        },
      });

      if (existingCode) {
        throw new ConflictException('Code already exists');
      }
    }

    return this.prisma.jurusan.update({
      where: { id },
      data: updateJurusanDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.jurusan.delete({
      where: { id },
    });

    return { message: 'Jurusan deleted successfully' };
  }
}
