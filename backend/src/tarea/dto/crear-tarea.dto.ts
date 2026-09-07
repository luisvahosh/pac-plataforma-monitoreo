import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearTareaDto {
  @IsString()
  @MinLength(1)
  descripcion!: string;

  @IsOptional()
  @IsString()
  actividadId?: string; // entregable

  @IsOptional()
  @IsString()
  subactividadId?: string; // actividad nivel 3

  @IsOptional()
  @IsString()
  usuarioId?: string; // responsable

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

  @IsOptional()
  @IsString()
  actaOrigenId?: string;
}
