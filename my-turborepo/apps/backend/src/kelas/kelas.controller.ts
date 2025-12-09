import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { KelasService } from './kelas.service';
import { CreateKelasDto } from './dto/create-kelas.dto';
import { UpdateKelasDto } from './dto/update-kelas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('kelas')
@UseGuards(JwtAuthGuard)
export class KelasController {
  constructor(private readonly kelasService: KelasService) {}

  @Post()
  create(@Body() createKelasDto: CreateKelasDto) {
    return this.kelasService.create(createKelasDto);
  }

  @Get()
  findAll() {
    return this.kelasService.findAll();
  }

  @Get('export/excel')
  async exportExcel(@Res() res: Response) {
    const buffer = await this.kelasService.exportToExcel();
    const filename = `Data_Kelas_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('template/excel')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.kelasService.downloadTemplate();
    const filename = 'Template_Import_Kelas.xlsx';

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
    return this.kelasService.importFromExcel(file.buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kelasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKelasDto: UpdateKelasDto) {
    return this.kelasService.update(id, updateKelasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kelasService.remove(id);
  }
}
