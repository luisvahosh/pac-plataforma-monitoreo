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
import { FaseService } from './fase.service';
import { CrearFaseDto } from './dto/crear-fase.dto';
import { ActualizarFaseDto } from './dto/actualizar-fase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Requiere sesión; la escritura es solo de Administrador.
@Controller('fases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FaseController {
  constructor(private readonly fases: FaseService) {}

  @Post()
  @Roles('administrador')
  crear(@Body() dto: CrearFaseDto) {
    return this.fases.crear(dto);
  }

  // GET /api/fases?proyectoId=...
  @Get()
  listar(@Query('proyectoId') proyectoId: string) {
    return this.fases.listarPorProyecto(proyectoId);
  }

  @Get('validar-pesos/:proyectoId')
  validarPesos(@Param('proyectoId') proyectoId: string) {
    return this.fases.validarPesos(proyectoId);
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.fases.obtener(id);
  }

  @Patch(':id')
  @Roles('administrador')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarFaseDto) {
    return this.fases.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  eliminar(@Param('id') id: string) {
    return this.fases.eliminar(id);
  }
}
