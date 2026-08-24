import type { ComponentType } from 'react';
import {
  Circle,
  CheckCircle,
  TrendUp,
  WarningCircle,
  TrendDown,
  type IconProps,
} from '@phosphor-icons/react';
import type { EstadoCronograma } from '../tipos';

const ETIQUETAS: Record<EstadoCronograma, string> = {
  sin_iniciar: 'Sin iniciar',
  completada: 'Completada',
  en_tiempo: 'Al ritmo previsto',
  en_riesgo: 'Ritmo en riesgo',
  atrasada: 'Atrasada según cronograma',
};

// Iconos SVG (Phosphor) en vez de símbolos de texto (○ ✓ ↗ ⚠ ↓): escalan
// limpio, mantienen un mismo grosor de trazo y no dependen de la fuente del
// sistema operativo.
const ICONO: Record<EstadoCronograma, ComponentType<IconProps>> = {
  sin_iniciar: Circle,
  completada: CheckCircle,
  en_tiempo: TrendUp,
  en_riesgo: WarningCircle,
  atrasada: TrendDown,
};

interface Props {
  estadoCronograma: EstadoCronograma;
  desviacion: number | null;
}

/**
 * Indicador de gestión de proyectos: compara el avance real contra el avance
 * que correspondería según la Línea Base vigente. Complementa (no sustituye)
 * el estado por fecha límite.
 */
export function DesviacionBadge({ estadoCronograma, desviacion }: Props) {
  if (desviacion === null) return null; // sin línea base suficiente para comparar
  const Icono = ICONO[estadoCronograma];
  const detalle =
    estadoCronograma === 'en_tiempo' && desviacion > 0
      ? `+${Math.round(desviacion)} pts`
      : estadoCronograma === 'atrasada' || estadoCronograma === 'en_riesgo'
        ? `${Math.round(desviacion)} pts`
        : ETIQUETAS[estadoCronograma];

  return (
    <span className={`desviacion ${estadoCronograma}`} title={ETIQUETAS[estadoCronograma]}>
      <Icono size={13} weight="bold" aria-hidden="true" />
      {detalle}
    </span>
  );
}
