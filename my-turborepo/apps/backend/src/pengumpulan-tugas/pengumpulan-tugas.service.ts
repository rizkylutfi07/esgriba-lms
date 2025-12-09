import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePengumpulanTugasDto } from './dto/create-pengumpulan-tugas.dto';
import { UpdatePengumpulanTugasDto } from './dto/update-pengumpulan-tugas.dto';

@Injectable()
export class PengumpulanTugasService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePengumpulanTugasDto) {
    const data: any = { ...createDto };
    if (createDto.score !== undefined) {
      data.gradedAt = new Date();
    }
    
    return this.prisma.pengumpulanTugas.create({
      data,
      include: {
        tugas: true,
        siswa: true,
      },
    });
  }

  async findAll() {
    return this.prisma.pengumpulanTugas.findMany({
      include: {
        tugas: {
          include: {
            class: true,
            subject: true,
          },
        },
        siswa: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async findByTugas(tugasId: string) {
    return this.prisma.pengumpulanTugas.findMany({
      where: { tugasId },
      include: {
        tugas: true,
        siswa: true,
      },
    });
  }

  async findBySiswa(siswaId: string) {
    return this.prisma.pengumpulanTugas.findMany({
      where: { siswaId },
      include: {
        tugas: {
          include: {
            class: true,
            subject: true,
          },
        },
        siswa: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.pengumpulanTugas.findUnique({
      where: { id },
      include: {
        tugas: {
          include: {
            class: true,
            subject: true,
          },
        },
        siswa: true,
      },
    });
  }

  async update(id: string, updateDto: UpdatePengumpulanTugasDto) {
    const data: any = { ...updateDto };
    if (updateDto.score !== undefined) {
      data.gradedAt = new Date();
      data.status = 'GRADED';
    }
    
    return this.prisma.pengumpulanTugas.update({
      where: { id },
      data,
      include: {
        tugas: true,
        siswa: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.pengumpulanTugas.delete({
      where: { id },
    });
  }
}
