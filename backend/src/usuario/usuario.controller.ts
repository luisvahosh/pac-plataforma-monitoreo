import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Gestión de usuarios: SOLO Administrador (RNF-SEC-05, sin autorregistro).
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class UsuarioController {
  constructor(private readonly usuarios: UsuarioService) {}

  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuarios.crear(dto);
  }

  @Get()
  listar() {
    return this.usuarios.listar();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.usuarios.obtener(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto) {
    return this.usuarios.actualizar(id, dto);
  }

  @Post(':id/desactivar')
  desactivar(@Param('id') id: string) {
    return this.usuarios.desactivar(id);
  }
}
