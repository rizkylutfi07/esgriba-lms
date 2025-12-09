import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Gender } from '@repo/prisma';

export class CreateSiswaDto {
  @IsString()
  @IsNotEmpty()
  nis: string;

  @IsString()
  @IsNotEmpty()
  nisn: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  classId?: string;
}
