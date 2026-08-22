import { PartialType } from '@nestjs/mapped-types';
import { CrearProyectoDto } from './crear-proyecto.dto';

export class ActualizarProyectoDto extends PartialType(CrearProyectoDto) {}
