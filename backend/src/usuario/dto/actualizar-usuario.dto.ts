import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsIn(['administrador', 'colaborador'])
  rol?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+()\-\s]{7,20}$/, { message: 'Celular inválido' })
  celular?: string;
}
