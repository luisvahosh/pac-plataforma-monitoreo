import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { FaseService } from './fase.service';
import { CrearFaseDto } from './dto/crear-fase.dto';
import { ActualizarFaseDto } from './dto/actualizar-fase.dto';

// NOTA (temporal, Fase 3): escritura sin autenticación; se protege en la Fase 4.
@Controller('fases')
export class FaseController {
  constructor(private readonly fases: FaseService) {}

  @Post()
  crear(@Body() dto: CrearFaseDto) {
    return this.fases.crear(dto);
  }

  // GET /api/fases?proyectoId=...
  @Get()
  listar(@Query('proyectoId') proyectoId: string) {
    return this.fases.listarPorProyecto(proyectoId);
  }

  @Get('validar-pesos/:proyectoId')
  validarPesos(@Param('proyectoId') proyectoId: string) {
    return this.fases.validarPesos(proyectoId);
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.fases.obtener(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarFaseDto) {
    return this.fases.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.fases.eliminar(id);
  }
}
