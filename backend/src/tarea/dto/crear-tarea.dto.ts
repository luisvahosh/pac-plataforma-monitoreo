import { IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

// Crear una Tarea (nivel 4) dentro de una Actividad (BD Subactividad, nivel 3).
export class CrearTareaDto {
  @IsString()
  usuarioId!: string; // responsable (debe estar asignado a la actividad)

  @IsString()
  @MinLength(1)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  // Peso absoluto de la tarea dentro de la actividad. La suma por colaborador no
  // puede superar su ponderado de asignación (RN-ACTA-06).
  @IsNumber()
  @Min(0)
  @Max(100)
  pesoPorcentaje!: number;

  @IsOptional()
  @IsString()
  fechaCompromiso?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  // Acta desde la que se crea (trazabilidad). Opcional para altas fuera de acta.
  @IsOptional()
  @IsString()
  actaOrigenId?: string;
}
