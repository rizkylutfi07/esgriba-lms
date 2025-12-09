import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMateriDto } from './dto/create-materi.dto';
import { UpdateMateriDto } from './dto/update-materi.dto';

@Injectable()
export class MateriService {
  constructor(private prisma: PrismaService) {}

  async create(createMateriDto: CreateMateriDto) {
    return this.prisma.materi.create({
      data: createMateriDto,
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });
  }

  async findAll() {
    return this.prisma.materi.findMany({
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByClass(classId: string) {
    return this.prisma.materi.findMany({
      where: { classId },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByTeacher(teacherId: string) {
    return this.prisma.materi.findMany({
      where: { teacherId },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.materi.findUnique({
      where: { id },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });
  }

  async update(id: string, updateMateriDto: UpdateMateriDto) {
    return this.prisma.materi.update({
      where: { id },
      data: updateMateriDto,
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.materi.delete({
      where: { id },
    });
  }
}
