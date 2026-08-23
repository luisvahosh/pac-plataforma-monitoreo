import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaInterceptor } from './auditoria.interceptor';

// Global: el interceptor de auditoría se aplica a toda la aplicación (RN-17).
@Global()
@Module({
  controllers: [AuditoriaController],
  providers: [AuditoriaService, { provide: APP_INTERCEPTOR, useClass: AuditoriaInterceptor }],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
