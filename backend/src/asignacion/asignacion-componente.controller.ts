import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { CrearAsignacionComponenteDto } from './dto/crear-asignacion-componente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Distribución de responsabilidad por Componente (Fase). La lectura requiere
// sesión; la escritura es solo de Administrador (CU-04).
@Controller('fases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsignacionComponenteController {
  constructor(private readonly asignaciones: AsignacionService) {}

  @Post(':id/asignaciones-componente')
  @Roles('administrador')
  asignar(@Param('id') faseId: string, @Body() dto: CrearAsignacionComponenteDto) {
    return this.asignaciones.asignarComponente(faseId, dto);
  }

  @Get(':id/asignaciones-componente')
  listar(@Param('id') faseId: string) {
    return this.asignaciones.listarComponente(faseId);
  }

  @Delete(':faseId/asignaciones-componente/:asignacionId')
  @Roles('administrador')
  quitar(@Param('faseId') faseId: string, @Param('asignacionId') asignacionId: string) {
    return this.asignaciones.quitarComponente(faseId, asignacionId);
  }
}
