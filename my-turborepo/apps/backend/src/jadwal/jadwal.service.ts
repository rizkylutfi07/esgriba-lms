import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';

@Injectable()
export class JadwalService {
  constructor(private prisma: PrismaService) {}

  async create(createJadwalDto: CreateJadwalDto) {
    return this.prisma.jadwal.create({
      data: createJadwalDto,
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });
  }

  async findAll() {
    return this.prisma.jadwal.findMany({
      include: {
        class: {
          include: {
            major: true,
          },
        },
        subject: true,
        teacher: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const jadwal = await this.prisma.jadwal.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            major: true,
            students: true,
          },
        },
        subject: true,
        teacher: true,
      },
    });

    if (!jadwal) {
      throw new NotFoundException('Jadwal not found');
    }

    return jadwal;
  }

  async update(id: string, updateJadwalDto: UpdateJadwalDto) {
    await this.findOne(id);

    return this.prisma.jadwal.update({
      where: { id },
      data: updateJadwalDto,
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.jadwal.delete({
      where: { id },
    });

    return { message: 'Jadwal deleted successfully' };
  }
}
