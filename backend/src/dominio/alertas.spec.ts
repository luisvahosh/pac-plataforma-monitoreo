import { evaluarAlerta } from './alertas';

function enDias(desde: Date, dias: number): Date {
  return new Date(desde.getTime() + dias * 24 * 60 * 60 * 1000);
}

describe('evaluarAlerta (RN-03, RN-11)', () => {
  const ahora = new Date('2026-08-22T12:00:00.000Z');
  const umbrales = [7, 3, 1];

  it('marca vencida si la fecha ya pasó', () => {
    const r = evaluarAlerta(enDias(ahora, -1), ahora, umbrales);
    expect(r.vencida).toBe(true);
    expect(r.umbralesAlcanzados).toEqual([]);
  });

  it('a 7 días alcanza el umbral 7', () => {
    expect(evaluarAlerta(enDias(ahora, 7), ahora, umbrales).umbralesAlcanzados).toEqual([7]);
  });

  it('a 3 días alcanza los umbrales 7 y 3', () => {
    expect(evaluarAlerta(enDias(ahora, 3), ahora, umbrales).umbralesAlcanzados).toEqual([7, 3]);
  });

  it('a 1 día alcanza los tres umbrales', () => {
    expect(evaluarAlerta(enDias(ahora, 1), ahora, umbrales).umbralesAlcanzados).toEqual([7, 3, 1]);
  });

  it('lejos del vencimiento no alcanza ningún umbral', () => {
    const r = evaluarAlerta(enDias(ahora, 30), ahora, umbrales);
    expect(r.vencida).toBe(false);
    expect(r.umbralesAlcanzados).toEqual([]);
  });
});
