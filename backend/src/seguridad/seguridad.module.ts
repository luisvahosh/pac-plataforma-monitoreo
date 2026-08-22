import { Global, Module } from '@nestjs/common';
import { HashService } from './hash.service';
import { CifradoService } from './cifrado.service';
import { TotpService } from './totp.service';

@Global()
@Module({
  providers: [HashService, CifradoService, TotpService],
  exports: [HashService, CifradoService, TotpService],
})
export class SeguridadModule {}
