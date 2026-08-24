import { IsString, MinLength } from 'class-validator';

export class CrearSubactividadDto {
  @IsString()
  @MinLength(1)
  descripcion!: string;
}
