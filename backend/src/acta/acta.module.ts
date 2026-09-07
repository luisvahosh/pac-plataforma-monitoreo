import { Module } from '@nestjs/common';
import { TareaModule } from '../tarea/tarea.module';
import { RiesgoModule } from '../riesgo/riesgo.module';
import { ActaController } from './acta.controller';
import { ActaPublicoController } from './acta-publico.controller';
import { ActaService } from './acta.service';

@Module({
  imports: [TareaModule, RiesgoModule],
  controllers: [ActaController, ActaPublicoController],
  providers: [ActaService],
})
export class ActaModule {}
