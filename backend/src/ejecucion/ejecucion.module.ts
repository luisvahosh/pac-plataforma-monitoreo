import { Module } from '@nestjs/common';
import { AvanceModule } from '../avance/avance.module';
import { EjecucionController } from './ejecucion.controller';
import { EjecucionService } from './ejecucion.service';

@Module({
  imports: [AvanceModule],
  controllers: [EjecucionController],
  providers: [EjecucionService],
})
export class EjecucionModule {}
