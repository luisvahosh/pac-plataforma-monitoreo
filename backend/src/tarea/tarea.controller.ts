import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TareaService } from './tarea.service';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { RegistrarAvanceTareaDto } from './dto/registrar-avance-tarea.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// Tareas (nivel 4). Requiere sesión. Crear es solo Administrador (nace en las
// actas). Reportar avance: el responsable o admin.
@Controller()
@UseGuards(JwtAuthGuard)
export class TareaController {
  constructor(private readonly tareas: TareaService) {}

  @Get('subactividades/:subactividadId/tareas')
  listar(@Param('subactividadId') subactividadId: string) {
    return this.tareas.listarPorActividad(subactividadId);
  }

  @Post('subactividades/:subactividadId/tareas')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  crear(@Param('subactividadId') subactividadId: string, @Body() dto: CrearTareaDto) {
    return this.tareas.crear(subactividadId, dto);
  }

  @Post('tareas/:id/avances')
  registrarAvance(
    @Param('id') id: string,
    @Body() dto: RegistrarAvanceTareaDto,
    @UsuarioActual() usuario: JwtPayload,
  ) {
    return this.tareas.registrarAvance(id, usuario.sub, usuario.rol === 'administrador', dto);
  }

  @Get('tareas/:id/avances')
  historial(@Param('id') id: string, @UsuarioActual() usuario: JwtPayload) {
    return this.tareas.historial(id, usuario.sub, usuario.rol === 'administrador');
  }

  // Tareas del colaborador autenticado (para "Mis actividades").
  @Get('mis-tareas')
  mias(@UsuarioActual() usuario: JwtPayload) {
    return this.tareas.listarPorUsuario(usuario.sub);
  }
}
