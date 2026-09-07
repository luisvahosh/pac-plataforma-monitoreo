import { IsIn, IsOptional, IsString } from 'class-validator';

export class ActualizarTareaDto {
  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  fechaCompromiso?: string;

  @IsOptional()
  @IsIn(['alta', 'media', 'baja'])
  prioridad?: string;

  @IsOptional()
  @IsIn(['pendiente', 'en_progreso', 'hecha', 'vencida'])
  estado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
