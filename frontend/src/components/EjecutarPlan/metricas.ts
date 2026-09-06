// Cálculo de métricas derivadas para "Ejecutar Plan". PURO: no toca red ni
// estado; solo transforma el payload público (que ya trae la fuente de verdad
// del avance) en agregados listos para graficar. NO inventa datos.
//
// Vocabulario: Componente = Fase · Entregable = Actividad · Actividad = la
// unidad operativa (subactividad en la BD). El estado por fecha límite y la
// desviación de cronograma se calculan a nivel de Entregable (es donde el
// backend los deriva).

import type { Actividad, EstadoActividad, Fase, Proyecto, Subactividad } from '../../tipos';

export interface Filtros {
  componente: string; // faseId | 'todas'
  estado: EstadoActividad | 'todos';
  colaborador: string; // usuarioId | 'todos'
  periodo: 'todos' | 'proximos_30' | 'proximos_90';
}

export const FILTROS_INICIALES: Filtros = {
  componente: 'todas',
  estado: 'todos',
  colaborador: 'todos',
  periodo: 'todos',
};

const MS_DIA = 24 * 60 * 60 * 1000;

function subAsignadaA(sub: Subactividad, usuarioId: string): boolean {
  return sub.responsables.some((r) => r.usuarioId === usuarioId);
}

function entregableEnPeriodo(a: Actividad, periodo: Filtros['periodo'], ahora: number): boolean {
  if (periodo === 'todos') return true;
  if (!a.fechaFinPlan) return false;
  const dias = (new Date(a.fechaFinPlan).getTime() - ahora) / MS_DIA;
  const limite = periodo === 'proximos_30' ? 30 : 90;
  return dias <= limite; // incluye ya vencidos (dias negativos) y lo que vence dentro del rango
}

/** Aplica los filtros y devuelve un Proyecto "recortado" y consistente. */
export function filtrarProyecto(proyecto: Proyecto, filtros: Filtros): Fase[] {
  const ahora = Date.now();
  const fases =
    filtros.componente === 'todas'
      ? proyecto.fases
      : proyecto.fases.filter((f) => f.id === filtros.componente);

  return fases
    .map((f) => {
      const actividades = f.actividades
        .filter((a) => filtros.estado === 'todos' || a.estado === filtros.estado)
        .filter((a) => entregableEnPeriodo(a, filtros.periodo, ahora))
        .filter(
          (a) =>
            filtros.colaborador === 'todos' ||
            a.subactividades.some((s) => subAsignadaA(s, filtros.colaborador)),
        )
        .map((a) => ({
          ...a,
          subactividades:
            filtros.colaborador === 'todos'
              ? a.subactividades
              : a.subactividades.filter((s) => subAsignadaA(s, filtros.colaborador)),
        }));
      return { ...f, actividades };
    })
    .filter((f) => f.actividades.length > 0 || filtros.componente !== 'todas');
}

// ─── Agregados ──────────────────────────────────────────────────────

export interface ConteoEstados {
  pendiente: number;
  en_ejecucion: number;
  finalizada: number;
  proxima_a_vencer: number;
  vencida: number;
}

export interface MetricaComponente {
  id: string;
  nombre: string;
  avanceReal: number;
  avanceEsperado: number | null;
}

export interface MetricaColaborador {
  usuarioId: string;
  nombre: string;
  actividades: number;
  avance: number; // promedio de avance de sus actividades
  pesoAsignado: number; // suma de sus pesos de trabajo (carga total asignada, en puntos)
}

export interface ActividadAsignacion {
  id: string;
  descripcion: string;
  entregable: string;
  componente: string;
  sumaPeso: number; // suma de pesos de los responsables (debería ser 100)
  faltante: number; // 100 - sumaPeso (positivo = falta asignar)
  responsables: number;
}

export interface MetricaHitos {
  total: number;
  cumplidos: number;
  pendientes: number;
  retrasados: number;
  proximos: number;
}

export interface RiesgoAnotado {
  actividadId: string;
  descripcion: string;
  entregable: string;
  componente: string;
  texto: string;
}

export interface Metricas {
  avanceReal: number | null;
  avanceEsperado: number | null;
  desviacion: number | null;
  totalEntregables: number;
  estados: ConteoEstados;
  porComponente: MetricaComponente[];
  colaboradores: MetricaColaborador[];
  hitos: MetricaHitos;
  evidencias: {
    ejecutadas: number;
    conEvidencia: number;
    sinEvidencia: number;
    trazabilidad: number | null;
  };
  riesgos: RiesgoAnotado[];
  // Actividades cuyos responsables NO suman 100 % (les falta —o sobra— asignación).
  asignacionIncompleta: ActividadAsignacion[];
}

const ESTADO_CERO: ConteoEstados = {
  pendiente: 0,
  en_ejecucion: 0,
  finalizada: 0,
  proxima_a_vencer: 0,
  vencida: 0,
};

