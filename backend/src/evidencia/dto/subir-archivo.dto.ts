import { IsIn, IsOptional, IsString } from 'class-validator';

export class SubirArchivoDto {
  // El tipo lo indica quien sube: imagen, archivo adjunto o documento de soporte.
  @IsIn(['imagen', 'archivo', 'documento'])
  tipo!: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsString()
  avanceId?: string;
}
