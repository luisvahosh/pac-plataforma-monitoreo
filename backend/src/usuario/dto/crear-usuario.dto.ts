import { IsEmail, IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsIn(['administrador', 'colaborador'])
  rol!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+()\-\s]{7,20}$/, { message: 'Celular inválido' })
  celular?: string;
}
