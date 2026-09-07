import { IsIn, IsOptional, IsString } from 'class-validator';

export class ActualizarRiesgoDto {
  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsIn(['abierto', 'mitigado', 'cerrado'])
  estado?: string;

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

  // Acta desde la que se actualiza (registra RiesgoActualizacion).
  @IsOptional()
  @IsString()
  actaId?: string;
}
