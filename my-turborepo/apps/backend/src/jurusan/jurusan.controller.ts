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
import { JurusanService } from './jurusan.service';
import { CreateJurusanDto } from './dto/create-jurusan.dto';
import { UpdateJurusanDto } from './dto/update-jurusan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('jurusan')
@UseGuards(JwtAuthGuard)
export class JurusanController {
  constructor(private readonly jurusanService: JurusanService) {}

  @Post()
  create(@Body() createJurusanDto: CreateJurusanDto) {
    return this.jurusanService.create(createJurusanDto);
  }

  @Get()
  findAll() {
    return this.jurusanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jurusanService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJurusanDto: UpdateJurusanDto) {
    return this.jurusanService.update(id, updateJurusanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jurusanService.remove(id);
  }
}
