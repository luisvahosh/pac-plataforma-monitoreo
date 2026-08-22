import { Module } from '@nestjs/common';
import { HitoController } from './hito.controller';
import { HitoService } from './hito.service';

@Module({
  controllers: [HitoController],
  providers: [HitoService],
})
export class HitoModule {}
