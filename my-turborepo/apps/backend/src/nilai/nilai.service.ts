import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNilaiDto, UpdateNilaiDto } from './dto/create-nilai.dto';

@Injectable()
export class NilaiService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNilaiDto) {
    return this.prisma.nilai.create({
      data: createDto,
      include: {
        siswa: true,
        subject: true,
      },
    });
  }

  async findAll() {
    return this.prisma.nilai.findMany({
      include: {
        siswa: true,
        subject: true,
      },
    });
  }

  async findBySiswa(siswaId: string) {
    return this.prisma.nilai.findMany({
      where: { siswaId },
      include: {
        siswa: true,
        subject: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.nilai.findUnique({
      where: { id },
      include: {
        siswa: true,
        subject: true,
      },
    });
  }

  async update(id: string, updateDto: UpdateNilaiDto) {
    return this.prisma.nilai.update({
      where: { id },
      data: updateDto,
      include: {
        siswa: true,
        subject: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.nilai.delete({
      where: { id },
    });
  }
}
