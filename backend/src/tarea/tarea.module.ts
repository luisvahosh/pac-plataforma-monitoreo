import { Module } from '@nestjs/common';
import { TareaController } from './tarea.controller';
import { TareaService } from './tarea.service';

@Module({
  controllers: [TareaController],
  providers: [TareaService],
  exports: [TareaService],
})
export class TareaModule {}
