import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { ActualizarTareaDto } from './dto/actualizar-tarea.dto';

// Tareas / compromisos (action-items). NO pesan en el avance del proyecto, pero
// quedan integradas al seguimiento (RN-ACTA-09) y son consultables después.
@Injectable()
export class TareaService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly incluir = {
    usuario: { select: { id: true, nombre: true } },
    actividad: { select: { id: true, nombre: true } },
    subactividad: { select: { id: true, descripcion: true } },
  };

  listar(filtros: { actividadId?: string; subactividadId?: string; actaOrigenId?: string }) {
    return this.prisma.tarea.findMany({
      where: {
        actividadId: filtros.actividadId,
        subactividadId: filtros.subactividadId,
        actaOrigenId: filtros.actaOrigenId,
      },
      orderBy: [{ estado: 'asc' }, { fechaCompromiso: 'asc' }],
      include: this.incluir,
    });
  }

  crear(dto: CrearTareaDto) {
    return this.prisma.tarea.create({
      data: {
        descripcion: dto.descripcion,
        actividadId: dto.actividadId,
        subactividadId: dto.subactividadId,
        usuarioId: dto.usuarioId,
        fechaCompromiso: dto.fechaCompromiso ? new Date(dto.fechaCompromiso) : undefined,
        prioridad: dto.prioridad ?? 'media',
        estado: dto.estado ?? 'pendiente',
        observaciones: dto.observaciones,
        actaOrigenId: dto.actaOrigenId,
      },
      include: this.incluir,
    });
  }

  async actualizar(id: string, dto: ActualizarTareaDto) {
    const tarea = await this.prisma.tarea.findUnique({ where: { id } });
    if (!tarea) throw new NotFoundException('Tarea no encontrada');
    return this.prisma.tarea.update({
      where: { id },
      data: {
        descripcion: dto.descripcion,
        usuarioId: dto.usuarioId,
        fechaCompromiso: dto.fechaCompromiso ? new Date(dto.fechaCompromiso) : undefined,
        prioridad: dto.prioridad,
        estado: dto.estado,
        observaciones: dto.observaciones,
      },
      include: this.incluir,
    });
  }

  /** Compromisos pendientes (no 'hecha') de todo el proyecto, para la nueva acta. */
  pendientesDelProyecto(proyectoId: string) {
    return this.prisma.tarea.findMany({
      where: {
        estado: { not: 'hecha' },
        OR: [
          { actividad: { fase: { proyectoId } } },
          { subactividad: { actividad: { fase: { proyectoId } } } },
        ],
      },
      orderBy: { fechaCompromiso: 'asc' },
      include: this.incluir,
    });
  }
}
