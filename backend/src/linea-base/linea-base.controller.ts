import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LineaBaseService } from './linea-base.service';
import { CrearCambioLineaBaseDto } from './dto/crear-cambio-linea-base.dto';

// NOTA (temporal, Fase 3): este flujo cambia la Línea Base y, según RN-07, solo
// debe poder ejecutarlo un Administrador. La verificación de rol se añade en la
// Fase 4 (guard). El código está estructurado para insertar ese guard sin
// reescribir la lógica. No desplegar públicamente hasta entonces.
@Controller('linea-base')
export class LineaBaseController {
  constructor(private readonly lineaBase: LineaBaseService) {}

  @Post('cambios')
  cambiar(@Body() dto: CrearCambioLineaBaseDto) {
    return this.lineaBase.cambiar(dto);
  }

  // GET /api/linea-base/cambios?entidadTipo=actividad&entidadId=...
  @Get('cambios')
  historial(
    @Query('entidadTipo') entidadTipo: 'actividad' | 'hito',
    @Query('entidadId') entidadId: string,
  ) {
    return this.lineaBase.historial(entidadTipo, entidadId);
  }
}
