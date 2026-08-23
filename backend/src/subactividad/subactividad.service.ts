import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvanceService } from '../avance/avance.service';
import { RegistrarAvanceSubactividadDto } from './dto/registrar-avance-subactividad.dto';

@Injectable()
export class SubactividadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avances: AvanceService,
  ) {}

  private estaAsignadoALaActividad(actividadId: string, usuarioId: string): Promise<boolean> {
    return this.prisma.asignacion
      .findUnique({ where: { actividadId_usuarioId: { actividadId, usuarioId } } })
      .then((a) => !!a);
  }

  listarPorActividad(actividadId: string) {
    return this.prisma.subactividad.findMany({ where: { actividadId }, orderBy: { orden: 'asc' } });
  }

  private async obtener(id: string) {
    const sub = await this.prisma.subactividad.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subactividad no encontrada');
    return sub;
  }

  /** Registra un avance de la subactividad (append-only, RN-05) y recalcula sus cachés. */
  async registrarAvance(
    subactividadId: string,
    autorId: string,
    esAdmin: boolean,
    dto: RegistrarAvanceSubactividadDto,
  ) {
    const sub = await this.obtener(subactividadId);

    if (!esAdmin && !(await this.estaAsignadoALaActividad(sub.actividadId, autorId))) {
      throw new ForbiddenException('No estás asignado a la actividad de esta subactividad');
    }

    const avance = await this.prisma.avanceSubactividad.create({
      data: {
        subactividadId,
        usuarioId: autorId,
        porcentaje: dto.porcentaje,
        enlaceEvidencia: dto.enlaceEvidencia,
        observaciones: dto.observaciones,
      },
    });

    await this.prisma.subactividad.update({
      where: { id: subactividadId },
      data: { avancePorcentaje: dto.porcentaje },
    });
    await this.avances.recalcularActividad(sub.actividadId);

    return avance;
  }

  /** Historial cronológico de avances de una subactividad. Colaborador: solo si está asignado (RN-10). */
  async historial(subactividadId: string, solicitanteId: string, esAdmin: boolean) {
    const sub = await this.obtener(subactividadId);
    if (!esAdmin && !(await this.estaAsignadoALaActividad(sub.actividadId, solicitanteId))) {
      throw new ForbiddenException('No estás asignado a la actividad de esta subactividad');
    }
    return this.prisma.avanceSubactividad.findMany({
      where: { subactividadId },
      orderBy: { fechaHora: 'asc' },
      include: { usuario: { select: { id: true, nombre: true } } },
    });
  }
}
