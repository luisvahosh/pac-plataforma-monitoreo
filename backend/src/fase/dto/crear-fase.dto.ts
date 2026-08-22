import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CrearFaseDto {
  @IsString()
  proyectoId!: string;

  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  pesoPorcentaje!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
