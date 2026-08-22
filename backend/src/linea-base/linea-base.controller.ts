import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { LineaBaseService } from './linea-base.service';
import { CrearCambioLineaBaseDto } from './dto/crear-cambio-linea-base.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// Cambiar la Línea Base es SOLO de Administrador (RN-07). El historial requiere sesión.
@Controller('linea-base')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LineaBaseController {
  constructor(private readonly lineaBase: LineaBaseService) {}

  @Post('cambios')
  @Roles('administrador')
  cambiar(@Body() dto: CrearCambioLineaBaseDto, @UsuarioActual() usuario: JwtPayload) {
    // El autor del cambio es el Administrador autenticado (RN-07).
    return this.lineaBase.cambiar({ ...dto, usuarioId: usuario.sub });
  }

  // GET /api/linea-base/cambios?entidadTipo=actividad&entidadId=...
  @Get('cambios')
  historial(
    @Query('entidadTipo') entidadTipo: 'actividad' | 'hito',
    @Query('entidadId') entidadId: string,
  ) {
    return this.lineaBase.historial(entidadTipo, entidadId);
  }
}
