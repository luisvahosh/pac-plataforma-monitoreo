import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CrearEnlaceDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsString()
  avanceId?: string;
}
