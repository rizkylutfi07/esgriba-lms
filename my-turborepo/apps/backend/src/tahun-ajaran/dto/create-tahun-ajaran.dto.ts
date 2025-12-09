import { IsNotEmpty, IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Semester } from '@repo/prisma';

export class CreateTahunAjaranDto {
  @IsNumber()
  @IsNotEmpty()
  yearStart: number;

  @IsNumber()
  @IsNotEmpty()
  yearEnd: number;

  @IsEnum(Semester)
  @IsNotEmpty()
  semester: Semester;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
