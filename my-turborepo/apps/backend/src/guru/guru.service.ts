import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GuruService {
  constructor(private prisma: PrismaService) {}

  async create(createGuruDto: CreateGuruDto) {
    const existingNip = await this.prisma.guru.findUnique({
      where: { nip: createGuruDto.nip },
    });

    if (existingNip) {
      throw new ConflictException('NIP already exists');
    }

    const existingEmail = await this.prisma.guru.findUnique({
      where: { email: createGuruDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createGuruDto.email },
    });

    if (!existingUser) {
      // Create user account with default password (NIP)
      const hashedPassword = await bcrypt.hash(createGuruDto.nip, 10);
      const user = await this.prisma.user.create({
        data: {
          email: createGuruDto.email,
          name: createGuruDto.name,
          passwordHash: hashedPassword,
          role: 'GURU',
        },
      });

      // Create guru linked to user
      return this.prisma.guru.create({
        data: {
          ...createGuruDto,
          userId: user.id,
        },
        include: { user: true },
      });
    }

    return this.prisma.guru.create({
      data: createGuruDto,
    });
  }

  async findAll() {
    return this.prisma.guru.findMany({
      include: {
        user: true,
        homeroomClasses: true,
        subjects: true,
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.guru.findUnique({
      where: { userId },
      include: {
        user: true,
        homeroomClasses: true,
        subjects: true,
      },
    });
  }

  async findOne(id: string) {
    const guru = await this.prisma.guru.findUnique({
      where: { id },
      include: {
        homeroomClasses: {
          include: {
            major: true,
          },
        },
        subjects: true,
        schedules: {
          include: {
            class: true,
            subject: true,
          },
        },
      },
    });

    if (!guru) {
      throw new NotFoundException('Guru not found');
    }

    return guru;
  }

  async update(id: string, updateGuruDto: UpdateGuruDto) {
    await this.findOne(id);

    if (updateGuruDto.nip) {
      const existingNip = await this.prisma.guru.findFirst({
        where: {
          nip: updateGuruDto.nip,
          id: { not: id },
        },
      });

      if (existingNip) {
        throw new ConflictException('NIP already exists');
      }
    }

    if (updateGuruDto.email) {
      const existingEmail = await this.prisma.guru.findFirst({
        where: {
          email: updateGuruDto.email,
          id: { not: id },
        },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.guru.update({
      where: { id },
      data: updateGuruDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.guru.delete({
      where: { id },
    });

    return { message: 'Guru deleted successfully' };
  }

  async exportToExcel() {
    const guruList = await this.prisma.guru.findMany({
      orderBy: { nip: 'asc' },
    });

    const data = guruList.map((guru) => ({
      NIP: guru.nip,
      Nama: guru.name,
      Email: guru.email,
      Telepon: guru.phone || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async downloadTemplate() {
    const templateData = [
      {
        NIP: '197001011990031001',
        Nama: 'Contoh Nama Guru',
        Email: 'contoh@esgriba.com',
        Telepon: '081234567890',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
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
      // Convert NIP to string to handle Excel number format
      const nip = String(row.NIP);
      const email = String(row.Email);
      const nama = String(row.Nama);
      
      try {
        // Check if user exists
        let user = await this.prisma.user.findUnique({
          where: { email },
        });

        // Create user if not exists (password = NIP)
        if (!user) {
          const hashedPassword = await bcrypt.hash(nip, 10);
          user = await this.prisma.user.create({
            data: {
              email,
              name: nama,
              passwordHash: hashedPassword,
              role: 'GURU',
            },
          });
        }

        await this.prisma.guru.create({
          data: {
            nip,
            name: nama,
            email,
            phone: row.Telepon ? String(row.Telepon) : null,
            userId: user.id,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${nip}: ${error.message}`);
      }
    }

    return results;
  }
}
