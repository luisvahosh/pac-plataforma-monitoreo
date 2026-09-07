import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionService } from '../notificacion/notificacion.service';
import {
  AporteColaborador,
  avanceActividadDesdeEjecuciones,
  avanceActividadPonderado,
  avanceEntregablePonderado,
} from '../dominio/calculo-avance';
import { RegistrarAvanceDto } from './dto/registrar-avance.dto';

@Injectable()
export class AvanceService {
  private readonly logger = new Logger(AvanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificaciones: NotificacionService,
  ) {}

  private estaAsignado(actividadId: string, usuarioId: string): Promise<boolean> {
    return this.prisma.asignacion
      .findUnique({ where: { actividadId_usuarioId: { actividadId, usuarioId } } })
      .then((a) => !!a);
  }

  /** Registra un avance (append-only, RN-05) y recalcula el avance de la actividad. */
  async registrar(actividadId: string, autorId: string, esAdmin: boolean, dto: RegistrarAvanceDto) {
    const actividad = await this.prisma.actividad.findUnique({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');

    if (!esAdmin && !(await this.estaAsignado(actividadId, autorId))) {
      throw new ForbiddenException('No estás asignado a esta actividad');
    }

    const tieneSubactividades =
      (await this.prisma.subactividad.count({ where: { actividadId } })) > 0;
    if (tieneSubactividades) {
      throw new BadRequestException(
        'Esta actividad tiene subactividades: su avance se calcula automáticamente. ' +
          'Registra el avance en cada subactividad.',
      );
    }

    // Reporte INCREMENTAL: el colaborador informa cuánto avanzó ahora y se suma
    // a su último total (tope 100 %). En el histórico se guarda el total
    // acumulado resultante, de modo que la bitácora sigue mostrando el avance
    // vigente en cada punto (append-only, RN-05).
    const ultimoPropio = await this.prisma.avance.findFirst({
      where: { actividadId, usuarioId: autorId },
      orderBy: { fechaHora: 'desc' },
    });
    const porcentajeTotal = Math.min(100, (ultimoPropio?.porcentaje ?? 0) + dto.porcentaje);

    const avance = await this.prisma.avance.create({
      data: {
        actividadId,
        usuarioId: autorId,
        porcentaje: porcentajeTotal,
        observaciones: dto.observaciones,
      },
    });
    await this.recalcularActividad(actividadId);

    // Confirmación por correo (RNF-16). No debe hacer fallar el registro.
    try {
      await this.notificaciones.confirmarRegistroAvance(actividadId, autorId, porcentajeTotal);
    } catch (error) {
      this.logger.warn(`No se pudo enviar la confirmación de avance: ${(error as Error).message}`);
    }
    return avance;
  }

  /** Historial cronológico de avances. Colaborador: solo si está asignado (RN-10). */
  async historial(actividadId: string, solicitanteId: string, esAdmin: boolean) {
    const actividad = await this.prisma.actividad.findUnique({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    if (!esAdmin && !(await this.estaAsignado(actividadId, solicitanteId))) {
      throw new ForbiddenException('No estás asignado a esta actividad');
    }
    return this.prisma.avance.findMany({
      where: { actividadId },
      orderBy: { fechaHora: 'asc' },
      include: { usuario: { select: { id: true, nombre: true } } },
    });
  }

  /**
   * Recalcula `actividad.avancePorcentaje` (RN-02): ponderado por el peso de
   * trabajo de cada colaborador asignado, tomando su último avance. Sin
   * asignaciones, usa el último avance registrado en la actividad.
   *
   * Si la actividad (Entregable) tiene Subactividades (Actividades), el avance
   * no se reporta directamente: se deriva como la SUMA PONDERADA por el peso de
   * cada subactividad (ver SubactividadService.registrarAvance, que llama aquí
   * después de actualizar el caché de cada subactividad).
   */
  async recalcularActividad(actividadId: string): Promise<void> {
    const subactividades = await this.prisma.subactividad.findMany({ where: { actividadId } });
    if (subactividades.length > 0) {
      const nuevo = avanceEntregablePonderado(subactividades);
      await this.prisma.actividad.update({
        where: { id: actividadId },
        data: { avancePorcentaje: nuevo },
      });
      return;
    }

    const asignaciones = await this.prisma.asignacion.findMany({ where: { actividadId } });

    let nuevo: number;
    if (asignaciones.length === 0) {
      const ultimo = await this.prisma.avance.findFirst({
        where: { actividadId },
        orderBy: { fechaHora: 'desc' },
      });
      nuevo = ultimo?.porcentaje ?? 0;
    } else {
      const aportes: AporteColaborador[] = [];
      for (const asg of asignaciones) {
        const ultimo = await this.prisma.avance.findFirst({
          where: { actividadId, usuarioId: asg.usuarioId },
          orderBy: { fechaHora: 'desc' },
        });
        aportes.push({
          pesoTrabajoPorcentaje: asg.pesoTrabajoPorcentaje,
          avancePorcentaje: ultimo?.porcentaje ?? 0,
        });
      }
      nuevo = avanceActividadPonderado(aportes);
    }

    await this.prisma.actividad.update({
      where: { id: actividadId },
      data: { avancePorcentaje: nuevo },
    });
  }

  /**
   * Recalcula el avance de una Actividad (nivel 3, tabla `subactividad`) a
   * partir de sus Subactividades de ejecución (nivel 4, Fase 15) y encadena el
   * recálculo del Entregable. Si la Actividad no tiene ejecuciones, no toca su
   * avance (lo maneja el reporte directo en SubactividadService).
   */
  async recalcularSubactividad(subactividadId: string): Promise<void> {
    const sub = await this.prisma.subactividad.findUnique({ where: { id: subactividadId } });
    if (!sub) return;
    const ejecuciones = await this.prisma.subactividadEjecucion.findMany({
      where: { subactividadId },
    });
    if (ejecuciones.length > 0) {
      const nuevo = avanceActividadDesdeEjecuciones(ejecuciones);
      await this.prisma.subactividad.update({
        where: { id: subactividadId },
        data: { avancePorcentaje: nuevo },
      });
    }
    await this.recalcularActividad(sub.actividadId);
  }
}
