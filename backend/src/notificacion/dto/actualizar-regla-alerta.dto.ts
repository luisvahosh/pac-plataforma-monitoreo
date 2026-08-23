import { ArrayNotEmpty, IsArray, IsBoolean, IsInt, Min } from 'class-validator';

export class ActualizarReglaAlertaDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(0, { each: true })
  diasAnticipacion!: number[];

  @IsBoolean()
  activo!: boolean;
}
