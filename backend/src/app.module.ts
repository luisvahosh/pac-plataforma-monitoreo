import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SeguridadModule } from './seguridad/seguridad.module';
import { CorreoModule } from './correo/correo.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { FaseModule } from './fase/fase.module';
import { ActividadModule } from './actividad/actividad.module';
import { HitoModule } from './hito/hito.module';
import { LineaBaseModule } from './linea-base/linea-base.module';
import { CronogramaModule } from './cronograma/cronograma.module';
import { AvanceModule } from './avance/avance.module';
import { AsignacionModule } from './asignacion/asignacion.module';
import { EvidenciaModule } from './evidencia/evidencia.module';

@Module({
  imports: [
    // Globales / transversales
    PrismaModule,
    SeguridadModule,
    CorreoModule,
    AuthModule,
    // Funcionales
    HealthModule,
    UsuarioModule,
    ProyectoModule,
    FaseModule,
    ActividadModule,
    HitoModule,
    LineaBaseModule,
    CronogramaModule,
    AvanceModule,
    AsignacionModule,
    EvidenciaModule,
  ],
})
export class AppModule {}
