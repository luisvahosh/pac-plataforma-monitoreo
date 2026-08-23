// Lógica pura de evaluación de Alertas de vencimiento (RN-03, RN-11).

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Días (enteros, hacia arriba) desde ahora hasta la fecha de fin. Negativo si ya pasó. */
export function diasHasta(fechaFin: Date, ahora: Date): number {
  return Math.ceil((fechaFin.getTime() - ahora.getTime()) / MS_POR_DIA);
}

export interface ResultadoAlerta {
  vencida: boolean;
  umbralesAlcanzados: number[]; // umbrales de anticipación que aplican hoy
}

/**
 * Evalúa una fecha de fin contra los umbrales configurados.
 *  - Si ya pasó (días < 0): vencida.
 *  - Si no: devuelve los umbrales cuyo valor es >= días restantes (p. ej. con
 *    [7,3,1] y 3 días restantes → [7,3]). La deduplicación (una alerta por
 *    umbral) la garantiza el registro de notificaciones enviadas (RN-11).
 */
export function evaluarAlerta(fechaFin: Date, ahora: Date, umbrales: number[]): ResultadoAlerta {
  const dias = diasHasta(fechaFin, ahora);
  if (dias < 0) return { vencida: true, umbralesAlcanzados: [] };
  return { vencida: false, umbralesAlcanzados: umbrales.filter((u) => dias <= u) };
}
