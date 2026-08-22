import { PartialType } from '@nestjs/mapped-types';
import { CrearFaseDto } from './crear-fase.dto';

export class ActualizarFaseDto extends PartialType(CrearFaseDto) {}
