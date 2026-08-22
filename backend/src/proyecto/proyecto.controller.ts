import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ActualizarProyectoDto } from './dto/actualizar-proyecto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Gestión del Proyecto: requiere sesión autenticada; la escritura es solo de
// Administrador (Fase 4). La consulta pública va por /api/public/**.
@Controller('proyectos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectoController {
  constructor(private readonly proyectos: ProyectoService) {}

  @Post()
  @Roles('administrador')
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
  @Roles('administrador')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarProyectoDto) {
    return this.proyectos.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  eliminar(@Param('id') id: string) {
    return this.proyectos.eliminar(id);
  }
}
