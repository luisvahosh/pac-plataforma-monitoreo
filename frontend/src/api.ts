import type { DashboardResp } from './tipos';

// Consume solo endpoints públicos (RN-13: nunca contenido de evidencias).
export async function obtenerDashboard(): Promise<DashboardResp> {
  const respuesta = await fetch('/api/public/proyectos/dashboard');
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar el dashboard (HTTP ${respuesta.status})`);
  }
  return respuesta.json() as Promise<DashboardResp>;
}

export function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function redondear(valor: number | null): number {
  if (valor === null || Number.isNaN(valor)) return 0;
  return Math.round(valor);
}
