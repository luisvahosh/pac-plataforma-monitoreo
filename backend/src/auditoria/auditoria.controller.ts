import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Consulta de auditoría: solo Administrador, solo lectura (RN-18).
@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class AuditoriaController {
  constructor(private readonly auditoria: AuditoriaService) {}

  @Get()
  consultar(
    @Query('usuarioId') usuarioId?: string,
    @Query('entidadTipo') entidadTipo?: string,
    @Query('entidadId') entidadId?: string,
    @Query('accion') accion?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('limite') limite?: string,
    @Query('offset') offset?: string,
  ) {
    return this.auditoria.consultar({
      usuarioId,
      entidadTipo,
      entidadId,
      accion,
      desde,
      hasta,
      limite: limite ? Number(limite) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }
}
