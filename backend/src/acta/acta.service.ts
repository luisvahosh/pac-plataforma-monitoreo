import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TareaService } from '../tarea/tarea.service';
import { RiesgoService } from '../riesgo/riesgo.service';
import { ActualizarActaDto } from './dto/actualizar-acta.dto';

@Injectable()
export class ActaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tareas: TareaService,
    private readonly riesgos: RiesgoService,
  ) {}

  /** El proyecto único administrado por la plataforma. */
  private async proyectoUnico() {
    const proyecto = await this.prisma.proyecto.findFirst({ orderBy: { creadoEn: 'asc' } });
    if (!proyecto) throw new NotFoundException('Aún no hay un proyecto creado');
    return proyecto;
  }

  private async siguienteNumero(proyectoId: string) {
    const ultima = await this.prisma.acta.findFirst({
      where: { proyectoId },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });
    return (ultima?.numero ?? 0) + 1;
  }

  /** Historial de actas (número, fecha, tema, estado, #tareas). */
  async listar() {
    const proyecto = await this.proyectoUnico();
    const actas = await this.prisma.acta.findMany({
      where: { proyectoId: proyecto.id },
      orderBy: { numero: 'desc' },
      include: { _count: { select: { tareas: true } } },
    });
    return actas.map((a) => ({
      id: a.id,
      numero: a.numero,
      fecha: a.fecha,
      tema: a.actividadTema,
      estado: a.estado,
      tareas: a._count.tareas,
    }));
  }

  /** Crea un borrador con número correlativo y devuelve el acta ya precargada. */
  async crearBorrador() {
    const proyecto = await this.proyectoUnico();
    const numero = await this.siguienteNumero(proyecto.id);
    const acta = await this.prisma.acta.create({
      data: { proyectoId: proyecto.id, numero, fecha: new Date() },
    });
    return this.obtener(acta.id);
  }

  /**
   * Contexto para la nueva acta: acta anterior, compromisos pendientes y riesgos
   * abiertos del proyecto (RN-ACTA-01). No crea nada; la vista lo usa para
   * precargar el seguimiento.
   */
  async contexto() {
    const proyecto = await this.proyectoUnico();
    const [actaAnterior, tareasPendientes, riesgosAbiertos, numeroPropuesto] = await Promise.all([
      this.prisma.acta.findFirst({
        where: { proyectoId: proyecto.id, estado: 'enviada' },
        orderBy: { numero: 'desc' },
        include: {
          conclusiones: { orderBy: { orden: 'asc' } },
          temas: { orderBy: { orden: 'asc' } },
        },
      }),
      this.tareas.pendientesDelProyecto(proyecto.id),
      this.riesgos.riesgosAbiertosDelProyecto(proyecto.id),
      this.siguienteNumero(proyecto.id),
    ]);
    return { proyecto, numeroPropuesto, actaAnterior, tareasPendientes, riesgosAbiertos };
  }

  async obtener(id: string) {
    const acta = await this.prisma.acta.findUnique({
      where: { id },
      include: {
        asistentes: { include: { usuario: { select: { id: true, nombre: true } } } },
        temas: { orderBy: { orden: 'asc' } },
        conclusiones: { orderBy: { orden: 'asc' } },
        documentos: true,
        tareas: {
          include: {
            usuario: { select: { id: true, nombre: true } },
            subactividad: { select: { id: true, descripcion: true } },
          },
        },
        riesgosOrigen: { include: { responsable: { select: { id: true, nombre: true } } } },
      },
    });
    if (!acta) throw new NotFoundException('Acta no encontrada');
    return acta;
  }

  private async exigirBorrador(id: string) {
    const acta = await this.prisma.acta.findUnique({ where: { id } });
    if (!acta) throw new NotFoundException('Acta no encontrada');
    if (acta.estado !== 'borrador') {
      throw new BadRequestException('El acta ya fue enviada y no puede editarse');
    }
    return acta;
  }

  /** Actualiza el borrador. Los arreglos, si vienen, reemplazan el contenido. */
  async actualizar(id: string, dto: ActualizarActaDto) {
    await this.exigirBorrador(id);

    await this.prisma.acta.update({
      where: { id },
      data: {
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        lugar: dto.lugar,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        actividadTema: dto.actividadTema,
        objetivo: dto.objetivo,
        elaboradoPor: dto.elaboradoPor,
        convocadaPor: dto.convocadaPor,
      },
    });

    if (dto.asistentes) {
      await this.prisma.actaAsistente.deleteMany({ where: { actaId: id } });
      if (dto.asistentes.length > 0) {
        await this.prisma.actaAsistente.createMany({
          data: dto.asistentes.map((a) => ({
            actaId: id,
            usuarioId: a.usuarioId || null,
            nombre: a.nombre,
            organizacion: a.organizacion,
            rolEnReunion: a.rolEnReunion,
            esInvitado: a.esInvitado ?? !a.usuarioId,
          })),
        });
      }
    }

    if (dto.temas) {
      await this.prisma.actaTema.deleteMany({ where: { actaId: id } });
      if (dto.temas.length > 0) {
        await this.prisma.actaTema.createMany({
          data: dto.temas.map((t, i) => ({
            actaId: id,
            tema: t.tema,
            actividadId: t.actividadId,
            subactividadId: t.subactividadId,
            descripcion: t.descripcion,
            decisiones: t.decisiones,
            observaciones: t.observaciones,
            orden: t.orden ?? i,
          })),
        });
      }
    }

    if (dto.conclusiones) {
      await this.prisma.actaConclusion.deleteMany({ where: { actaId: id } });
      if (dto.conclusiones.length > 0) {
        await this.prisma.actaConclusion.createMany({
          data: dto.conclusiones.map((c, i) => ({
            actaId: id,
            texto: c.texto,
            orden: c.orden ?? i,
          })),
        });
      }
    }

    return this.obtener(id);
  }

  /** Resumen previo al envío (RN-ACTA-03 / sección 14). */
  async resumen(id: string) {
    await this.prisma.acta.findUnique({ where: { id } }).then((a) => {
      if (!a) throw new NotFoundException('Acta no encontrada');
    });
    const [tareas, riesgosCreados, riesgosActualizados, conclusiones, temas] = await Promise.all([
      this.prisma.tarea.count({ where: { actaOrigenId: id } }),
      this.prisma.riesgo.count({ where: { actaOrigenId: id } }),
      this.prisma.riesgoActualizacion.count({ where: { actaId: id } }),
      this.prisma.actaConclusion.count({ where: { actaId: id } }),
      this.prisma.actaTema.count({ where: { actaId: id } }),
    ]);
    return {
      tareasCreadas: tareas,
      riesgosCreados,
      riesgosActualizados,
      conclusiones,
      temasRevisados: temas,
    };
  }

  /** Envía el acta: pasa a 'enviada' (inmutable) y queda visible en lo público. */
  async enviar(id: string) {
    await this.exigirBorrador(id);
    await this.prisma.acta.update({
      where: { id },
      data: { estado: 'enviada', enviadaEn: new Date() },
    });
    return this.obtener(id);
  }

  // ─── Vistas públicas (solo actas enviadas, sin documentos anexos) ─────

  async listarPublicas() {
    const proyecto = await this.prisma.proyecto.findFirst({ orderBy: { creadoEn: 'asc' } });
    if (!proyecto) return [];
    const actas = await this.prisma.acta.findMany({
      where: { proyectoId: proyecto.id, estado: 'enviada' },
      orderBy: { numero: 'desc' },
      select: { id: true, numero: true, fecha: true, actividadTema: true, objetivo: true },
    });
    return actas.map((a) => ({
      id: a.id,
      numero: a.numero,
      fecha: a.fecha,
      tema: a.actividadTema,
      objetivo: a.objetivo,
    }));
  }

  async obtenerPublica(id: string) {
    const acta = await this.prisma.acta.findUnique({
      where: { id },
      include: {
        asistentes: {
          select: {
            nombre: true,
            organizacion: true,
            rolEnReunion: true,
            esInvitado: true,
            usuario: { select: { nombre: true } },
          },
        },
        temas: { orderBy: { orden: 'asc' } },
        conclusiones: { orderBy: { orden: 'asc' } },
        tareas: {
          select: {
            nombre: true,
            estado: true,
            avancePorcentaje: true,
            fechaCompromiso: true,
            usuario: { select: { nombre: true } },
          },
        },
        riesgosOrigen: {
          select: {
            descripcion: true,
            estado: true,
            nivel: true,
            responsable: { select: { nombre: true } },
          },
        },
      },
    });
    // Solo se publican las enviadas; los documentos anexos nunca se incluyen.
    if (!acta || acta.estado !== 'enviada') throw new NotFoundException('Acta no encontrada');
    return acta;
  }
}
