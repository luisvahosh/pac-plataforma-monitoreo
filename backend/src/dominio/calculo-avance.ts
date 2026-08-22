// Lógica pura de cálculo de Avance (RN-02). Sin dependencias de framework ni de
// base de datos, para que sea directamente testeable.
//
// Reglas (Fase 0):
//  - Avance de una Fase   = promedio simple de sus Actividades (sin importar cuántas tenga).
//  - Avance del Proyecto  = suma ponderada de las Fases por su peso; los pesos de
//                           las Fases suman 100 %.

export interface ActividadAvance {
  avancePorcentaje: number; // 0..100
}

export interface FaseAvance {
  pesoPorcentaje: number; // aporte de la Fase al Proyecto; el conjunto suma 100
  actividades: ActividadAvance[];
}

/** Promedio simple del avance de las Actividades de una Fase. Fase vacía => 0. */
export function avanceFase(actividades: ActividadAvance[]): number {
  if (actividades.length === 0) return 0;
  const suma = actividades.reduce((acc, a) => acc + a.avancePorcentaje, 0);
  return suma / actividades.length;
}

/** Suma de los pesos de un conjunto de Fases. */
export function sumaPesosFases(fases: Array<{ pesoPorcentaje: number }>): number {
  return fases.reduce((acc, f) => acc + f.pesoPorcentaje, 0);
}

/** Valida que los pesos de las Fases sumen 100 % (con tolerancia por decimales). */
export function validarPesosFases(
  fases: Array<{ pesoPorcentaje: number }>,
  tolerancia = 0.01,
): boolean {
  if (fases.length === 0) return false;
  return Math.abs(sumaPesosFases(fases) - 100) <= tolerancia;
}

/**
 * Avance del Proyecto = Σ (peso_fase/100 × avance_fase).
 * Exige que los pesos de las Fases sumen 100 % (RN-02); si no, lanza error.
 */
export function avanceProyecto(fases: FaseAvance[]): number {
  if (fases.length === 0) return 0;
  if (!validarPesosFases(fases)) {
    throw new Error(
      `La suma de los pesos de las Fases debe ser 100 %. Suma actual: ${sumaPesosFases(fases)} %.`,
    );
  }
  return fases.reduce((acc, f) => acc + (f.pesoPorcentaje / 100) * avanceFase(f.actividades), 0);
}
