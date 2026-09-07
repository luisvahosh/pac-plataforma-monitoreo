import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AsistenteDto {
  @IsOptional()
  @IsString()
  usuarioId?: string; // si es usuario del sistema

  @IsOptional()
  @IsString()
  nombre?: string; // requerido para invitados externos

  @IsOptional()
  @IsString()
  organizacion?: string;

  @IsOptional()
  @IsString()
  rolEnReunion?: string;

  @IsOptional()
  @IsBoolean()
  esInvitado?: boolean;
}

export class TemaDto {
  @IsString()
  @MinLength(1)
  tema!: string;

  @IsOptional()
  @IsString()
  actividadId?: string;

  @IsOptional()
  @IsString()
  subactividadId?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  decisiones?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}

export class ConclusionDto {
  @IsString()
  @MinLength(1)
  texto!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}

// PATCH del acta (solo borrador). Los arreglos, si vienen, REEMPLAZAN el
// contenido anterior (semántica de editor de borrador).
export class ActualizarActaDto {
  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  horaInicio?: string;

  @IsOptional()
  @IsString()
  horaFin?: string;

  @IsOptional()
  @IsString()
  actividadTema?: string;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsOptional()
  @IsString()
  elaboradoPor?: string;

  @IsOptional()
  @IsString()
  convocadaPor?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsistenteDto)
  asistentes?: AsistenteDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemaDto)
  temas?: TemaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConclusionDto)
  conclusiones?: ConclusionDto[];
}
