import { Module } from '@nestjs/common';
import { LineaBaseController } from './linea-base.controller';
import { LineaBaseService } from './linea-base.service';

@Module({
  controllers: [LineaBaseController],
  providers: [LineaBaseService],
})
export class LineaBaseModule {}
