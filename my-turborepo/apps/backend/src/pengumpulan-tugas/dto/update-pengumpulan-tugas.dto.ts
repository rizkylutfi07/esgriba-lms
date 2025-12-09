import { PartialType } from '@nestjs/mapped-types';
import { CreatePengumpulanTugasDto } from './create-pengumpulan-tugas.dto';

export class UpdatePengumpulanTugasDto extends PartialType(CreatePengumpulanTugasDto) {}
