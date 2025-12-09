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
import { TahunAjaranService } from './tahun-ajaran.service';
import { CreateTahunAjaranDto } from './dto/create-tahun-ajaran.dto';
import { UpdateTahunAjaranDto } from './dto/update-tahun-ajaran.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tahun-ajaran')
@UseGuards(JwtAuthGuard)
export class TahunAjaranController {
  constructor(private readonly tahunAjaranService: TahunAjaranService) {}

  @Post()
  create(@Body() createTahunAjaranDto: CreateTahunAjaranDto) {
    return this.tahunAjaranService.create(createTahunAjaranDto);
  }

  @Get()
  findAll() {
    return this.tahunAjaranService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tahunAjaranService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTahunAjaranDto: UpdateTahunAjaranDto) {
    return this.tahunAjaranService.update(id, updateTahunAjaranDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tahunAjaranService.remove(id);
  }
}
