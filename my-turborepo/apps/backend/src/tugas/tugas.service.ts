import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTugasDto } from './dto/create-tugas.dto';
import { UpdateTugasDto } from './dto/update-tugas.dto';

@Injectable()
export class TugasService {
  constructor(private prisma: PrismaService) {}

  async create(createTugasDto: CreateTugasDto) {
    return this.prisma.tugas.create({
      data: {
        ...createTugasDto,
        dueDate: new Date(createTugasDto.dueDate),
      },
      include: {
        class: true,
        subject: true,
        teacher: true,
        pengumpulan: {
          include: {
            siswa: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.tugas.findMany({
      include: {
        class: true,
        subject: true,
        teacher: true,
        pengumpulan: {
          include: {
            siswa: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  async findByClass(classId: string) {
    return this.prisma.tugas.findMany({
      where: { classId },
      include: {
        class: true,
        subject: true,
        teacher: true,
        pengumpulan: {
          include: {
            siswa: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  async findByTeacher(teacherId: string) {
    return this.prisma.tugas.findMany({
      where: { teacherId },
      include: {
        class: true,
        subject: true,
        teacher: true,
        pengumpulan: {
          include: {
            siswa: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.tugas.findUnique({
      where: { id },
      include: {
        class: true,
        subject: true,
        teacher: true,
        pengumpulan: {
          include: {
            siswa: true,
          },
        },
      },
    });
  }

  async update(id: string, updateTugasDto: UpdateTugasDto) {
    const data: any = { ...updateTugasDto };
    if (updateTugasDto.dueDate) {
      data.dueDate = new Date(updateTugasDto.dueDate);
    }
    
    return this.prisma.tugas.update({
      where: { id },
      data,
      include: {
        class: true,
        subject: true,
        teacher: true,
        pengumpulan: {
          include: {
            siswa: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.tugas.delete({
      where: { id },
    });
  }
}
