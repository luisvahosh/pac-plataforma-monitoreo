import { Controller, Get, Query } from '@nestjs/common';
import { NotaService } from './nota.service';

// Lectura pública: la pestaña "Pendientes y notas" del tablero público no
// requiere sesión (solo crear/resolver/eliminar la requieren).
@Controller('public/notas')
export class NotaPublicaController {
  constructor(private readonly notas: NotaService) {}

  // GET /api/public/notas?actividadId=...
  @Get()
  listar(@Query('actividadId') actividadId?: string) {
    return this.notas.listar(actividadId);
  }
}
