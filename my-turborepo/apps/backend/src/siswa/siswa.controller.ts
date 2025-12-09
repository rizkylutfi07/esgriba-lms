import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SiswaService } from './siswa.service';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('siswa')
@UseGuards(JwtAuthGuard)
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

  @Post()
  create(@Body() createSiswaDto: CreateSiswaDto) {
    return this.siswaService.create(createSiswaDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.siswaService.findByUserId(userId);
    }
    return this.siswaService.findAll();
  }

  @Get('export/excel')
  async exportExcel(@Res() res: Response) {
    const buffer = await this.siswaService.exportToExcel();
    const filename = `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('template/excel')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.siswaService.downloadTemplate();
    const filename = 'Template_Import_Siswa.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded', success: false };
    }
    return this.siswaService.importFromExcel(file.buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siswaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiswaDto: UpdateSiswaDto) {
    return this.siswaService.update(id, updateSiswaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siswaService.remove(id);
  }
}
