import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EjecucionService } from './ejecucion.service';
import { CrearEjecucionDto } from './dto/crear-ejecucion.dto';
import { RegistrarAvanceEjecucionDto } from './dto/registrar-avance-ejecucion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// Subactividades de ejecución (nivel 4). Requiere sesión. Crear es solo
// Administrador (nace en las actas). Reportar avance: el responsable o admin.
@Controller()
@UseGuards(JwtAuthGuard)
export class EjecucionController {
  constructor(private readonly ejecuciones: EjecucionService) {}

  @Get('subactividades/:subactividadId/ejecuciones')
  listar(@Param('subactividadId') subactividadId: string) {
    return this.ejecuciones.listarPorActividad(subactividadId);
  }

  @Post('subactividades/:subactividadId/ejecuciones')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  crear(@Param('subactividadId') subactividadId: string, @Body() dto: CrearEjecucionDto) {
    return this.ejecuciones.crear(subactividadId, dto);
  }

  @Post('ejecuciones/:id/avances')
  registrarAvance(
    @Param('id') id: string,
    @Body() dto: RegistrarAvanceEjecucionDto,
    @UsuarioActual() usuario: JwtPayload,
  ) {
    return this.ejecuciones.registrarAvance(id, usuario.sub, usuario.rol === 'administrador', dto);
  }

  @Get('ejecuciones/:id/avances')
  historial(@Param('id') id: string, @UsuarioActual() usuario: JwtPayload) {
    return this.ejecuciones.historial(id, usuario.sub, usuario.rol === 'administrador');
  }

  // Subactividades de ejecución del colaborador autenticado (para "Mis actividades").
  @Get('mis-ejecuciones')
  mias(@UsuarioActual() usuario: JwtPayload) {
    return this.ejecuciones.listarPorUsuario(usuario.sub);
  }
}
