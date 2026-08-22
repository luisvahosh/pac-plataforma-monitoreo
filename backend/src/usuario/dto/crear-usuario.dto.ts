import { IsEmail, IsIn, IsString } from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsIn(['administrador', 'colaborador'])
  rol!: string;
}
