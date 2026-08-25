import {
  avanceActividadPonderado,
  avanceEntregablePonderado,
  avanceFase,
  avanceProyecto,
  sumaPesosFases,
  validarPesosFases,
} from './calculo-avance';

describe('calculo-avance (RN-02)', () => {
  describe('avanceFase — promedio simple', () => {
    it('fase vacía devuelve 0', () => {
      expect(avanceFase([])).toBe(0);
    });

    it('promedia sin importar el número de actividades', () => {
      expect(avanceFase([{ avancePorcentaje: 0 }, { avancePorcentaje: 100 }])).toBe(50);
      expect(
        avanceFase([{ avancePorcentaje: 30 }, { avancePorcentaje: 60 }, { avancePorcentaje: 90 }]),
      ).toBe(60);
    });

    it('maneja 0 % y 100 %', () => {
      expect(avanceFase([{ avancePorcentaje: 0 }])).toBe(0);
      expect(avanceFase([{ avancePorcentaje: 100 }])).toBe(100);
    });
  });

  describe('avanceEntregablePonderado — suma ponderada por peso de Actividad', () => {
    it('entregable sin actividades devuelve 0', () => {
      expect(avanceEntregablePonderado([])).toBe(0);
    });

    it('pondera por el peso de cada actividad', () => {
      // 85% elaboración al 100 % + 15% revisión al 0 % = 85 %
      expect(
        avanceEntregablePonderado([
          { pesoPorcentaje: 85, avancePorcentaje: 100 },
          { pesoPorcentaje: 15, avancePorcentaje: 0 },
        ]),
      ).toBe(85);
    });

    it('normaliza cuando los pesos no cuadran exactamente a 100', () => {
      expect(
        avanceEntregablePonderado([
          { pesoPorcentaje: 20, avancePorcentaje: 50 },
          { pesoPorcentaje: 20, avancePorcentaje: 100 },
        ]),
      ).toBe(75);
    });

    it('cae a promedio simple si todos los pesos son 0', () => {
      expect(
        avanceEntregablePonderado([
          { pesoPorcentaje: 0, avancePorcentaje: 40 },
          { pesoPorcentaje: 0, avancePorcentaje: 80 },
        ]),
      ).toBe(60);
    });
  });

  describe('validarPesosFases', () => {
    it('true cuando suman 100', () => {
      expect(validarPesosFases([{ pesoPorcentaje: 40 }, { pesoPorcentaje: 60 }])).toBe(true);
    });
    it('false cuando no suman 100', () => {
      expect(validarPesosFases([{ pesoPorcentaje: 40 }, { pesoPorcentaje: 40 }])).toBe(false);
    });
    it('false cuando no hay fases', () => {
      expect(validarPesosFases([])).toBe(false);
    });
    it('sumaPesosFases suma correctamente', () => {
      expect(sumaPesosFases([{ pesoPorcentaje: 25 }, { pesoPorcentaje: 75 }])).toBe(100);
    });
  });

  describe('avanceProyecto — ponderado por peso de Fase', () => {
    it('proyecto vacío devuelve 0', () => {
      expect(avanceProyecto([])).toBe(0);
    });

    it('pondera por el peso de cada Fase', () => {
      // Fase A (peso 70, avance 100) + Fase B (peso 30, avance 0) = 70
      const avance = avanceProyecto([
        { pesoPorcentaje: 70, actividades: [{ avancePorcentaje: 100 }] },
        { pesoPorcentaje: 30, actividades: [{ avancePorcentaje: 0 }] },
      ]);
      expect(avance).toBeCloseTo(70, 5);
    });

    it('el número de actividades por fase no altera el resultado (promedio simple interno)', () => {
      const avance = avanceProyecto([
        {
          pesoPorcentaje: 50,
          actividades: [
            { avancePorcentaje: 50 },
            { avancePorcentaje: 50 },
            { avancePorcentaje: 50 },
          ],
        },
        { pesoPorcentaje: 50, actividades: [{ avancePorcentaje: 100 }] },
      ]);
      // 0.5*50 + 0.5*100 = 75
      expect(avance).toBeCloseTo(75, 5);
    });

    it('lanza error si los pesos no suman 100 %', () => {
      expect(() =>
        avanceProyecto([
          { pesoPorcentaje: 40, actividades: [{ avancePorcentaje: 100 }] },
          { pesoPorcentaje: 40, actividades: [{ avancePorcentaje: 100 }] },
        ]),
      ).toThrow(/100 %/);
    });
  });

  describe('avanceActividadPonderado — por peso de colaborador (RN-08)', () => {
    it('sin aportes devuelve 0', () => {
      expect(avanceActividadPonderado([])).toBe(0);
    });

    it('un solo colaborador refleja su avance', () => {
      expect(
        avanceActividadPonderado([{ pesoTrabajoPorcentaje: 100, avancePorcentaje: 40 }]),
      ).toBeCloseTo(40, 5);
    });

    it('pondera por el peso de trabajo de cada colaborador', () => {
      // A (peso 70, avance 100) + B (peso 30, avance 0) = 70
      expect(
        avanceActividadPonderado([
          { pesoTrabajoPorcentaje: 70, avancePorcentaje: 100 },
          { pesoTrabajoPorcentaje: 30, avancePorcentaje: 0 },
        ]),
      ).toBeCloseTo(70, 5);
    });

    it('normaliza si los pesos aún no suman 100', () => {
      // pesos 30 y 30 (suma 60), avances 100 y 0 => 50
      expect(
        avanceActividadPonderado([
          { pesoTrabajoPorcentaje: 30, avancePorcentaje: 100 },
          { pesoTrabajoPorcentaje: 30, avancePorcentaje: 0 },
        ]),
      ).toBeCloseTo(50, 5);
    });
  });
});
