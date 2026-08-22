import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HitoService } from './hito.service';
import { CrearHitoDto } from './dto/crear-hito.dto';
import { ActualizarHitoDto } from './dto/actualizar-hito.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Requiere sesión; la escritura es solo de Administrador.
@Controller('hitos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HitoController {
  constructor(private readonly hitos: HitoService) {}

  @Post()
  @Roles('administrador')
  crear(@Body() dto: CrearHitoDto) {
    return this.hitos.crear(dto);
  }

  // GET /api/hitos?actividadId=...
  @Get()
  listar(@Query('actividadId') actividadId: string) {
    return this.hitos.listarPorActividad(actividadId);
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.hitos.obtener(id);
  }

  @Patch(':id')
  @Roles('administrador')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarHitoDto) {
    return this.hitos.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  eliminar(@Param('id') id: string) {
    return this.hitos.eliminar(id);
  }
}
