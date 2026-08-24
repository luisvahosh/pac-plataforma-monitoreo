export type EstadoActividad =
  | 'pendiente'
  | 'en_ejecucion'
  | 'finalizada'
  | 'proxima_a_vencer'
  | 'vencida';

// Indicador complementario de gestión de proyectos: avance real vs. avance
// esperado según la Línea Base vigente (no reemplaza `estado`, que es por
// fecha límite).
export type EstadoCronograma = 'sin_iniciar' | 'completada' | 'en_tiempo' | 'en_riesgo' | 'atrasada';

export interface Hito {
  id: string;
  nombre: string;
  fechaObjetivo: string | null;
  cumplido: boolean;
}

export interface AvanceObservacion {
  id: string;
  porcentaje: number;
  observaciones: string | null;
  fechaHora: string;
  usuario: string;
}

export interface Subactividad {
  id: string;
  descripcion: string;
  avancePorcentaje: number;
  avances: AvanceObservacion[];
}

export interface Actividad {
  id: string;
  nombre: string;
  fechaInicioPlan: string | null;
  fechaFinPlan: string | null;
  avancePorcentaje: number;
  finalizada: boolean;
  estado: EstadoActividad;
  avanceEsperado: number | null;
  desviacion: number | null;
  estadoCronograma: EstadoCronograma;
  hitos: Hito[];
  avances: AvanceObservacion[];
  subactividades: Subactividad[];
}

export interface Fase {
  id: string;
  nombre: string;
  pesoPorcentaje: number;
  orden: number;
  avance: number;
  actividades: Actividad[];
}

export interface Proyecto {
  id: string;
  nombre: string;
  objetivos: string | null;
  avance: number | null;
  pesosValidos: boolean;
  fases: Fase[];
}

export interface Indicadores {
  proyectoId: string;
  avanceProyecto: number | null;
  pesosValidos: boolean;
  totalActividades: number;
  actividadesVencidas: number;
  actividadesAtrasadas: number;
  desviacionesCriticas: number;
  totalHitos: number;
  hitosCumplidos: number;
}

export interface DashboardResp {
  proyecto: Proyecto | null;
  indicadores: Indicadores | null;
}

export interface Nota {
  id: string;
  actividadId: string | null;
  texto: string;
  resuelta: boolean;
  creadoEn: string;
  autor: { nombre: string };
}
