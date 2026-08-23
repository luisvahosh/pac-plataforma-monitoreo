import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AvanceService } from './avance.service';
import { RegistrarAvanceDto } from './dto/registrar-avance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// Registro y consulta de avances. Requiere sesión; el servicio verifica que el
// Colaborador esté asignado (RN-10). El Administrador puede sobre cualquiera.
@Controller('actividades')
@UseGuards(JwtAuthGuard)
export class AvanceController {
  constructor(private readonly avances: AvanceService) {}

  @Post(':id/avances')
  registrar(
    @Param('id') actividadId: string,
    @Body() dto: RegistrarAvanceDto,
    @UsuarioActual() usuario: JwtPayload,
  ) {
    return this.avances.registrar(
      actividadId,
      usuario.sub,
      usuario.rol === 'administrador',
      dto,
    );
  }

  @Get(':id/avances')
  historial(@Param('id') actividadId: string, @UsuarioActual() usuario: JwtPayload) {
    return this.avances.historial(actividadId, usuario.sub, usuario.rol === 'administrador');
  }
}
