import { IsNumber, IsString, Max, Min } from 'class-validator';

export class CrearAsignacionDto {
  @IsString()
  usuarioId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  pesoTrabajoPorcentaje!: number;
}
