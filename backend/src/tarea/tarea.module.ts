import { Module } from '@nestjs/common';
import { AvanceModule } from '../avance/avance.module';
import { TareaController } from './tarea.controller';
import { TareaService } from './tarea.service';

@Module({
  imports: [AvanceModule],
  controllers: [TareaController],
  providers: [TareaService],
  exports: [TareaService],
})
export class TareaModule {}
