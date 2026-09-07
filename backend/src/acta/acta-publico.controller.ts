import { Controller, Get, Param } from '@nestjs/common';
import { ActaService } from './acta.service';

// Consulta pública de actas: solo lectura, solo actas 'enviada', sin documentos
// anexos (los anexos son privados, RN-06/13). Sin guardas de autenticación.
@Controller('public/actas')
export class ActaPublicoController {
  constructor(private readonly actas: ActaService) {}

  @Get()
  listar() {
    return this.actas.listarPublicas();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.actas.obtenerPublica(id);
  }
}
