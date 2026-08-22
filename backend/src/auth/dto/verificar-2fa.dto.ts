import { IsString } from 'class-validator';

export class Verificar2faDto {
  @IsString()
  retoToken!: string;

  @IsString()
  codigo!: string;
}
