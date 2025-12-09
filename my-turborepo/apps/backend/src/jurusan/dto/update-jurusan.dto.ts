import { PartialType } from '@nestjs/mapped-types';
import { CreateJurusanDto } from './create-jurusan.dto';

export class UpdateJurusanDto extends PartialType(CreateJurusanDto) {}
