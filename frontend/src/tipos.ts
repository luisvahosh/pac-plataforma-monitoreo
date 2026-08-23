export type EstadoActividad =
  | 'pendiente'
  | 'en_ejecucion'
  | 'finalizada'
  | 'proxima_a_vencer'
  | 'vencida';

export interface Hito {
  id: string;
  nombre: string;
  fechaObjetivo: string | null;
  cumplido: boolean;
}

export interface Actividad {
  id: string;
  nombre: string;
  fechaInicioPlan: string | null;
  fechaFinPlan: string | null;
  avancePorcentaje: number;
  finalizada: boolean;
  estado: EstadoActividad;
  hitos: Hito[];
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
  totalHitos: number;
  hitosCumplidos: number;
}

export interface DashboardResp {
  proyecto: Proyecto | null;
  indicadores: Indicadores | null;
}
