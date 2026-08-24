import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NotaService } from './nota.service';
import { CrearNotaDto } from './dto/crear-nota.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtPayload } from '../auth/tipos';

// Escritura: requiere sesión (colaborador o administrador).
@Controller('notas')
@UseGuards(JwtAuthGuard)
export class NotaController {
  constructor(private readonly notas: NotaService) {}

  @Post()
  crear(@Body() dto: CrearNotaDto, @UsuarioActual() usuario: JwtPayload) {
    return this.notas.crear(usuario.sub, dto);
  }

  @Patch(':id/resolver')
  resolver(@Param('id') id: string) {
    return this.notas.marcarResuelta(id, true);
  }

  @Patch(':id/reabrir')
  reabrir(@Param('id') id: string) {
    return this.notas.marcarResuelta(id, false);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: JwtPayload) {
    return this.notas.eliminar(id, usuario.sub, usuario.rol === 'administrador');
  }
}
