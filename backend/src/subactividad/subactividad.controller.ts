import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SubactividadService } from './subactividad.service';
import { RegistrarAvanceSubactividadDto } from './dto/registrar-avance-subactividad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// Requiere sesión; el servicio verifica que el Colaborador esté asignado a la
// actividad padre (RN-10). El Administrador puede sobre cualquiera.
@Controller()
@UseGuards(JwtAuthGuard)
export class SubactividadController {
  constructor(private readonly subactividades: SubactividadService) {}

  // GET /api/actividades/:actividadId/subactividades
  @Get('actividades/:actividadId/subactividades')
  listar(@Param('actividadId') actividadId: string) {
    return this.subactividades.listarPorActividad(actividadId);
  }

  @Post('subactividades/:id/avances')
  registrarAvance(
    @Param('id') id: string,
    @Body() dto: RegistrarAvanceSubactividadDto,
    @UsuarioActual() usuario: JwtPayload,
  ) {
    return this.subactividades.registrarAvance(id, usuario.sub, usuario.rol === 'administrador', dto);
  }

  @Get('subactividades/:id/avances')
  historial(@Param('id') id: string, @UsuarioActual() usuario: JwtPayload) {
    return this.subactividades.historial(id, usuario.sub, usuario.rol === 'administrador');
  }
}
