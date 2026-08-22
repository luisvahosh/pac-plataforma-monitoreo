import { IsString } from 'class-validator';

export class ActivarCuentaDto {
  @IsString()
  token!: string;

  // La longitud/complejidad mínima se valida en el servicio (parametrizable, PA-18).
  @IsString()
  password!: string;
}
