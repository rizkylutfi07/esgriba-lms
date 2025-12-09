import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

enum Semester {
  GANJIL = 'GANJIL',
  GENAP = 'GENAP',
}

export class CreateNilaiDto {
  @IsString()
  @IsNotEmpty()
  siswaId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsEnum(Semester)
  @IsNotEmpty()
  semester: Semester;

  @IsString()
  @IsNotEmpty()
  tahunAjaran: string;

  @IsNumber()
  @IsOptional()
  nilaiTugas?: number;

  @IsNumber()
  @IsOptional()
  nilaiUTS?: number;

  @IsNumber()
  @IsOptional()
  nilaiUAS?: number;

  @IsNumber()
  @IsOptional()
  nilaiAkhir?: number;
}

export class UpdateNilaiDto {
  @IsNumber()
  @IsOptional()
  nilaiTugas?: number;

  @IsNumber()
  @IsOptional()
  nilaiUTS?: number;

  @IsNumber()
  @IsOptional()
  nilaiUAS?: number;

  @IsNumber()
  @IsOptional()
  nilaiAkhir?: number;
}
