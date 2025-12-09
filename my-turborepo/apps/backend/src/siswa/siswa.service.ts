import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SiswaService {
  constructor(private prisma: PrismaService) {}

  async create(createSiswaDto: CreateSiswaDto) {
    const existingNis = await this.prisma.siswa.findUnique({
      where: { nis: createSiswaDto.nis },
    });

    if (existingNis) {
      throw new ConflictException('NIS already exists');
    }

    const existingNisn = await this.prisma.siswa.findUnique({
      where: { nisn: createSiswaDto.nisn },
    });

    if (existingNisn) {
      throw new ConflictException('NISN already exists');
    }

    // Create email from NIS
    const email = `${createSiswaDto.nis}@siswa.esgriba.com`;
    
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Create user account with default password (NIS)
      const hashedPassword = await bcrypt.hash(createSiswaDto.nis, 10);
      const user = await this.prisma.user.create({
        data: {
          email,
          name: createSiswaDto.name,
          passwordHash: hashedPassword,
          role: 'SISWA',
        },
      });

      // Create siswa linked to user
      return this.prisma.siswa.create({
        data: {
          ...createSiswaDto,
          birthDate: new Date(createSiswaDto.birthDate),
          userId: user.id,
        },
        include: {
          user: true,
          class: true,
        },
      });
    }

    return this.prisma.siswa.create({
      data: {
        ...createSiswaDto,
        birthDate: new Date(createSiswaDto.birthDate),
      },
      include: {
        class: true,
      },
    });
  }

  async findAll() {
    return this.prisma.siswa.findMany({
      include: {
        user: true,
        class: {
          include: {
            major: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.siswa.findUnique({
      where: { userId },
      include: {
        user: true,
        class: {
          include: {
            major: true,
            homeroomTeacher: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            major: true,
            homeroomTeacher: true,
          },
        },
      },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa not found');
    }

    return siswa;
  }

  async update(id: string, updateSiswaDto: UpdateSiswaDto) {
    await this.findOne(id);

    if (updateSiswaDto.nis) {
      const existingNis = await this.prisma.siswa.findFirst({
        where: {
          nis: updateSiswaDto.nis,
          id: { not: id },
        },
      });

      if (existingNis) {
        throw new ConflictException('NIS already exists');
      }
    }

    if (updateSiswaDto.nisn) {
      const existingNisn = await this.prisma.siswa.findFirst({
        where: {
          nisn: updateSiswaDto.nisn,
          id: { not: id },
        },
      });

      if (existingNisn) {
        throw new ConflictException('NISN already exists');
      }
    }

    const updateData: any = { ...updateSiswaDto };
    if (updateSiswaDto.birthDate) {
      updateData.birthDate = new Date(updateSiswaDto.birthDate);
    }

    return this.prisma.siswa.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.siswa.delete({
      where: { id },
    });

    return { message: 'Siswa deleted successfully' };
  }

  async exportToExcel() {
    const siswaList = await this.prisma.siswa.findMany({
      include: {
        class: {
          include: {
            major: true,
          },
        },
      },
      orderBy: { nis: 'asc' },
    });

    const data = siswaList.map((siswa) => ({
      NIS: siswa.nis,
      NISN: siswa.nisn,
      Nama: siswa.name,
      'Jenis Kelamin': siswa.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan',
      'Tanggal Lahir': new Date(siswa.birthDate).toLocaleDateString('id-ID'),
      Alamat: siswa.address || '',
      Kelas: siswa.class?.name || '',
      Jurusan: siswa.class?.major?.name || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // NIS
      { wch: 15 }, // NISN
      { wch: 25 }, // Nama
      { wch: 15 }, // Jenis Kelamin
      { wch: 15 }, // Tanggal Lahir
      { wch: 30 }, // Alamat
      { wch: 12 }, // Kelas
      { wch: 20 }, // Jurusan
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async downloadTemplate() {
    const templateData = [
      {
        NIS: '2024001',
        NISN: '0012345678',
        Nama: 'Contoh Nama Siswa',
        'Jenis Kelamin': 'Laki-laki',
        'Tanggal Lahir': '01/01/2008',
        Alamat: 'Jl. Contoh No. 1',
        Kelas: 'X-1',
        Jurusan: 'IPA',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 12 },
      { wch: 20 },
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
      // Convert to string to handle Excel number format
      const nis = String(row.NIS);
      const nisn = String(row.NISN);
      const nama = String(row.Nama);
      
      try {
        // Find class by name
        const kelas = await this.prisma.kelas.findFirst({
          where: { name: row.Kelas },
        });

        // Create email from NIS
        const email = `${nis}@siswa.esgriba.com`;
        
        // Check if user exists
        let user = await this.prisma.user.findUnique({
          where: { email },
        });

        // Create user if not exists (password = NIS)
        if (!user) {
          const hashedPassword = await bcrypt.hash(nis, 10);
          user = await this.prisma.user.create({
            data: {
              email,
              name: nama,
              passwordHash: hashedPassword,
              role: 'SISWA',
            },
          });
        }

        await this.prisma.siswa.create({
          data: {
            nis,
            nisn,
            name: nama,
            gender: row['Jenis Kelamin'] === 'Laki-laki' ? 'LAKI_LAKI' : 'PEREMPUAN',
            birthDate: new Date(row['Tanggal Lahir']),
            address: row.Alamat || null,
            classId: kelas?.id || null,
            userId: user.id,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${nis}: ${error.message}`);
      }
    }

    return results;
  }
}
