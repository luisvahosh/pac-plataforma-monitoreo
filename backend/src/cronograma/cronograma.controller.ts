import { Controller, Get, Param, Query } from '@nestjs/common';
import { CronogramaService } from './cronograma.service';

// Endpoints PÚBLICOS de solo lectura (Dashboard Público). No exponen contenido
// de Evidencias (que llegan en fases posteriores y son siempre privadas).
@Controller('public/proyectos')
export class CronogramaController {
  constructor(private readonly cronograma: CronogramaService) {}

  // Dashboard del proyecto único, en una sola llamada (para el frontend público).
  @Get('dashboard')
  dashboard(@Query('umbralDias') umbralDias?: string) {
    return this.cronograma.dashboardPublico(umbralDias ? Number(umbralDias) : undefined);
  }

  @Get(':proyectoId/cronograma')
  obtenerCronograma(
    @Param('proyectoId') proyectoId: string,
    @Query('umbralDias') umbralDias?: string,
  ) {
    return this.cronograma.cronograma(proyectoId, umbralDias ? Number(umbralDias) : undefined);
  }

  @Get(':proyectoId/indicadores')
  obtenerIndicadores(
    @Param('proyectoId') proyectoId: string,
    @Query('umbralDias') umbralDias?: string,
    @Query('umbralDesviacionCritica') umbralDesviacionCritica?: string,
  ) {
    return this.cronograma.indicadores(
      proyectoId,
      umbralDias ? Number(umbralDias) : undefined,
      umbralDesviacionCritica ? Number(umbralDesviacionCritica) : undefined,
    );
  }
}
