import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionService } from '../notificacion/notificacion.service';
import { AporteColaborador, avanceActividadPonderado } from '../dominio/calculo-avance';
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

    const avance = await this.prisma.avance.create({
      data: {
        actividadId,
        usuarioId: autorId,
        porcentaje: dto.porcentaje,
        observaciones: dto.observaciones,
      },
    });
    await this.recalcularActividad(actividadId);

    // Confirmación por correo (RNF-16). No debe hacer fallar el registro.
    try {
      await this.notificaciones.confirmarRegistroAvance(actividadId, autorId, dto.porcentaje);
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
   */
  async recalcularActividad(actividadId: string): Promise<void> {
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
}