/** Promedio de los avances esperados (no nulos) de un conjunto de entregables. */
function esperadoDeFase(actividades: Actividad[]): number | null {
  const vals = actividades.map((a) => a.avanceEsperado).filter((v): v is number => v !== null);
  if (vals.length === 0) return null;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

export function calcularMetricas(
  fases: Fase[],
  umbralProximoDias = 7,
  ahora: Date = new Date(),
): Metricas {
  const estados: ConteoEstados = { ...ESTADO_CERO };
  const porComponente: MetricaComponente[] = [];
  const hitos: MetricaHitos = { total: 0, cumplidos: 0, pendientes: 0, retrasados: 0, proximos: 0 };
  const riesgos: RiesgoAnotado[] = [];
  const asignacionIncompleta: ActividadAsignacion[] = [];
  const colabMap = new Map<string, { nombre: string; suma: number; n: number; peso: number }>();

  let ejecutadas = 0;
  let conEvidencia = 0;
  let totalEntregables = 0;

  // Para el avance real/esperado ponderado por peso de componente.
  let pesoAcumReal = 0;
  let realPond = 0;
  let pesoAcumEsp = 0;
  let espPond = 0;

  const ahoraMs = ahora.getTime();

  for (const f of fases) {
    const espFase = esperadoDeFase(f.actividades);
    porComponente.push({
      id: f.id,
      nombre: f.nombre,
      avanceReal: f.avance,
      avanceEsperado: espFase,
    });
    if (f.pesoPorcentaje > 0) {
      pesoAcumReal += f.pesoPorcentaje;
      realPond += f.pesoPorcentaje * f.avance;
      if (espFase !== null) {
        pesoAcumEsp += f.pesoPorcentaje;
        espPond += f.pesoPorcentaje * espFase;
      }
    }

    for (const a of f.actividades) {
      totalEntregables += 1;
      estados[a.estado] += 1;

      for (const h of a.hitos) {
        hitos.total += 1;
        if (h.cumplido) {
          hitos.cumplidos += 1;
        } else {
          hitos.pendientes += 1;
          if (h.fechaObjetivo) {
            const dias = (new Date(h.fechaObjetivo).getTime() - ahoraMs) / MS_DIA;
            if (dias < 0) hitos.retrasados += 1;
            else if (dias <= umbralProximoDias) hitos.proximos += 1;
          }
        }
      }

      for (const s of a.subactividades) {
        if (s.avancePorcentaje > 0) {
          ejecutadas += 1;
          if (s.tieneEvidencia) conEvidencia += 1;
        }
        if (s.riesgos && s.riesgos.trim()) {
          riesgos.push({
            actividadId: s.id,
            descripcion: s.descripcion,
            entregable: a.nombre,
            componente: f.nombre,
            texto: s.riesgos,
          });
        }
        // Cobertura de asignación: los pesos de los responsables deberían sumar
        // 100 %. Si no, la actividad tiene asignación incompleta (o sobre-asignada).
        const sumaPeso = s.responsables.reduce((acc, r) => acc + r.pesoTrabajoPorcentaje, 0);
        if (Math.abs(sumaPeso - 100) > 0.5) {
          asignacionIncompleta.push({
            id: s.id,
            descripcion: s.descripcion,
            entregable: a.nombre,
            componente: f.nombre,
            sumaPeso: Math.round(sumaPeso * 10) / 10,
            faltante: Math.round((100 - sumaPeso) * 10) / 10,
            responsables: s.responsables.length,
          });
        }
        for (const r of s.responsables) {
          const prev = colabMap.get(r.usuarioId) ?? { nombre: r.nombre, suma: 0, n: 0, peso: 0 };
          prev.suma += s.avancePorcentaje;
          prev.n += 1;
          prev.peso += r.pesoTrabajoPorcentaje;
          colabMap.set(r.usuarioId, prev);
        }
      }
    }
  }

  const avanceReal = pesoAcumReal > 0 ? realPond / pesoAcumReal : null;
  const avanceEsperado = pesoAcumEsp > 0 ? espPond / pesoAcumEsp : null;
  const desviacion =
    avanceReal !== null && avanceEsperado !== null
      ? Math.round((avanceReal - avanceEsperado) * 100) / 100
      : null;

  const colaboradores: MetricaColaborador[] = [...colabMap.entries()]
    .map(([usuarioId, v]) => ({
      usuarioId,
      nombre: v.nombre,
      actividades: v.n,
      avance: v.n > 0 ? v.suma / v.n : 0,
      pesoAsignado: Math.round(v.peso * 10) / 10,
    }))
    .sort((a, b) => b.actividades - a.actividades);

  return {
    avanceReal,
    avanceEsperado,
    desviacion,
    totalEntregables,
    estados,
    porComponente,
    colaboradores,
    hitos,
    evidencias: {
      ejecutadas,
      conEvidencia,
      sinEvidencia: ejecutadas - conEvidencia,
      trazabilidad: ejecutadas > 0 ? Math.round((conEvidencia / ejecutadas) * 100) : null,
    },
    riesgos,
    asignacionIncompleta: asignacionIncompleta.sort((a, b) => b.faltante - a.faltante),
  };
}
