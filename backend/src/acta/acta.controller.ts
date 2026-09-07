import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ActaService } from './acta.service';
import { ActualizarActaDto } from './dto/actualizar-acta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Gestión de Actas: TODO requiere sesión y rol Administrador (RN-ACTA-04). La
// consulta pública va aparte por /api/public/actas (ActaPublicoController).
@Controller('actas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class ActaController {
  constructor(private readonly actas: ActaService) {}

  @Get()
  listar() {
    return this.actas.listar();
  }

  // Contexto para armar una nueva acta (acta anterior, pendientes, riesgos).
  @Get('contexto')
  contexto() {
    return this.actas.contexto();
  }

  @Post()
  crear() {
    return this.actas.crearBorrador();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.actas.obtener(id);
  }

  @Get(':id/resumen')
  resumen(@Param('id') id: string) {
    return this.actas.resumen(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarActaDto) {
    return this.actas.actualizar(id, dto);
  }

  @Post(':id/enviar')
  enviar(@Param('id') id: string) {
    return this.actas.enviar(id);
  }

  @Post(':id/reabrir')
  reabrir(@Param('id') id: string) {
    return this.actas.reabrir(id);
  }
}
