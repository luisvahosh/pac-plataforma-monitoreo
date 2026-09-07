import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    return this.prisma.subactividad.findMany({
      where: { actividadId },
      orderBy: { orden: 'asc' },
      include: {
        asignaciones: {
          include: { usuario: { select: { id: true, nombre: true } } },
          orderBy: { pesoTrabajoPorcentaje: 'desc' },
        },
      },
    });
  }

  /** Crea una subactividad nueva dentro de una Actividad (admin). */
  async crear(actividadId: string, descripcion: string) {
    const actividad = await this.prisma.actividad.findUnique({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    const total = await this.prisma.subactividad.count({ where: { actividadId } });
    const subactividad = await this.prisma.subactividad.create({
      data: { actividadId, descripcion, orden: total },
    });
    // La actividad pasa a derivar su avance de la suma ponderada de sus
    // subactividades por peso (la nueva, con peso 0, no altera el resultado
    // hasta que un admin le asigne un peso).
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

    // Si la Actividad se desglosó en Subactividades de ejecución (nivel 4, Fase
    // 15), su avance se deriva de ellas: el reporte directo queda deshabilitado.
    const tieneEjecuciones =
      (await this.prisma.subactividadEjecucion.count({ where: { subactividadId } })) > 0;
    if (tieneEjecuciones) {
      throw new BadRequestException(
        'Esta actividad tiene subactividades de ejecución: su avance se calcula ' +
          'automáticamente. Reporta el avance en cada subactividad.',
      );
    }

    // Reporte INCREMENTAL: el colaborador informa cuánto avanzó ahora y se suma
    // al total vigente de la Actividad (tope 100 %). En el histórico se guarda el
    // total acumulado resultante (append-only, RN-05); el caché queda con ese total.
    const nuevoTotal = Math.min(100, sub.avancePorcentaje + dto.porcentaje);

    const avance = await this.prisma.avanceSubactividad.create({
      data: {
        subactividadId,
        usuarioId: autorId,
        porcentaje: nuevoTotal,
        enlaceEvidencia: dto.enlaceEvidencia,
        observaciones: dto.observaciones,
      },
    });

    await this.prisma.subactividad.update({
      where: { id: subactividadId },
      data: { avancePorcentaje: nuevoTotal },
    });
    await this.avances.recalcularActividad(sub.actividadId);

    return avance;
  }

  /**
   * Actualiza el texto de Riesgos asociados a la Actividad. Solo Administrador
   * (se registra desde la parte privada). La normalización a null de la cadena
   * vacía mantiene consistente el "sin riesgos anotados".
   */
  async actualizarRiesgos(subactividadId: string, riesgos?: string) {
    await this.obtener(subactividadId);
    const texto = riesgos?.trim() ? riesgos.trim() : null;
    return this.prisma.subactividad.update({
      where: { id: subactividadId },
      data: { riesgos: texto },
      select: { id: true, riesgos: true },
    });
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
