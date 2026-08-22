import { IsIn, IsOptional, IsString } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsIn(['administrador', 'colaborador'])
  rol?: string;
}
