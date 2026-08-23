import { calcularDesviacion, EntradaDesviacion } from './desviacion-cronograma';

function enDias(desde: Date, dias: number): Date {
  return new Date(desde.getTime() + dias * 24 * 60 * 60 * 1000);
}

describe('calcularDesviacion (indicador complementario de gestión de proyectos)', () => {
  const ahora = new Date('2026-08-23T12:00:00.000Z');

  const base: EntradaDesviacion = {
    avancePorcentaje: 0,
    finalizada: false,
    fechaInicioPlan: enDias(ahora, -10), // empezó hace 10 días
    fechaFinPlan: enDias(ahora, 10), // termina en 10 días (total 21 días)
  };

  it('finalizada o avance 100% => completada, sin desviación', () => {
    expect(calcularDesviacion({ ...base, finalizada: true }, ahora)).toEqual({
      avanceEsperado: 100,
      desviacion: 0,
      estadoCronograma: 'completada',
    });
    expect(calcularDesviacion({ ...base, avancePorcentaje: 100 }, ahora).estadoCronograma).toBe(
      'completada',
    );
  });

  it('sin fecha de inicio o fin => no se puede calcular (null)', () => {
    const r = calcularDesviacion({ ...base, fechaInicioPlan: null }, ahora);
    expect(r.avanceEsperado).toBeNull();
    expect(r.desviacion).toBeNull();
  });

  it('aún no inicia => avance esperado 0; la desviación es el propio avance', () => {
    const r = calcularDesviacion(
      { ...base, avancePorcentaje: 5, fechaInicioPlan: enDias(ahora, 3) },
      ahora,
    );
    expect(r.estadoCronograma).toBe('sin_iniciar');
    expect(r.avanceEsperado).toBe(0);
    expect(r.desviacion).toBe(5);
  });

  it('avance igual o mejor que el esperado => en_tiempo', () => {
    // 10 de 21 días transcurridos ≈ 47.6% esperado
    const r = calcularDesviacion({ ...base, avancePorcentaje: 50 }, ahora);
    expect(r.avanceEsperado).toBeCloseTo(47.62, 1);
    expect(r.desviacion).toBeGreaterThanOrEqual(0);
    expect(r.estadoCronograma).toBe('en_tiempo');
  });

  it('un poco por debajo del esperado (dentro del umbral) => en_riesgo', () => {
    // esperado ~47.6%, avance 35% => desviación ~-12.6 (dentro de 15 por defecto)
    const r = calcularDesviacion({ ...base, avancePorcentaje: 35 }, ahora);
    expect(r.estadoCronograma).toBe('en_riesgo');
  });

  it('muy por debajo del esperado (fuera del umbral) => atrasada', () => {
    // esperado ~47.6%, avance 10% => desviación ~-37.6
    const r = calcularDesviacion({ ...base, avancePorcentaje: 10 }, ahora);
    expect(r.estadoCronograma).toBe('atrasada');
    expect(r.desviacion).toBeLessThan(-20);
  });

  it('fecha de fin ya pasada y no finalizada => avance esperado 100%', () => {
    const r = calcularDesviacion(
      { ...base, avancePorcentaje: 60, fechaFinPlan: enDias(ahora, -1) },
      ahora,
    );
    expect(r.avanceEsperado).toBe(100);
    expect(r.desviacion).toBe(-40);
    expect(r.estadoCronograma).toBe('atrasada');
  });

  it('el umbral de "en riesgo" es configurable', () => {
    // desviación ~-12.6: con umbral 10 pasa a "atrasada"; con el umbral por defecto (15) es "en_riesgo".
    const r1 = calcularDesviacion({ ...base, avancePorcentaje: 35 }, ahora, 10);
    expect(r1.estadoCronograma).toBe('atrasada');
    const r2 = calcularDesviacion({ ...base, avancePorcentaje: 35 }, ahora);
    expect(r2.estadoCronograma).toBe('en_riesgo');
  });
});
