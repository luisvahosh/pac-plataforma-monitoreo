import type { EstadoCronograma } from '../tipos';

const ETIQUETAS: Record<EstadoCronograma, string> = {
  sin_iniciar: 'Sin iniciar',
  completada: 'Completada',
  en_tiempo: 'Al ritmo previsto',
  en_riesgo: 'Ritmo en riesgo',
  atrasada: 'Atrasada según cronograma',
};

const SIMBOLO: Record<EstadoCronograma, string> = {
  sin_iniciar: '○',
  completada: '✓',
  en_tiempo: '↗',
  en_riesgo: '⚠',
  atrasada: '↓',
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
  const texto =
    estadoCronograma === 'en_tiempo' && desviacion > 0
      ? `${SIMBOLO[estadoCronograma]} +${Math.round(desviacion)} pts`
      : estadoCronograma === 'atrasada' || estadoCronograma === 'en_riesgo'
        ? `${SIMBOLO[estadoCronograma]} ${Math.round(desviacion)} pts`
        : ETIQUETAS[estadoCronograma];

  return (
    <span className={`desviacion ${estadoCronograma}`} title={ETIQUETAS[estadoCronograma]}>
      {texto}
    </span>
  );
}
