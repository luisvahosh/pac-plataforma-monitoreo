import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvanceService } from '../avance/avance.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';

@Injectable()
export class AsignacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avances: AvanceService,
  ) {}

  /** Asigna (o reajusta el peso de) un Colaborador a una Actividad. */
  async asignar(actividadId: string, dto: CrearAsignacionDto) {
    const actividad = await this.prisma.actividad.findUnique({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    const usuario = await this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const asignacion = await this.prisma.asignacion.upsert({
      where: { actividadId_usuarioId: { actividadId, usuarioId: dto.usuarioId } },
      update: { pesoTrabajoPorcentaje: dto.pesoTrabajoPorcentaje },
      create: {
        actividadId,
        usuarioId: dto.usuarioId,
        pesoTrabajoPorcentaje: dto.pesoTrabajoPorcentaje,
      },
    });
    await this.avances.recalcularActividad(actividadId);
    return asignacion;
  }

  /** Lista las asignaciones de una Actividad e informa si los pesos suman 100 % (RN-08). */
  async listar(actividadId: string) {
    const asignaciones = await this.prisma.asignacion.findMany({
      where: { actividadId },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    });
    const sumaPesos = asignaciones.reduce((acc, a) => acc + a.pesoTrabajoPorcentaje, 0);
    return { asignaciones, sumaPesos, pesosValidos: Math.abs(sumaPesos - 100) <= 0.01 };
  }

  async quitar(actividadId: string, asignacionId: string) {
    const asignacion = await this.prisma.asignacion.findUnique({ where: { id: asignacionId } });
    if (!asignacion || asignacion.actividadId !== actividadId) {
      throw new NotFoundException('Asignación no encontrada');
    }
    await this.prisma.asignacion.delete({ where: { id: asignacionId } });
    await this.avances.recalcularActividad(actividadId);
    return { mensaje: 'Asignación eliminada' };
  }

  /** Actividades asignadas a un Colaborador ("mis actividades"). */
  async misActividades(usuarioId: string) {
    const asignaciones = await this.prisma.asignacion.findMany({
      where: { usuarioId },
      include: {
        actividad: { include: { fase: { select: { id: true, nombre: true } } } },
      },
    });
    return asignaciones.map((a) => ({
      asignacionId: a.id,
      pesoTrabajoPorcentaje: a.pesoTrabajoPorcentaje,
      actividad: a.actividad,
    }));
  }
}
