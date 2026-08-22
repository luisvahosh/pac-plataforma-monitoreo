import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ActualizarProyectoDto } from './dto/actualizar-proyecto.dto';

// NOTA (temporal, Fase 3): las operaciones de escritura NO tienen autenticación
// todavía. La protección por rol (solo Administrador) se añade en la Fase 4.
// No desplegar públicamente estos endpoints de escritura hasta entonces.
@Controller('proyectos')
export class ProyectoController {
  constructor(private readonly proyectos: ProyectoService) {}

  @Post()
  crear(@Body() dto: CrearProyectoDto) {
    return this.proyectos.crear(dto);
  }

  @Get()
  listar() {
    return this.proyectos.listar();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.proyectos.obtener(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarProyectoDto) {
    return this.proyectos.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.proyectos.eliminar(id);
  }
}
