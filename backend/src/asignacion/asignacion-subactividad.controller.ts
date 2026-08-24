import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Asignación de responsables a nivel de Subactividad (el trabajo real). La
// escritura es solo de Administrador.
@Controller('subactividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsignacionSubactividadController {
  constructor(private readonly asignaciones: AsignacionService) {}

  @Post(':id/asignaciones')
  @Roles('administrador')
  asignar(@Param('id') subactividadId: string, @Body() dto: CrearAsignacionDto) {
    return this.asignaciones.asignarSubactividad(subactividadId, dto);
  }

  @Get(':id/asignaciones')
  listar(@Param('id') subactividadId: string) {
    return this.asignaciones.listarSubactividad(subactividadId);
  }

  @Delete(':subactividadId/asignaciones/:asignacionId')
  @Roles('administrador')
  quitar(
    @Param('subactividadId') subactividadId: string,
    @Param('asignacionId') asignacionId: string,
  ) {
    return this.asignaciones.quitarSubactividad(subactividadId, asignacionId);
  }
}
