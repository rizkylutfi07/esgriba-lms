import { PartialType } from '@nestjs/mapped-types';
import { CreateTugasDto } from './create-tugas.dto';

export class UpdateTugasDto extends PartialType(CreateTugasDto) {}
