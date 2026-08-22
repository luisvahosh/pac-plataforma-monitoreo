import { authenticator } from 'otplib';
import { TotpService } from './totp.service';

describe('TotpService (RFC 6238)', () => {
  const servicio = new TotpService();

  it('verifica un código válido y rechaza uno inválido', () => {
    const secreto = servicio.generarSecreto();
    const codigoValido = authenticator.generate(secreto);
    expect(servicio.verificar(codigoValido, secreto)).toBe(true);
    expect(servicio.verificar('000000', secreto)).toBe(false);
  });

  it('genera un URI otpauth para el enrolamiento', () => {
    const uri = servicio.uriOtpauth('usuario@ejemplo.com', servicio.generarSecreto());
    expect(uri.startsWith('otpauth://totp/')).toBe(true);
  });
});
