import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RegistrarAvanceDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje!: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
