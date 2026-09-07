import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearRiesgoDto {
  @IsString()
  @MinLength(1)
  descripcion!: string;

  @IsOptional()
  @IsIn(['alta', 'media', 'baja'])
  probabilidad?: string;

  @IsOptional()
  @IsIn(['alto', 'medio', 'bajo'])
  impacto?: string;

  @IsOptional()
  @IsIn(['alto', 'medio', 'bajo'])
  nivel?: string;

  @IsOptional()
  @IsString()
  responsableId?: string;

  @IsOptional()
  @IsString()
  mitigacion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  actaOrigenId?: string;
}
