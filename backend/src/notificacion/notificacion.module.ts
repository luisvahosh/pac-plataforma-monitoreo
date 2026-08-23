import { Module } from '@nestjs/common';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { ReglaAlertaService } from './regla-alerta.service';
import { NotificacionScheduler } from './notificacion.scheduler';

@Module({
  controllers: [NotificacionController],
  providers: [NotificacionService, ReglaAlertaService, NotificacionScheduler],
  exports: [NotificacionService],
})
export class NotificacionModule {}
