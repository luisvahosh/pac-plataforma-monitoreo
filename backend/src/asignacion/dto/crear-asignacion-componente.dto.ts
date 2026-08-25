import { IsNumber, IsString, Max, Min } from 'class-validator';

export class CrearAsignacionComponenteDto {
  @IsString()
  usuarioId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  pesoPorcentaje!: number;
}
