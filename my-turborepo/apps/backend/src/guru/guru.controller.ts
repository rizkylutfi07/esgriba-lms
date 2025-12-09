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
import { GuruService } from './guru.service';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('guru')
@UseGuards(JwtAuthGuard)
export class GuruController {
  constructor(private readonly guruService: GuruService) {}

  @Post()
  create(@Body() createGuruDto: CreateGuruDto) {
    return this.guruService.create(createGuruDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.guruService.findByUserId(userId);
    }
    return this.guruService.findAll();
  }

  @Get('export/excel')
  async exportExcel(@Res() res: Response) {
    const buffer = await this.guruService.exportToExcel();
    const filename = `Data_Guru_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('template/excel')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.guruService.downloadTemplate();
    const filename = 'Template_Import_Guru.xlsx';

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
    return this.guruService.importFromExcel(file.buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guruService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuruDto: UpdateGuruDto) {
    return this.guruService.update(id, updateGuruDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guruService.remove(id);
  }
}
