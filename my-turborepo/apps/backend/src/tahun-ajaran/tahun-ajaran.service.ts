import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTahunAjaranDto } from './dto/create-tahun-ajaran.dto';
import { UpdateTahunAjaranDto } from './dto/update-tahun-ajaran.dto';

@Injectable()
export class TahunAjaranService {
  constructor(private prisma: PrismaService) {}

  async create(createTahunAjaranDto: CreateTahunAjaranDto) {
    const existing = await this.prisma.tahunAjaran.findFirst({
      where: {
        yearStart: createTahunAjaranDto.yearStart,
        yearEnd: createTahunAjaranDto.yearEnd,
        semester: createTahunAjaranDto.semester,
      },
    });

    if (existing) {
      throw new ConflictException('Tahun ajaran with this period already exists');
    }

    // If this is set as active, deactivate all others
    if (createTahunAjaranDto.isActive) {
      await this.prisma.tahunAjaran.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    return this.prisma.tahunAjaran.create({
      data: createTahunAjaranDto,
    });
  }

  async findAll() {
    return this.prisma.tahunAjaran.findMany({
      orderBy: [
        { yearStart: 'desc' },
        { semester: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const tahunAjaran = await this.prisma.tahunAjaran.findUnique({
      where: { id },
    });

    if (!tahunAjaran) {
      throw new NotFoundException('Tahun ajaran not found');
    }

    return tahunAjaran;
  }

  async update(id: string, updateTahunAjaranDto: UpdateTahunAjaranDto) {
    await this.findOne(id);

    // If this is set as active, deactivate all others
    if (updateTahunAjaranDto.isActive) {
      await this.prisma.tahunAjaran.updateMany({
        where: { 
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      });
    }

    return this.prisma.tahunAjaran.update({
      where: { id },
      data: updateTahunAjaranDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.tahunAjaran.delete({
      where: { id },
    });

    return { message: 'Tahun ajaran deleted successfully' };
  }
}
