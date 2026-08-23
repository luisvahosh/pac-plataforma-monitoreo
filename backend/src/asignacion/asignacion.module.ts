import { Module } from '@nestjs/common';
import { AvanceModule } from '../avance/avance.module';
import { AsignacionController } from './asignacion.controller';
import { MiActividadController } from './mi-actividad.controller';
import { AsignacionService } from './asignacion.service';

@Module({
  imports: [AvanceModule],
  controllers: [AsignacionController, MiActividadController],
  providers: [AsignacionService],
})
export class AsignacionModule {}
