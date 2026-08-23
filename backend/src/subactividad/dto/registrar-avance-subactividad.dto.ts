import { IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class RegistrarAvanceSubactividadDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje!: number;

  @IsOptional()
  @IsUrl()
  enlaceEvidencia?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
