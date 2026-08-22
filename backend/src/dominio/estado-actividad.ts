// Derivación pura del Estado de una Actividad (RN-03, RN-04).
// El umbral de "próxima a vencer" es CONFIGURABLE (PA-08/PA-12 aún abiertos):
// se recibe como parámetro con un valor por defecto documentado, nunca hardcodeado
// en la lógica de negocio.

export type EstadoActividad =
  | 'pendiente'
  | 'en_ejecucion'
  | 'finalizada'
  | 'proxima_a_vencer'
  | 'vencida';

export interface EntradaEstado {
  finalizada: boolean;
  avancePorcentaje: number;
  fechaInicioPlan: Date | null;
  fechaFinPlan: Date | null;
}

/** Valor por defecto del umbral de "próxima a vencer" (en días). Sobreescribible. */
export const UMBRAL_PROXIMA_VENCER_DIAS_DEFECTO = 7;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Devuelve exactamente uno de los estados (RN-04). "Finalizada" excluye
 * "próxima a vencer" y "vencida".
 */
export function derivarEstado(
  act: EntradaEstado,
  ahora: Date = new Date(),
  umbralDias: number = UMBRAL_PROXIMA_VENCER_DIAS_DEFECTO,
): EstadoActividad {
  // Finalizada tiene prioridad y excluye vencida/próxima (RN-04).
  if (act.finalizada || act.avancePorcentaje >= 100) {
    return 'finalizada';
  }

  const fin = act.fechaFinPlan;
  if (fin) {
    if (fin.getTime() < ahora.getTime()) {
      return 'vencida';
    }
    const diasRestantes = (fin.getTime() - ahora.getTime()) / MS_POR_DIA;
    if (diasRestantes <= umbralDias) {
      return 'proxima_a_vencer';
    }
  }

  const inicio = act.fechaInicioPlan;
  if ((inicio && inicio.getTime() <= ahora.getTime()) || act.avancePorcentaje > 0) {
    return 'en_ejecucion';
  }

  return 'pendiente';
}
