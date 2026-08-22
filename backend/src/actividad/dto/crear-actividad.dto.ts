import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CrearActividadDto {
  @IsString()
  faseId!: string;

  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicioPlan?: string;

  @IsOptional()
  @IsDateString()
  fechaFinPlan?: string;

  @IsOptional()
  @IsBoolean()
  finalizada?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  avancePorcentaje?: number;
}
