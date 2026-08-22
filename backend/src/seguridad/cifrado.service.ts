import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

// Cifrado en reposo del secreto TOTP con AES-256-GCM (RNF-SEC-02).
// La clave se deriva de la variable de entorno CIFRADO_2FA_SECRET.
@Injectable()
export class CifradoService {
  private clave(): Buffer {
    const secreto = process.env.CIFRADO_2FA_SECRET ?? '';
    // Deriva 32 bytes deterministas a partir del secreto de entorno.
    return createHash('sha256').update(secreto).digest();
  }

  cifrar(textoPlano: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.clave(), iv);
    const cifrado = Buffer.concat([cipher.update(textoPlano, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString('base64'), tag.toString('base64'), cifrado.toString('base64')].join(':');
  }

  descifrar(dato: string): string {
    const [ivB64, tagB64, cifradoB64] = dato.split(':');
    const decipher = createDecipheriv('aes-256-gcm', this.clave(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(cifradoB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
}
