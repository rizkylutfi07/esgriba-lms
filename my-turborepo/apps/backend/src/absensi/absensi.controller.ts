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
import { AbsensiService } from './absensi.service';
import { CreateAbsensiDto, UpdateAbsensiDto } from './dto/create-absensi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('absensi')
@UseGuards(JwtAuthGuard)
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  @Post()
  create(@Body() createDto: CreateAbsensiDto) {
    return this.absensiService.create(createDto);
  }

  @Get()
  findAll(@Query('classId') classId?: string, @Query('siswaId') siswaId?: string) {
    if (classId) {
      return this.absensiService.findByClass(classId);
    }
    if (siswaId) {
      return this.absensiService.findBySiswa(siswaId);
    }
    return this.absensiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.absensiService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAbsensiDto) {
    return this.absensiService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.absensiService.remove(id);
  }
}
