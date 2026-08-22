import { Module } from '@nestjs/common';
import { FaseController } from './fase.controller';
import { FaseService } from './fase.service';

@Module({
  controllers: [FaseController],
  providers: [FaseService],
  exports: [FaseService],
})
export class FaseModule {}
