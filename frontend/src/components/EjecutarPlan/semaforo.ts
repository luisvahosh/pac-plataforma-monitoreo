// Semáforo de cumplimiento. Umbrales CONFIGURABLES en un único punto para que
// más adelante un administrador pueda ajustarlos sin tocar cada componente.
// La lógica de DESVIACIÓN temporal (avance real vs. esperado) es independiente
// y no usa estos umbrales (ver DesviacionBadge / estadoCronograma).

export interface UmbralesSemaforo {
  verde: number; // >= verde  → 🟢
  amarillo: number; // >= amarillo y < verde → 🟡 ; < amarillo → 🔴
}

export const UMBRALES_DEFECTO: UmbralesSemaforo = { verde: 90, amarillo: 70 };

export type NivelSemaforo = 'verde' | 'amarillo' | 'rojo';

export function nivelSemaforo(
  porcentaje: number | null,
  umbrales: UmbralesSemaforo = UMBRALES_DEFECTO,
): NivelSemaforo {
  const v = porcentaje ?? 0;
  if (v >= umbrales.verde) return 'verde';
  if (v >= umbrales.amarillo) return 'amarillo';
  return 'rojo';
}

/** Color (token CSS) asociado a cada nivel, para puntos/semáforos y gráficos. */
export const COLOR_NIVEL: Record<NivelSemaforo, string> = {
  verde: 'var(--institucional-verde)',
  amarillo: 'var(--institucional-amarillo)',
  rojo: 'var(--vencida)',
};
