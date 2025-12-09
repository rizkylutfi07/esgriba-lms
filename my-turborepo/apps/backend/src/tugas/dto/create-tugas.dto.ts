import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';

enum TugasStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export class CreateTugasDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsInt()
  @IsOptional()
  maxScore?: number;

  @IsEnum(TugasStatus)
  @IsOptional()
  status?: TugasStatus;

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
