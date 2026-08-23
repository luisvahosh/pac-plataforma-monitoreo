import { Module } from '@nestjs/common';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { AvanceController } from './avance.controller';
import { AvanceService } from './avance.service';

@Module({
  imports: [NotificacionModule],
  controllers: [AvanceController],
  providers: [AvanceService],
  exports: [AvanceService],
})
export class AvanceModule {}
