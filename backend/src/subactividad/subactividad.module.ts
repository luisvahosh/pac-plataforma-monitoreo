import { Module } from '@nestjs/common';
import { AvanceModule } from '../avance/avance.module';
import { SubactividadController } from './subactividad.controller';
import { SubactividadService } from './subactividad.service';

@Module({
  imports: [AvanceModule],
  controllers: [SubactividadController],
  providers: [SubactividadService],
})
export class SubactividadModule {}
