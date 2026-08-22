import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { FaseModule } from './fase/fase.module';
import { ActividadModule } from './actividad/actividad.module';
import { HitoModule } from './hito/hito.module';
import { LineaBaseModule } from './linea-base/linea-base.module';
import { CronogramaModule } from './cronograma/cronograma.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    ProyectoModule,
    FaseModule,
    ActividadModule,
    HitoModule,
    LineaBaseModule,
    CronogramaModule,
  ],
})
export class AppModule {}
