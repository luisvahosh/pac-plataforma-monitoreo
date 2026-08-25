import { Module } from '@nestjs/common';
import { AvanceModule } from '../avance/avance.module';
import { AsignacionController } from './asignacion.controller';
import { AsignacionSubactividadController } from './asignacion-subactividad.controller';
import { AsignacionComponenteController } from './asignacion-componente.controller';
import { MiActividadController } from './mi-actividad.controller';
import { AsignacionService } from './asignacion.service';

@Module({
  imports: [AvanceModule],
  controllers: [
    AsignacionController,
    AsignacionSubactividadController,
    AsignacionComponenteController,
    MiActividadController,
  ],
  providers: [AsignacionService],
})
export class AsignacionModule {}
