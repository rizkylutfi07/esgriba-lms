import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJurusanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
