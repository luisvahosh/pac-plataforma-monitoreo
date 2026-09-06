import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { avanceFase, avanceProyecto, validarPesosFases } from '../dominio/calculo-avance';
import { derivarEstado } from '../dominio/estado-actividad';
import {
  calcularDesviacion,
  UMBRAL_DESVIACION_CRITICA_PUNTOS_DEFECTO,
} from '../dominio/desviacion-cronograma';

@Injectable()
export class CronogramaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cronograma del Proyecto con avance por Fase/Proyecto y estado por Actividad. */
  async cronograma(proyectoId: string, umbralDias?: number) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
      include: {
        fases: {
          orderBy: { orden: 'asc' },
          include: {
            actividades: {
              include: {
                hitos: true,
                avances: {
                  orderBy: { fechaHora: 'asc' },
                  include: { usuario: { select: { nombre: true } } },
                },
                subactividades: {
                  orderBy: { orden: 'asc' },
                  include: {
                    avances: {
                      orderBy: { fechaHora: 'asc' },
                      include: { usuario: { select: { nombre: true } } },
                    },
                    // Responsables asignados (nombre + peso), para el bloque de
                    // cumplimiento por colaborador de "Ejecutar Plan".
                    asignaciones: {
                      orderBy: { pesoTrabajoPorcentaje: 'desc' },
                      include: { usuario: { select: { id: true, nombre: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    const ahora = new Date();
    const fases = proyecto.fases.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      pesoPorcentaje: f.pesoPorcentaje,
      orden: f.orden,
      avance: avanceFase(f.actividades),
      actividades: f.actividades.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        fechaInicioPlan: a.fechaInicioPlan,
        fechaFinPlan: a.fechaFinPlan,
        avancePorcentaje: a.avancePorcentaje,
        finalizada: a.finalizada,
        estado: derivarEstado(
          {
            finalizada: a.finalizada,
            avancePorcentaje: a.avancePorcentaje,
            fechaInicioPlan: a.fechaInicioPlan,
            fechaFinPlan: a.fechaFinPlan,
          },
          ahora,
          umbralDias,
        ),
        // Indicador complementario de gestión de proyectos: avance real vs.
        // avance esperado según la Línea Base vigente (no reemplaza el estado
        // por fecha límite de arriba).
        ...calcularDesviacion(
          {
            avancePorcentaje: a.avancePorcentaje,
            finalizada: a.finalizada,
            fechaInicioPlan: a.fechaInicioPlan,
            fechaFinPlan: a.fechaFinPlan,
          },
          ahora,
        ),
        hitos: a.hitos,
        // Historial de observaciones (texto libre de cada reporte de avance).
        // Público a propósito: es la bitácora de seguimiento del proyecto,
        // distinto de la Evidencia (enlace/archivo), que sí es siempre
        // privada (RN-06/RN-13) y nunca se incluye aquí.
        avances: a.avances.map((av) => ({
          id: av.id,
          porcentaje: av.porcentaje,
          observaciones: av.observaciones,
          fechaHora: av.fechaHora,
          usuario: av.usuario.nombre,
        })),
        subactividades: a.subactividades.map((s) => ({
          id: s.id,
          descripcion: s.descripcion,
          avancePorcentaje: s.avancePorcentaje,
          // Riesgos anotados (texto libre). Público a propósito; se registra
          // solo desde la parte privada (PATCH subactividades/:id/riesgos).
          riesgos: s.riesgos,
          // Trazabilidad: SOLO indica si existe algún enlace de evidencia; el
          // contenido/URL nunca se expone públicamente (RN-06/RN-13).
          tieneEvidencia: s.avances.some((av) => !!av.enlaceEvidencia),
          // Responsables asignados a la Actividad (para cumplimiento por
          // colaborador). Solo identidad y peso; nunca datos sensibles.
          responsables: s.asignaciones.map((asig) => ({
            usuarioId: asig.usuario.id,
            nombre: asig.usuario.nombre,
            pesoTrabajoPorcentaje: asig.pesoTrabajoPorcentaje,
          })),
          avances: s.avances.map((av) => ({
            id: av.id,
            porcentaje: av.porcentaje,
            observaciones: av.observaciones,
            fechaHora: av.fechaHora,
            usuario: av.usuario.nombre,
          })),
        })),
      })),
    }));

    const pesosValidos = validarPesosFases(proyecto.fases);
    const avance = pesosValidos ? avanceProyecto(proyecto.fases) : null;

    return {
      id: proyecto.id,
      nombre: proyecto.nombre,
      objetivos: proyecto.objetivos,
      avance,
      pesosValidos,
      fases,
    };
  }

  /**
   * Dashboard del proyecto único (plataforma mono-proyecto): toma el primer
   * Proyecto y devuelve su cronograma + indicadores en una sola respuesta.
   */
  async dashboardPublico(umbralDias?: number) {
    const proyecto = await this.prisma.proyecto.findFirst({ orderBy: { creadoEn: 'asc' } });
    if (!proyecto) return { proyecto: null, indicadores: null };
    const [cronograma, indicadores] = await Promise.all([
      this.cronograma(proyecto.id, umbralDias),
      this.indicadores(proyecto.id, umbralDias),
    ]);
    return { proyecto: cronograma, indicadores };
  }

  /**
   * Indicadores agregados del Proyecto. `umbralDesviacionCritica` es el
   * número de puntos porcentuales de atraso (avance real vs. esperado según
   * cronograma) a partir del cual una actividad cuenta como "desviación
   * crítica" (por defecto 20, ver desviacion-cronograma.ts).
   */
  async indicadores(
    proyectoId: string,
    umbralDias?: number,
    umbralDesviacionCritica: number = UMBRAL_DESVIACION_CRITICA_PUNTOS_DEFECTO,
  ) {
    const c = await this.cronograma(proyectoId, umbralDias);
    let totalActividades = 0;
    let actividadesVencidas = 0;
    let actividadesAtrasadas = 0;
    let desviacionesCriticas = 0;
    let totalHitos = 0;
    let hitosCumplidos = 0;

    for (const f of c.fases) {
      for (const a of f.actividades) {
        totalActividades += 1;
        if (a.estado === 'vencida') actividadesVencidas += 1;
        if (a.estadoCronograma === 'atrasada') actividadesAtrasadas += 1;
        if (a.desviacion !== null && a.desviacion < -umbralDesviacionCritica) {
          desviacionesCriticas += 1;
        }
        for (const h of a.hitos) {
          totalHitos += 1;
          if (h.cumplido) hitosCumplidos += 1;
        }
      }
    }

    return {
      proyectoId,
      avanceProyecto: c.avance,
      pesosValidos: c.pesosValidos,
      totalActividades,
      actividadesVencidas,
      actividadesAtrasadas,
      desviacionesCriticas,
      totalHitos,
      hitosCumplidos,
    };
  }
}
