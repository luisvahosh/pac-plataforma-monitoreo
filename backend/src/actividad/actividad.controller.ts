import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { CrearActividadDto } from './dto/crear-actividad.dto';
import { ActualizarActividadDto } from './dto/actualizar-actividad.dto';

// NOTA (temporal, Fase 3): escritura sin autenticación; se protege en la Fase 4.
@Controller('actividades')
export class ActividadController {
  constructor(private readonly actividades: ActividadService) {}

  @Post()
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
  actualizar(@Param('id') id: string, @Body() dto: ActualizarActividadDto) {
    return this.actividades.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.actividades.eliminar(id);
  }
}
