import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateMapelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  teacherId?: string;
}
