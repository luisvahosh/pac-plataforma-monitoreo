import { IsOptional, IsString, MinLength } from 'class-validator';

export class CrearNotaDto {
  @IsString()
  @MinLength(1)
  texto!: string;

  @IsOptional()
  @IsString()
  actividadId?: string;
}
