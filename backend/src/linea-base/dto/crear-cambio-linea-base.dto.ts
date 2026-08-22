import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearCambioLineaBaseDto {
  @IsIn(['actividad', 'hito'])
  entidadTipo!: 'actividad' | 'hito';

  @IsString()
  entidadId!: string;

  // 'fecha_inicio' | 'fecha_fin' para actividad; 'fecha_objetivo' para hito.
  @IsIn(['fecha_inicio', 'fecha_fin', 'fecha_objetivo'])
  campo!: string;

  @IsDateString()
  fechaNueva!: string;

  @IsString()
  @MinLength(3)
  justificacion!: string;

  // Temporal (Fase 3): quién hace el cambio. En la Fase 4 pasará a ser el usuario
  // autenticado (FK a Usuario) y solo un Administrador podrá invocar este flujo.
  @IsOptional()
  @IsString()
  usuarioId?: string;
}
