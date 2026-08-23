import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificacionService } from './notificacion.service';

// Scheduler de servidor (independiente del navegador). Evalúa el cronograma a
// diario y dispara las alertas de vencimiento. (En producción puede moverse al
// contenedor worker; ver ADR-0006.)
@Injectable()
export class NotificacionScheduler {
  private readonly logger = new Logger(NotificacionScheduler.name);

  constructor(private readonly notificaciones: NotificacionService) {}

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async evaluacionDiaria(): Promise<void> {
    try {
      await this.notificaciones.evaluarVencimientos();
    } catch (error) {
      this.logger.error('Error en la evaluación diaria de vencimientos', error as Error);
    }
  }
}
