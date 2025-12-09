import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateKelasDto } from './dto/create-kelas.dto';
import { UpdateKelasDto } from './dto/update-kelas.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class KelasService {
  constructor(private prisma: PrismaService) {}

  async create(createKelasDto: CreateKelasDto) {
    return this.prisma.kelas.create({
      data: createKelasDto,
      include: {
        major: true,
        homeroomTeacher: true,
      },
    });
  }

  async findAll() {
    return this.prisma.kelas.findMany({
      include: {
        major: true,
        homeroomTeacher: true,
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const kelas = await this.prisma.kelas.findUnique({
      where: { id },
      include: {
        major: true,
        homeroomTeacher: true,
        students: true,
        schedules: {
          include: {
            subject: true,
            teacher: true,
          },
        },
      },
    });

    if (!kelas) {
      throw new NotFoundException('Kelas not found');
    }

    return kelas;
  }

  async update(id: string, updateKelasDto: UpdateKelasDto) {
    await this.findOne(id);

    return this.prisma.kelas.update({
      where: { id },
      data: updateKelasDto,
      include: {
        major: true,
        homeroomTeacher: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.kelas.delete({
      where: { id },
    });

    return { message: 'Kelas deleted successfully' };
  }

  async exportToExcel() {
    const kelasList = await this.prisma.kelas.findMany({
      include: {
        major: true,
        homeroomTeacher: true,
      },
      orderBy: { name: 'asc' },
    });

    const data = kelasList.map((kelas) => ({
      'Nama Kelas': kelas.name,
      Tingkat: kelas.level,
      Jurusan: kelas.major?.name || '',
      'Wali Kelas': kelas.homeroomTeacher?.name || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kelas');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async downloadTemplate() {
    const templateData = [
      {
        'Nama Kelas': 'X-1',
        Tingkat: 'X',
        Jurusan: 'IPA',
        'Wali Kelas': 'Budi Santoso',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kelas');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const row of data) {
      try {
        const major = await this.prisma.jurusan.findFirst({
          where: { name: row.Jurusan },
        });

        const teacher = await this.prisma.guru.findFirst({
          where: { name: row['Wali Kelas'] },
        });

        await this.prisma.kelas.create({
          data: {
            name: row['Nama Kelas'],
            level: row.Tingkat,
            majorId: major?.id || null,
            homeroomTeacherId: teacher?.id || null,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${row['Nama Kelas']}: ${error.message}`);
      }
    }

    return results;
  }
}
