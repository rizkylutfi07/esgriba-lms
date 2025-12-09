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
import { TugasService } from './tugas.service';
import { CreateTugasDto } from './dto/create-tugas.dto';
import { UpdateTugasDto } from './dto/update-tugas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tugas')
@UseGuards(JwtAuthGuard)
export class TugasController {
  constructor(private readonly tugasService: TugasService) {}

  @Post()
  create(@Body() createTugasDto: CreateTugasDto) {
    return this.tugasService.create(createTugasDto);
  }

  @Get()
  findAll(@Query('classId') classId?: string, @Query('teacherId') teacherId?: string) {
    if (classId) {
      return this.tugasService.findByClass(classId);
    }
    if (teacherId) {
      return this.tugasService.findByTeacher(teacherId);
    }
    return this.tugasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tugasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTugasDto: UpdateTugasDto) {
    return this.tugasService.update(id, updateTugasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tugasService.remove(id);
  }
}
