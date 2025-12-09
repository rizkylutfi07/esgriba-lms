import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAbsensiDto, UpdateAbsensiDto } from './dto/create-absensi.dto';

@Injectable()
export class AbsensiService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAbsensiDto) {
    return this.prisma.absensi.create({
      data: {
        ...createDto,
        date: new Date(createDto.date),
      },
      include: {
        jadwal: true,
        siswa: true,
        class: true,
        teacher: true,
      },
    });
  }

  async findAll() {
    return this.prisma.absensi.findMany({
      include: {
        jadwal: true,
        siswa: true,
        class: true,
        teacher: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findByClass(classId: string) {
    return this.prisma.absensi.findMany({
      where: { classId },
      include: {
        jadwal: true,
        siswa: true,
        class: true,
        teacher: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findBySiswa(siswaId: string) {
    return this.prisma.absensi.findMany({
      where: { siswaId },
      include: {
        jadwal: true,
        siswa: true,
        class: true,
        teacher: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.absensi.findUnique({
      where: { id },
      include: {
        jadwal: true,
        siswa: true,
        class: true,
        teacher: true,
      },
    });
  }

  async update(id: string, updateDto: UpdateAbsensiDto) {
    return this.prisma.absensi.update({
      where: { id },
      data: updateDto,
      include: {
        jadwal: true,
        siswa: true,
        class: true,
        teacher: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.absensi.delete({
      where: { id },
    });
  }
}
