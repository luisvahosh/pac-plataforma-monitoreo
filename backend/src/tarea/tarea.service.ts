import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvanceService } from '../avance/avance.service';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { RegistrarAvanceTareaDto } from './dto/registrar-avance-tarea.dto';

// Tareas (nivel 4, Fase 15): apoyan el desarrollo de una Actividad (tabla
// `subactividad`, nivel 3). Opcionales; cuando existen, el avance de la
// actividad se deriva de ellas (roll-up). El peso por colaborador no puede
// superar su ponderado de asignación en la actividad (RN-ACTA-06).
@Injectable()
export class TareaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avances: AvanceService,
  ) {}

  /** Lista las tareas de una actividad + el presupuesto disponible por colaborador. */
  async listarPorActividad(subactividadId: string) {
    const actividad = await this.prisma.subactividad.findUnique({ where: { id: subactividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');

    const [tareas, asignaciones] = await Promise.all([
      this.prisma.tarea.findMany({
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
    for (const t of tareas) {
      usadoPorUsuario.set(t.usuarioId, (usadoPorUsuario.get(t.usuarioId) ?? 0) + t.pesoPorcentaje);
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

    return { tareas, presupuestos };
  }

  /**
   * Crea una tarea (solo Administrador). Valida que el colaborador esté asignado
   * a la actividad y que el peso no exceda su presupuesto disponible (RN-ACTA-06).
   */
  async crear(subactividadId: string, dto: CrearTareaDto) {
    const actividad = await this.prisma.subactividad.findUnique({ where: { id: subactividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');

    const asignacion = await this.prisma.asignacionSubactividad.findUnique({
      where: { subactividadId_usuarioId: { subactividadId, usuarioId: dto.usuarioId } },
    });
    if (!asignacion) {
      throw new BadRequestException(
        'El colaborador no está asignado a esta actividad: no se le puede crear una tarea.',
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

    const tarea = await this.prisma.tarea.create({
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
    // Al desglosar, la actividad pasa a derivar su avance de sus tareas.
    await this.avances.recalcularSubactividad(subactividadId);
    return tarea;
  }

  private async sumaPesos(subactividadId: string, usuarioId: string) {
    const filas = await this.prisma.tarea.findMany({
      where: { subactividadId, usuarioId },
      select: { pesoPorcentaje: true },
    });
    return filas.reduce((acc, f) => acc + f.pesoPorcentaje, 0);
  }

  private async obtener(id: string) {
    const tarea = await this.prisma.tarea.findUnique({ where: { id } });
    if (!tarea) throw new NotFoundException('Tarea no encontrada');
    return tarea;
  }

  /**
   * Registra un avance INCREMENTAL de la tarea (append-only, RN-05). Solo el
   * colaborador responsable o un Administrador. Recalcula la actividad (nivel 3)
   * → entregable → componente en cascada (roll-up).
   */
  async registrarAvance(
    id: string,
    autorId: string,
    esAdmin: boolean,
    dto: RegistrarAvanceTareaDto,
  ) {
    const tarea = await this.obtener(id);
    if (!esAdmin && tarea.usuarioId !== autorId) {
      throw new ForbiddenException('No eres el responsable de esta tarea');
    }

    const nuevoTotal = Math.min(100, tarea.avancePorcentaje + dto.porcentaje);
    const avance = await this.prisma.avanceTarea.create({
      data: {
        tareaId: id,
        usuarioId: autorId,
        porcentaje: nuevoTotal,
        enlaceEvidencia: dto.enlaceEvidencia,
        observaciones: dto.observaciones,
      },
    });

    await this.prisma.tarea.update({
      where: { id },
      data: {
        avancePorcentaje: nuevoTotal,
        estado: nuevoTotal >= 100 ? 'finalizada' : nuevoTotal > 0 ? 'en_ejecucion' : 'pendiente',
      },
    });
    await this.avances.recalcularSubactividad(tarea.subactividadId);
    return avance;
  }

  /** Historial cronológico de avances. Responsable o Administrador. */
  async historial(id: string, solicitanteId: string, esAdmin: boolean) {
    const tarea = await this.obtener(id);
    if (!esAdmin && tarea.usuarioId !== solicitanteId) {
      throw new ForbiddenException('No eres el responsable de esta tarea');
    }
    return this.prisma.avanceTarea.findMany({
      where: { tareaId: id },
      orderBy: { fechaHora: 'asc' },
      include: { usuario: { select: { id: true, nombre: true } } },
    });
  }

  /** Tareas asignadas a un colaborador (para "Mis actividades"). */
  listarPorUsuario(usuarioId: string) {
    return this.prisma.tarea.findMany({
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

  /** Tareas del proyecto aún no finalizadas (pendientes para la nueva acta). */
  pendientesDelProyecto(proyectoId: string) {
    return this.prisma.tarea.findMany({
      where: {
        estado: { not: 'finalizada' },
        subactividad: { actividad: { fase: { proyectoId } } },
      },
      orderBy: { fechaCompromiso: 'asc' },
      include: {
        usuario: { select: { id: true, nombre: true } },
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
