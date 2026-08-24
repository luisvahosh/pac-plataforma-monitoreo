import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SubactividadService } from './subactividad.service';
import { RegistrarAvanceSubactividadDto } from './dto/registrar-avance-subactividad.dto';
import { CrearSubactividadDto } from './dto/crear-subactividad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// Requiere sesión; el servicio verifica que el Colaborador esté asignado (a
// la subactividad o a su actividad padre). Crear subactividades es solo de
// Administrador. El Administrador puede reportar sobre cualquiera.
@Controller()
@UseGuards(JwtAuthGuard)
export class SubactividadController {
  constructor(private readonly subactividades: SubactividadService) {}

  // GET /api/actividades/:actividadId/subactividades
  @Get('actividades/:actividadId/subactividades')
  listar(@Param('actividadId') actividadId: string) {
    return this.subactividades.listarPorActividad(actividadId);
  }

  // POST /api/actividades/:actividadId/subactividades
  @Post('actividades/:actividadId/subactividades')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  crear(@Param('actividadId') actividadId: string, @Body() dto: CrearSubactividadDto) {
    return this.subactividades.crear(actividadId, dto.descripcion);
  }

  @Post('subactividades/:id/avances')
  registrarAvance(
    @Param('id') id: string,
    @Body() dto: RegistrarAvanceSubactividadDto,
    @UsuarioActual() usuario: JwtPayload,
  ) {
    return this.subactividades.registrarAvance(
      id,
      usuario.sub,
      usuario.rol === 'administrador',
      dto,
    );
  }

  @Get('subactividades/:id/avances')
  historial(@Param('id') id: string, @UsuarioActual() usuario: JwtPayload) {
    return this.subactividades.historial(id, usuario.sub, usuario.rol === 'administrador');
  }
}
