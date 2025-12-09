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
import { MapelService } from './mapel.service';
import { CreateMapelDto } from './dto/create-mapel.dto';
import { UpdateMapelDto } from './dto/update-mapel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mapel')
@UseGuards(JwtAuthGuard)
export class MapelController {
  constructor(private readonly mapelService: MapelService) {}

  @Post()
  create(@Body() createMapelDto: CreateMapelDto) {
    return this.mapelService.create(createMapelDto);
  }

  @Get()
  findAll() {
    return this.mapelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mapelService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMapelDto: UpdateMapelDto) {
    return this.mapelService.update(id, updateMapelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mapelService.remove(id);
  }
}
