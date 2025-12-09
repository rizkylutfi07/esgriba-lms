import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Level } from '@repo/prisma';

export class CreateKelasDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Level)
  @IsNotEmpty()
  level: Level;

  @IsString()
  @IsOptional()
  majorId?: string;

  @IsString()
  @IsOptional()
  homeroomTeacherId?: string;
}
