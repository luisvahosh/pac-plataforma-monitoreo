import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvanceService } from '../avance/avance.service';
import { CrearEjecucionDto } from './dto/crear-ejecucion.dto';
import { RegistrarAvanceEjecucionDto } from './dto/registrar-avance-ejecucion.dto';

// Nivel 4 (Fase 15): Subactividades de ejecución de una Actividad (tabla
// `subactividad`, nivel 3). Su avance suma al de la actividad (roll-up) y el
// peso por colaborador no puede superar su ponderado de asignación (RN-ACTA-06).
@Injectable()
export class EjecucionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avances: AvanceService,
  ) {}

  /** Lista las ejecuciones de una actividad + el presupuesto disponible por colaborador. */
  async listarPorActividad(subactividadId: string) {
    const actividad = await this.prisma.subactividad.findUnique({ where: { id: subactividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');

    const [ejecuciones, asignaciones] = await Promise.all([
      this.prisma.subactividadEjecucion.findMany({
        where: { subactividadId },
        orderBy: { creadoEn: 'asc' },
        include: { usuario: { select: { id: true, nombre: true } } },
      }),
      this.prisma.asignacionSubactividad.findMany({
        where: { subactividadId },
        include: { usuario: { select: { id: true, nombre: true } } },
        orderBy: { pesoTrabajoPorcentaje: 'desc' },
      }),
    ]);

    const usadoPorUsuario = new Map<string, number>();
    for (const e of ejecuciones) {
      usadoPorUsuario.set(e.usuarioId, (usadoPorUsuario.get(e.usuarioId) ?? 0) + e.pesoPorcentaje);
    }

    const presupuestos = asignaciones.map((a) => {
      const usado = usadoPorUsuario.get(a.usuarioId) ?? 0;
      return {
        usuarioId: a.usuarioId,
        nombre: a.usuario.nombre,
        asignado: a.pesoTrabajoPorcentaje,
        usado,
        disponible: Math.max(0, a.pesoTrabajoPorcentaje - usado),
      };
    });

    return { ejecuciones, presupuestos };
  }

  /**
   * Crea una subactividad de ejecución (solo Administrador). Valida que el
   * colaborador esté asignado a la actividad y que el peso no exceda su
   * presupuesto disponible (RN-ACTA-06).
   */
  async crear(subactividadId: string, dto: CrearEjecucionDto) {
    const actividad = await this.prisma.subactividad.findUnique({ where: { id: subactividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');

    const asignacion = await this.prisma.asignacionSubactividad.findUnique({
      where: { subactividadId_usuarioId: { subactividadId, usuarioId: dto.usuarioId } },
    });
    if (!asignacion) {
      throw new BadRequestException(
        'El colaborador no está asignado a esta actividad: no se le puede crear una subactividad.',
      );
    }

    const usado = await this.sumaPesos(subactividadId, dto.usuarioId);
    const disponible = asignacion.pesoTrabajoPorcentaje - usado;
    if (dto.pesoPorcentaje > disponible + 1e-9) {
      throw new BadRequestException(
        `El peso (${dto.pesoPorcentaje}%) supera el disponible del colaborador ` +
          `(${disponible}% de su ${asignacion.pesoTrabajoPorcentaje}% en la actividad).`,
      );
    }

    const ejecucion = await this.prisma.subactividadEjecucion.create({
      data: {
        subactividadId,
        usuarioId: dto.usuarioId,
        actaOrigenId: dto.actaOrigenId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        pesoPorcentaje: dto.pesoPorcentaje,
        fechaCompromiso: dto.fechaCompromiso ? new Date(dto.fechaCompromiso) : undefined,
        observaciones: dto.observaciones,
      },
    });
    // Al desglosar, la actividad pasa a derivar su avance de las ejecuciones.
    await this.avances.recalcularSubactividad(subactividadId);
    return ejecucion;
  }

  private async sumaPesos(subactividadId: string, usuarioId: string, excluirId?: string) {
    const filas = await this.prisma.subactividadEjecucion.findMany({
      where: { subactividadId, usuarioId, id: excluirId ? { not: excluirId } : undefined },
      select: { pesoPorcentaje: true },
    });
    return filas.reduce((acc, f) => acc + f.pesoPorcentaje, 0);
  }

  private async obtener(id: string) {
    const ejecucion = await this.prisma.subactividadEjecucion.findUnique({ where: { id } });
    if (!ejecucion) throw new NotFoundException('Subactividad de ejecución no encontrada');
    return ejecucion;
  }

  /**
   * Registra un avance INCREMENTAL de la subactividad de ejecución (append-only,
   * RN-05). Solo el colaborador responsable o un Administrador. Recalcula la
   * actividad (nivel 3) → entregable → componente en cascada (roll-up).
   */
  async registrarAvance(
    id: string,
    autorId: string,
    esAdmin: boolean,
    dto: RegistrarAvanceEjecucionDto,
  ) {
    const ejecucion = await this.obtener(id);
    if (!esAdmin && ejecucion.usuarioId !== autorId) {
      throw new ForbiddenException('No eres el responsable de esta subactividad');
    }

    const nuevoTotal = Math.min(100, ejecucion.avancePorcentaje + dto.porcentaje);
    const avance = await this.prisma.avanceSubactividadEjecucion.create({
      data: {
        subactividadEjecucionId: id,
        usuarioId: autorId,
        porcentaje: nuevoTotal,
        enlaceEvidencia: dto.enlaceEvidencia,
        observaciones: dto.observaciones,
      },
    });

    await this.prisma.subactividadEjecucion.update({
      where: { id },
      data: {
        avancePorcentaje: nuevoTotal,
        estado: nuevoTotal >= 100 ? 'finalizada' : nuevoTotal > 0 ? 'en_ejecucion' : 'pendiente',
      },
    });
    await this.avances.recalcularSubactividad(ejecucion.subactividadId);
    return avance;
  }

  /** Historial cronológico de avances. Responsable o Administrador. */
  async historial(id: string, solicitanteId: string, esAdmin: boolean) {
    const ejecucion = await this.obtener(id);
    if (!esAdmin && ejecucion.usuarioId !== solicitanteId) {
      throw new ForbiddenException('No eres el responsable de esta subactividad');
    }
    return this.prisma.avanceSubactividadEjecucion.findMany({
      where: { subactividadEjecucionId: id },
      orderBy: { fechaHora: 'asc' },
      include: { usuario: { select: { id: true, nombre: true } } },
    });
  }

  /** Subactividades de ejecución asignadas a un colaborador (para "Mis actividades"). */
  listarPorUsuario(usuarioId: string) {
    return this.prisma.subactividadEjecucion.findMany({
      where: { usuarioId },
      orderBy: [{ estado: 'asc' }, { fechaCompromiso: 'asc' }],
      include: {
        subactividad: {
          select: {
            id: true,
            descripcion: true,
            actividad: { select: { id: true, nombre: true } },
          },
        },
      },
    });
  }
}
