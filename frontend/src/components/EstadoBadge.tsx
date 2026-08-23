import type { EstadoActividad } from '../tipos';

const ETIQUETAS: Record<EstadoActividad, string> = {
  pendiente: 'Pendiente',
  en_ejecucion: 'En ejecución',
  finalizada: 'Finalizada',
  proxima_a_vencer: 'Próxima a vencer',
  vencida: 'Vencida',
};

export function EstadoBadge({ estado }: { estado: EstadoActividad }) {
  return <span className={`badge ${estado}`}>{ETIQUETAS[estado]}</span>;
}
