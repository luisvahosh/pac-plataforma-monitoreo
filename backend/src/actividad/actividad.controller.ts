import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { CrearActividadDto } from './dto/crear-actividad.dto';
import { ActualizarActividadDto } from './dto/actualizar-actividad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Requiere sesión; la escritura es solo de Administrador.
// (El registro de avances por Colaborador asignado llega en la Fase 5.)
@Controller('actividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadController {
  constructor(private readonly actividades: ActividadService) {}

  @Post()
  @Roles('administrador')
  crear(@Body() dto: CrearActividadDto) {
    return this.actividades.crear(dto);
  }

  // GET /api/actividades?faseId=...
  @Get()
  listar(@Query('faseId') faseId: string) {
    return this.actividades.listarPorFase(faseId);
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.actividades.obtener(id);
  }

  // GET /api/actividades/:id/estado?umbralDias=7
  @Get(':id/estado')
  estado(@Param('id') id: string, @Query('umbralDias') umbralDias?: string) {
    return this.actividades.estado(id, umbralDias ? Number(umbralDias) : undefined);
  }

  @Patch(':id')
  @Roles('administrador')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarActividadDto) {
    return this.actividades.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  eliminar(@Param('id') id: string) {
    return this.actividades.eliminar(id);
  }
}
