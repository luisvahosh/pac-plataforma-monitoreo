import { IsEmail, IsString } from 'class-validator';

export class SolicitarRecuperacionDto {
  @IsEmail()
  email!: string;
}

export class RestablecerPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  password!: string;
}
