import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';

// TOTP estándar (RFC 6238), compatible con Microsoft Authenticator (ADR-0004).
@Injectable()
export class TotpService {
  generarSecreto(): string {
    return authenticator.generateSecret();
  }

  /** URI otpauth:// para el enrolamiento por QR en Microsoft Authenticator. */
  uriOtpauth(email: string, secreto: string, emisor = 'PAC Medellin'): string {
    return authenticator.keyuri(email, emisor, secreto);
  }

  verificar(codigo: string, secreto: string): boolean {
    return authenticator.verify({ token: codigo, secret: secreto });
  }
}
