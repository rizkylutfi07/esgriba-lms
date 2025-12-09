import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

enum AbsensiStatus {
  HADIR = 'HADIR',
  IZIN = 'IZIN',
  SAKIT = 'SAKIT',
  ALPHA = 'ALPHA',
}

export class CreateAbsensiDto {
  @IsString()
  @IsNotEmpty()
  jadwalId: string;

  @IsString()
  @IsNotEmpty()
  siswaId: string;

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(AbsensiStatus)
  @IsNotEmpty()
  status: AbsensiStatus;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateAbsensiDto {
  @IsEnum(AbsensiStatus)
  @IsOptional()
  status?: AbsensiStatus;

  @IsString()
  @IsOptional()
  note?: string;
}
