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
import { NilaiService } from './nilai.service';
import { CreateNilaiDto, UpdateNilaiDto } from './dto/create-nilai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nilai')
@UseGuards(JwtAuthGuard)
export class NilaiController {
  constructor(private readonly nilaiService: NilaiService) {}

  @Post()
  create(@Body() createDto: CreateNilaiDto) {
    return this.nilaiService.create(createDto);
  }

  @Get()
  findAll(@Query('siswaId') siswaId?: string) {
    if (siswaId) {
      return this.nilaiService.findBySiswa(siswaId);
    }
    return this.nilaiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nilaiService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateNilaiDto) {
    return this.nilaiService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nilaiService.remove(id);
  }
}
