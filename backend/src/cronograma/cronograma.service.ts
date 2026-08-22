import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { avanceFase, avanceProyecto, validarPesosFases } from '../dominio/calculo-avance';
import { derivarEstado } from '../dominio/estado-actividad';

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
          include: { actividades: { include: { hitos: true } } },
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
        hitos: a.hitos,
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

  /** Indicadores agregados del Proyecto. */
  async indicadores(proyectoId: string, umbralDias?: number) {
    const c = await this.cronograma(proyectoId, umbralDias);
    let totalActividades = 0;
    let actividadesVencidas = 0;
    let totalHitos = 0;
    let hitosCumplidos = 0;

    for (const f of c.fases) {
      for (const a of f.actividades) {
        totalActividades += 1;
        if (a.estado === 'vencida') actividadesVencidas += 1;
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
      totalHitos,
      hitosCumplidos,
    };
  }
}
