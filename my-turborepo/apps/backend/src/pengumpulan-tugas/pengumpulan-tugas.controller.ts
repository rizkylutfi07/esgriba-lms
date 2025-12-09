import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PengumpulanTugasService } from './pengumpulan-tugas.service';
import { CreatePengumpulanTugasDto } from './dto/create-pengumpulan-tugas.dto';
import { UpdatePengumpulanTugasDto } from './dto/update-pengumpulan-tugas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pengumpulan-tugas')
@UseGuards(JwtAuthGuard)
export class PengumpulanTugasController {
  constructor(private readonly pengumpulanTugasService: PengumpulanTugasService) {}

  @Post()
  create(@Body() createDto: CreatePengumpulanTugasDto) {
    return this.pengumpulanTugasService.create(createDto);
  }

  @Get()
  findAll(@Query('tugasId') tugasId?: string, @Query('siswaId') siswaId?: string) {
    if (tugasId) {
      return this.pengumpulanTugasService.findByTugas(tugasId);
    }
    if (siswaId) {
      return this.pengumpulanTugasService.findBySiswa(siswaId);
    }
    return this.pengumpulanTugasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pengumpulanTugasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePengumpulanTugasDto) {
    return this.pengumpulanTugasService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pengumpulanTugasService.remove(id);
  }
}
