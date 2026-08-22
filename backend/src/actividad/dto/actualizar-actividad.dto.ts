import { PartialType } from '@nestjs/mapped-types';
import { CrearActividadDto } from './crear-actividad.dto';

export class ActualizarActividadDto extends PartialType(CrearActividadDto) {}
