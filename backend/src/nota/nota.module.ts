import { Module } from '@nestjs/common';
import { NotaController } from './nota.controller';
import { NotaPublicaController } from './nota-publica.controller';
import { NotaService } from './nota.service';

@Module({
  controllers: [NotaController, NotaPublicaController],
  providers: [NotaService],
})
export class NotaModule {}
