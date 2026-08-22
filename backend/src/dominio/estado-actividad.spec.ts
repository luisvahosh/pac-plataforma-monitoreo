import { derivarEstado, EntradaEstado } from './estado-actividad';

function enDias(desde: Date, dias: number): Date {
  return new Date(desde.getTime() + dias * 24 * 60 * 60 * 1000);
}

describe('derivarEstado (RN-03, RN-04)', () => {
  const ahora = new Date('2026-08-22T12:00:00.000Z');

  const base: EntradaEstado = {
    finalizada: false,
    avancePorcentaje: 10,
    fechaInicioPlan: enDias(ahora, -10),
    fechaFinPlan: enDias(ahora, 30),
  };

  it('finalizada excluye vencida/próxima (RN-04)', () => {
    expect(
      derivarEstado({ ...base, finalizada: true, fechaFinPlan: enDias(ahora, -5) }, ahora),
    ).toBe('finalizada');
  });

  it('avance 100 % se considera finalizada', () => {
    expect(derivarEstado({ ...base, avancePorcentaje: 100 }, ahora)).toBe('finalizada');
  });

  it('fecha de fin pasada y no finalizada => vencida', () => {
    expect(derivarEstado({ ...base, fechaFinPlan: enDias(ahora, -1) }, ahora)).toBe('vencida');
  });

  it('dentro del umbral (7 días por defecto) => próxima a vencer', () => {
    expect(derivarEstado({ ...base, fechaFinPlan: enDias(ahora, 7) }, ahora)).toBe(
      'proxima_a_vencer',
    );
    expect(derivarEstado({ ...base, fechaFinPlan: enDias(ahora, 3) }, ahora)).toBe(
      'proxima_a_vencer',
    );
    expect(derivarEstado({ ...base, fechaFinPlan: enDias(ahora, 1) }, ahora)).toBe(
      'proxima_a_vencer',
    );
  });

  it('fuera del umbral, con inicio pasado => en ejecución', () => {
    expect(derivarEstado({ ...base, fechaFinPlan: enDias(ahora, 30) }, ahora)).toBe('en_ejecucion');
  });

  it('sin iniciar y sin avance => pendiente', () => {
    expect(
      derivarEstado(
        {
          finalizada: false,
          avancePorcentaje: 0,
          fechaInicioPlan: enDias(ahora, 5),
          fechaFinPlan: enDias(ahora, 40),
        },
        ahora,
      ),
    ).toBe('pendiente');
  });

  it('el umbral es configurable', () => {
    // Con umbral de 15 días, algo a 10 días ya es "próxima a vencer".
    expect(derivarEstado({ ...base, fechaFinPlan: enDias(ahora, 10) }, ahora, 15)).toBe(
      'proxima_a_vencer',
    );
    // Con umbral por defecto (7), lo mismo a 10 días es "en ejecución".
    expect(derivarEstado({ ...base, fechaFinPlan: enDias(ahora, 10) }, ahora)).toBe('en_ejecucion');
  });
});
