import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('jadwal')
@UseGuards(JwtAuthGuard)
export class JadwalController {
  constructor(private readonly jadwalService: JadwalService) {}

  @Post()
  create(@Body() createJadwalDto: CreateJadwalDto) {
    return this.jadwalService.create(createJadwalDto);
  }

  @Get()
  findAll() {
    return this.jadwalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jadwalService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJadwalDto: UpdateJadwalDto) {
    return this.jadwalService.update(id, updateJadwalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jadwalService.remove(id);
  }
}
