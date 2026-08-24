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

  /**
   * Autorizado si está asignado a la Actividad completa (asignación heredada,
   * como antes) O directamente a esta Subactividad puntual (RN-08 aplicado a
   * ese nivel: el responsable real del trabajo).
   */
  private async tieneAcceso(
    subactividadId: string,
    actividadId: string,
    usuarioId: string,
  ): Promise<boolean> {
    const [asignadoActividad, asignadoSubactividad] = await Promise.all([
      this.prisma.asignacion.findUnique({
        where: { actividadId_usuarioId: { actividadId, usuarioId } },
      }),
      this.prisma.asignacionSubactividad.findUnique({
        where: { subactividadId_usuarioId: { subactividadId, usuarioId } },
      }),
    ]);
    return !!asignadoActividad || !!asignadoSubactividad;
  }

  listarPorActividad(actividadId: string) {
    return this.prisma.subactividad.findMany({ where: { actividadId }, orderBy: { orden: 'asc' } });
  }

  /** Crea una subactividad nueva dentro de una Actividad (admin). */
  async crear(actividadId: string, descripcion: string) {
    const actividad = await this.prisma.actividad.findUnique({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    const total = await this.prisma.subactividad.count({ where: { actividadId } });
    const subactividad = await this.prisma.subactividad.create({
      data: { actividadId, descripcion, orden: total },
    });
    // La actividad pasa a derivar su avance del promedio de sus subactividades.
    await this.avances.recalcularActividad(actividadId);
    return subactividad;
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

    if (!esAdmin && !(await this.tieneAcceso(subactividadId, sub.actividadId, autorId))) {
      throw new ForbiddenException('No estás asignado a esta subactividad ni a su actividad');
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
    if (!esAdmin && !(await this.tieneAcceso(subactividadId, sub.actividadId, solicitanteId))) {
      throw new ForbiddenException('No estás asignado a esta subactividad ni a su actividad');
    }
    return this.prisma.avanceSubactividad.findMany({
      where: { subactividadId },
      orderBy: { fechaHora: 'asc' },
      include: { usuario: { select: { id: true, nombre: true } } },
    });
  }
}
