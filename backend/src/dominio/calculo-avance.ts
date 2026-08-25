// Lógica pura de cálculo de Avance (RN-02). Sin dependencias de framework ni de
// base de datos, para que sea directamente testeable.
//
// Reglas (Fase 0, actualizadas):
//  - Avance de un Entregable (Actividad de la BD) con Actividades desglosadas
//                           (Subactividades) = SUMA PONDERADA por el peso de cada
//                           Actividad; los pesos por Entregable suman 100 %.
//  - Avance de un Componente (Fase) = promedio simple de sus Entregables.
//  - Avance del Proyecto  = suma ponderada de los Componentes por su peso; los
//                           pesos de los Componentes suman 100 %.

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

// ─── Avance de un Entregable a partir de sus Actividades (Subactividades) ─

export interface ActividadPonderada {
  pesoPorcentaje: number; // peso de la Actividad dentro del Entregable (suman 100)
  avancePorcentaje: number; // 0..100
}

/**
 * Avance de un Entregable = Σ (peso_actividad/Σpesos × avance_actividad).
 * Se normaliza por la suma de pesos para ser robusto si aún no cuadran a 100.
 * Si todos los pesos son 0 (aún sin cuadrar), cae a promedio simple para no
 * perder la lectura del avance. Sin actividades => 0.
 */
export function avanceEntregablePonderado(actividades: ActividadPonderada[]): number {
  if (actividades.length === 0) return 0;
  const sumaPesos = actividades.reduce((acc, a) => acc + a.pesoPorcentaje, 0);
  if (sumaPesos === 0) {
    return avanceFase(actividades);
  }
  return actividades.reduce(
    (acc, a) => acc + (a.pesoPorcentaje / sumaPesos) * a.avancePorcentaje,
    0,
  );
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

// ─── Avance de una Actividad con varios Colaboradores (RN-02, RN-08) ─

export interface AporteColaborador {
  pesoTrabajoPorcentaje: number; // peso de trabajo del colaborador en la actividad
  avancePorcentaje: number; // último avance registrado por ese colaborador (0 si no hay)
}

/**
 * Avance de una Actividad ponderado por el peso de trabajo de cada Colaborador.
 * Se normaliza por la suma de pesos para ser robusto si aún no suman 100 %.
 * Sin aportes => 0.
 */
export function avanceActividadPonderado(aportes: AporteColaborador[]): number {
  if (aportes.length === 0) return 0;
  const sumaPesos = aportes.reduce((acc, a) => acc + a.pesoTrabajoPorcentaje, 0);
  if (sumaPesos === 0) return 0;
  return aportes.reduce(
    (acc, a) => acc + (a.pesoTrabajoPorcentaje / sumaPesos) * a.avancePorcentaje,
    0,
  );
}
