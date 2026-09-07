import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearRiesgoDto } from './dto/crear-riesgo.dto';
import { ActualizarRiesgoDto } from './dto/actualizar-riesgo.dto';

// Riesgos por Actividad (nivel 3, tabla `subactividad`). Los 'abierto' se
// arrastran a la siguiente acta hasta cerrarse (RN-ACTA-07).
@Injectable()
export class RiesgoService {
  constructor(private readonly prisma: PrismaService) {}

  listarPorActividad(subactividadId: string) {
    return this.prisma.riesgo.findMany({
      where: { subactividadId },
      orderBy: [{ estado: 'asc' }, { creadoEn: 'desc' }],
      include: { responsable: { select: { id: true, nombre: true } } },
    });
  }

  async crear(subactividadId: string, dto: CrearRiesgoDto) {
    const actividad = await this.prisma.subactividad.findUnique({ where: { id: subactividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    return this.prisma.riesgo.create({
      data: {
        subactividadId,
        actaOrigenId: dto.actaOrigenId,
        descripcion: dto.descripcion,
        probabilidad: dto.probabilidad,
        impacto: dto.impacto,
        nivel: dto.nivel,
        responsableId: dto.responsableId,
        mitigacion: dto.mitigacion,
        observaciones: dto.observaciones,
      },
    });
  }

  async actualizar(id: string, dto: ActualizarRiesgoDto) {
    const riesgo = await this.prisma.riesgo.findUnique({ where: { id } });
    if (!riesgo) throw new NotFoundException('Riesgo no encontrado');

    const actualizado = await this.prisma.riesgo.update({
      where: { id },
      data: {
        descripcion: dto.descripcion,
        estado: dto.estado,
        probabilidad: dto.probabilidad,
        impacto: dto.impacto,
        nivel: dto.nivel,
        responsableId: dto.responsableId,
        mitigacion: dto.mitigacion,
        observaciones: dto.observaciones,
      },
    });

    // Deja rastro de la revisión (qué se cambió y en qué acta).
    await this.prisma.riesgoActualizacion.create({
      data: {
        riesgoId: id,
        actaId: dto.actaId,
        estado: dto.estado,
        probabilidad: dto.probabilidad,
        impacto: dto.impacto,
        nivel: dto.nivel,
        nota: dto.observaciones,
      },
    });
    return actualizado;
  }

  /** Riesgos abiertos de todo el proyecto (para precargar la nueva acta). */
  riesgosAbiertosDelProyecto(proyectoId: string) {
    return this.prisma.riesgo.findMany({
      where: {
        estado: 'abierto',
        subactividad: { actividad: { fase: { proyectoId } } },
      },
      orderBy: { creadoEn: 'desc' },
      include: {
        responsable: { select: { id: true, nombre: true } },
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
