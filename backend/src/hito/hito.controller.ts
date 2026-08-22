import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { HitoService } from './hito.service';
import { CrearHitoDto } from './dto/crear-hito.dto';
import { ActualizarHitoDto } from './dto/actualizar-hito.dto';

// NOTA (temporal, Fase 3): escritura sin autenticación; se protege en la Fase 4.
@Controller('hitos')
export class HitoController {
  constructor(private readonly hitos: HitoService) {}

  @Post()
  crear(@Body() dto: CrearHitoDto) {
    return this.hitos.crear(dto);
  }

  // GET /api/hitos?actividadId=...
  @Get()
  listar(@Query('actividadId') actividadId: string) {
    return this.hitos.listarPorActividad(actividadId);
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.hitos.obtener(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarHitoDto) {
    return this.hitos.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.hitos.eliminar(id);
  }
}
