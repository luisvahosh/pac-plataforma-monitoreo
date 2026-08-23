// Desviación de cronograma: compara el avance REAL de una Actividad contra el
// avance que "debería" tener según el tiempo transcurrido en su Línea Base
// vigente (fechaInicioPlan → fechaFinPlan), asumiendo ritmo lineal.
//
// Es un indicador de gestión de proyectos COMPLEMENTARIO al Estado por fecha
// límite (RN-03/RN-04, en estado-actividad.ts): el Estado responde "¿qué tan
// cerca está el vencimiento?"; la desviación responde "¿vamos al ritmo que
// tocaría a estas alturas?". Una actividad puede no estar "próxima a vencer"
// y aun así llevar mucho menos avance del que le correspondería hoy.
//
// No es una desviación estándar estadística: es la brecha en puntos
// porcentuales entre avance real y avance esperado, análoga a la variación de
// cronograma de Valor Ganado (EVM), expresada de forma simple.

export type EstadoCronograma = 'sin_iniciar' | 'completada' | 'en_tiempo' | 'en_riesgo' | 'atrasada';

export interface EntradaDesviacion {
  avancePorcentaje: number;
  finalizada: boolean;
  fechaInicioPlan: Date | null;
  fechaFinPlan: Date | null;
}

export interface ResultadoDesviacion {
  avanceEsperado: number | null; // null si no hay línea base (fechas) para calcularlo
  desviacion: number | null; // avanceReal - avanceEsperado; negativo = atrasada
  estadoCronograma: EstadoCronograma;
}

/** Umbral por defecto (en puntos porcentuales) para pasar de "en riesgo" a "atrasada". */
export const UMBRAL_EN_RIESGO_PUNTOS_DEFECTO = 15;

/** Umbral por defecto para considerar una desviación "crítica" (alertable). */
export const UMBRAL_DESVIACION_CRITICA_PUNTOS_DEFECTO = 20;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_POR_DIA);
}

/**
 * Calcula el avance esperado y la desviación de una Actividad respecto a su
 * Línea Base vigente. Sin fecha de inicio o de fin, no hay base de
 * comparación posible (avanceEsperado/desviacion quedan en null).
 */
export function calcularDesviacion(
  act: EntradaDesviacion,
  ahora: Date = new Date(),
  umbralEnRiesgoPuntos: number = UMBRAL_EN_RIESGO_PUNTOS_DEFECTO,
): ResultadoDesviacion {
  if (act.finalizada || act.avancePorcentaje >= 100) {
    return { avanceEsperado: 100, desviacion: 0, estadoCronograma: 'completada' };
  }

  const { fechaInicioPlan: inicio, fechaFinPlan: fin } = act;
  if (!inicio || !fin) {
    return { avanceEsperado: null, desviacion: null, estadoCronograma: 'en_tiempo' };
  }

  if (ahora.getTime() < inicio.getTime()) {
    return { avanceEsperado: 0, desviacion: act.avancePorcentaje, estadoCronograma: 'sin_iniciar' };
  }

  const totalDias = diasEntre(inicio, fin) + 1;
  let avanceEsperado: number;
  if (totalDias <= 0 || ahora.getTime() >= fin.getTime()) {
    avanceEsperado = 100;
  } else {
    avanceEsperado = Math.round((diasEntre(inicio, ahora) / totalDias) * 10000) / 100;
  }

  const desviacion = Math.round((act.avancePorcentaje - avanceEsperado) * 100) / 100;
  const estadoCronograma: EstadoCronograma =
    desviacion >= 0 ? 'en_tiempo' : desviacion >= -umbralEnRiesgoPuntos ? 'en_riesgo' : 'atrasada';

  return { avanceEsperado, desviacion, estadoCronograma };
}
