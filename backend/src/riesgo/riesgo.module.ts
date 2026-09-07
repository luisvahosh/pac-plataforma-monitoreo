import { Module } from '@nestjs/common';
import { RiesgoController } from './riesgo.controller';
import { RiesgoService } from './riesgo.service';

@Module({
  controllers: [RiesgoController],
  providers: [RiesgoService],
  exports: [RiesgoService],
})
export class RiesgoModule {}
