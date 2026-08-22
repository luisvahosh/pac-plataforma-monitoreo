import { Injectable } from '@nestjs/common';
import { Algorithm, hash, verify } from '@node-rs/argon2';

// Hashing de contraseñas con Argon2id (RN-16, RNF-SEC-02). Se usa @node-rs/argon2
// (binarios precompilados, sin node-gyp) para evitar problemas de build en Alpine.
@Injectable()
export class HashService {
  hashPassword(plano: string): Promise<string> {
    return hash(plano, { algorithm: Algorithm.Argon2id });
  }

  verificarPassword(hashAlmacenado: string, plano: string): Promise<boolean> {
    return verify(hashAlmacenado, plano);
  }
}
