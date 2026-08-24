import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { SubactividadModule } from './subactividad/subactividad.module';
import { AsignacionModule } from './asignacion/asignacion.module';
import { EvidenciaModule } from './evidencia/evidencia.module';
import { NotificacionModule } from './notificacion/notificacion.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [
    // Globales / transversales
    ScheduleModule.forRoot(),
    // Rate limiting global: 100 req/min por IP por defecto (Fase 12).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    SeguridadModule,
    CorreoModule,
    AuthModule,
    AuditoriaModule,
    // Funcionales
    HealthModule,
    UsuarioModule,
    ProyectoModule,
    FaseModule,
    ActividadModule,
    HitoModule,
    LineaBaseModule,
    CronogramaModule,
    NotificacionModule,
    AvanceModule,
    SubactividadModule,
    AsignacionModule,
    EvidenciaModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
