import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CrearHitoDto {
  @IsString()
  actividadId!: string;

  @IsString()
  nombre!: string;

  @IsOptional()
  @IsDateString()
  fechaObjetivo?: string;

  @IsOptional()
  @IsBoolean()
  cumplido?: boolean;
}
