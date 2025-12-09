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
import { MateriService } from './materi.service';
import { CreateMateriDto } from './dto/create-materi.dto';
import { UpdateMateriDto } from './dto/update-materi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('materi')
@UseGuards(JwtAuthGuard)
export class MateriController {
  constructor(private readonly materiService: MateriService) {}

  @Post()
  create(@Body() createMateriDto: CreateMateriDto) {
    return this.materiService.create(createMateriDto);
  }

  @Get()
  findAll(@Query('classId') classId?: string, @Query('teacherId') teacherId?: string) {
    if (classId) {
      return this.materiService.findByClass(classId);
    }
    if (teacherId) {
      return this.materiService.findByTeacher(teacherId);
    }
    return this.materiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materiService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMateriDto: UpdateMateriDto) {
    return this.materiService.update(id, updateMateriDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materiService.remove(id);
  }
}
