import { Controller, Get, UseGuards } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// "Mis actividades asignadas" para el Colaborador autenticado.
@Controller('mis-actividades')
@UseGuards(JwtAuthGuard)
export class MiActividadController {
  constructor(private readonly asignaciones: AsignacionService) {}

  @Get()
  mias(@UsuarioActual() usuario: JwtPayload) {
    return this.asignaciones.misActividades(usuario.sub);
  }
}
