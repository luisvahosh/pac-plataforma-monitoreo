import { extensionPermitida } from './evidencia.storage';

describe('extensionPermitida (lista blanca de archivos)', () => {
  it('acepta extensiones permitidas', () => {
    expect(extensionPermitida('foto.png')).toBe(true);
    expect(extensionPermitida('informe.PDF')).toBe(true);
    expect(extensionPermitida('datos.xlsx')).toBe(true);
  });

  it('rechaza extensiones no permitidas (posible ejecutable/script)', () => {
    expect(extensionPermitida('malicioso.exe')).toBe(false);
    expect(extensionPermitida('script.sh')).toBe(false);
    expect(extensionPermitida('sin-extension')).toBe(false);
  });
});
