import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RiesgoService } from './riesgo.service';
import { CrearRiesgoDto } from './dto/crear-riesgo.dto';
import { ActualizarRiesgoDto } from './dto/actualizar-riesgo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Riesgos por actividad. Requiere sesión; crear/actualizar es solo Administrador.
@Controller()
@UseGuards(JwtAuthGuard)
export class RiesgoController {
  constructor(private readonly riesgos: RiesgoService) {}

  @Get('subactividades/:subactividadId/riesgos')
  listar(@Param('subactividadId') subactividadId: string) {
    return this.riesgos.listarPorActividad(subactividadId);
  }

  @Post('subactividades/:subactividadId/riesgos')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  crear(@Param('subactividadId') subactividadId: string, @Body() dto: CrearRiesgoDto) {
    return this.riesgos.crear(subactividadId, dto);
  }

  @Patch('riesgos/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarRiesgoDto) {
    return this.riesgos.actualizar(id, dto);
  }
}
