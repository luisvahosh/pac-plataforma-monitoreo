import { Module } from '@nestjs/common';
import { EvidenciaController } from './evidencia.controller';
import { EvidenciaService } from './evidencia.service';

@Module({
  controllers: [EvidenciaController],
  providers: [EvidenciaService],
})
export class EvidenciaModule {}
