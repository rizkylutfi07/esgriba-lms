import { PartialType } from '@nestjs/mapped-types';
import { CreateJadwalDto } from './create-jadwal.dto';

export class UpdateJadwalDto extends PartialType(CreateJadwalDto) {}
