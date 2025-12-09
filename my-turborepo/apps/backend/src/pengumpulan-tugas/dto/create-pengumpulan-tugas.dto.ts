import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';

enum PengumpulanStatus {
  SUBMITTED = 'SUBMITTED',
  LATE = 'LATE',
  GRADED = 'GRADED',
}

export class CreatePengumpulanTugasDto {
  @IsString()
  @IsNotEmpty()
  tugasId: string;

  @IsString()
  @IsNotEmpty()
  siswaId: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsEnum(PengumpulanStatus)
  @IsOptional()
  status?: PengumpulanStatus;
}
