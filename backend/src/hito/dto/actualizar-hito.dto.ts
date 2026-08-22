import { PartialType } from '@nestjs/mapped-types';
import { CrearHitoDto } from './crear-hito.dto';

export class ActualizarHitoDto extends PartialType(CrearHitoDto) {}
