import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ReglaAlertaService } from './regla-alerta.service';
import { NotificacionService } from './notificacion.service';
import { ActualizarReglaAlertaDto } from './dto/actualizar-regla-alerta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Configuración de alertas y consulta de notificaciones: solo Administrador.
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class NotificacionController {
  constructor(
    private readonly reglas: ReglaAlertaService,
    private readonly notificaciones: NotificacionService,
  ) {}

  @Get('reglas-alerta')
  obtenerRegla() {
    return this.reglas.obtener();
  }

  @Put('reglas-alerta')
  actualizarRegla(@Body() dto: ActualizarReglaAlertaDto) {
    return this.reglas.actualizar(dto.diasAnticipacion, dto.activo);
  }

  @Get('notificaciones/enviadas')
  enviadas() {
    return this.notificaciones.listarEnviadas();
  }

  // Disparo manual de la evaluación (útil para pruebas / operación).
  @Post('notificaciones/evaluar')
  evaluar() {
    return this.notificaciones.evaluarVencimientos();
  }
}
