import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Asignación de Actividades. La escritura es solo de Administrador (CU-04).
@Controller('actividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsignacionController {
  constructor(private readonly asignaciones: AsignacionService) {}

  @Post(':id/asignaciones')
  @Roles('administrador')
  asignar(@Param('id') actividadId: string, @Body() dto: CrearAsignacionDto) {
    return this.asignaciones.asignar(actividadId, dto);
  }

  @Get(':id/asignaciones')
  listar(@Param('id') actividadId: string) {
    return this.asignaciones.listar(actividadId);
  }

  @Delete(':actividadId/asignaciones/:asignacionId')
  @Roles('administrador')
  quitar(
    @Param('actividadId') actividadId: string,
    @Param('asignacionId') asignacionId: string,
  ) {
    return this.asignaciones.quitar(actividadId, asignacionId);
  }
}
