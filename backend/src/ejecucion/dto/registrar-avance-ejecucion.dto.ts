import { IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class RegistrarAvanceEjecucionDto {
  // Reporte INCREMENTAL: cuánto avanzó ahora (se suma al total vigente).
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje!: number;

  @IsOptional()
  @IsUrl()
  enlaceEvidencia?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
