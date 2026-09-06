import { IsOptional, IsString, MaxLength } from 'class-validator';

// Riesgos asociados a la Actividad (texto libre). Se permite cadena vacía o
// ausencia para "sin riesgos anotados".
export class ActualizarRiesgosSubactividadDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  riesgos?: string;
}
