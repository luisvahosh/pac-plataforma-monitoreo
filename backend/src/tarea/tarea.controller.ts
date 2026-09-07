import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TareaService } from './tarea.service';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { ActualizarTareaDto } from './dto/actualizar-tarea.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Tareas / compromisos. Requiere sesión; crear/actualizar es solo Administrador.
@Controller('tareas')
@UseGuards(JwtAuthGuard)
export class TareaController {
  constructor(private readonly tareas: TareaService) {}

  @Get()
  listar(
    @Query('actividadId') actividadId?: string,
    @Query('subactividadId') subactividadId?: string,
    @Query('actaOrigenId') actaOrigenId?: string,
  ) {
    return this.tareas.listar({ actividadId, subactividadId, actaOrigenId });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador')
  crear(@Body() dto: CrearTareaDto) {
    return this.tareas.crear(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarTareaDto) {
    return this.tareas.actualizar(id, dto);
  }
}
