import { CifradoService } from './cifrado.service';

describe('CifradoService (AES-256-GCM)', () => {
  const servicio = new CifradoService();

  beforeAll(() => {
    process.env.CIFRADO_2FA_SECRET = 'secreto-de-prueba-para-cifrado';
  });

  it('cifra y descifra (round-trip) sin exponer el texto', () => {
    const secretoTotp = 'JBSWY3DPEHPK3PXP';
    const cifrado = servicio.cifrar(secretoTotp);
    expect(cifrado).not.toContain(secretoTotp);
    expect(servicio.descifrar(cifrado)).toBe(secretoTotp);
  });

  it('produce cifrados distintos para el mismo texto (IV aleatorio)', () => {
    const a = servicio.cifrar('mismo-texto');
    const b = servicio.cifrar('mismo-texto');
    expect(a).not.toBe(b);
  });
});
