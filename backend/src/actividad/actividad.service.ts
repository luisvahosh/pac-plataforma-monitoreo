import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearActividadDto } from './dto/crear-actividad.dto';
import { ActualizarActividadDto } from './dto/actualizar-actividad.dto';
import { derivarEstado, EstadoActividad } from '../dominio/estado-actividad';

@Injectable()
export class ActividadService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearActividadDto) {
    return this.prisma.actividad.create({
      data: {
        faseId: dto.faseId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        fechaInicioPlan: dto.fechaInicioPlan ? new Date(dto.fechaInicioPlan) : undefined,
        fechaFinPlan: dto.fechaFinPlan ? new Date(dto.fechaFinPlan) : undefined,
        finalizada: dto.finalizada ?? false,
        avancePorcentaje: dto.avancePorcentaje ?? 0,
      },
    });
  }

  listarPorFase(faseId: string) {
    return this.prisma.actividad.findMany({ where: { faseId } });
  }

  async obtener(id: string) {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id },
      include: {
        dependeDe: { include: { dependeDe: { select: { id: true, nombre: true } } } },
        esDependenciaDe: { include: { actividad: { select: { id: true, nombre: true } } } },
      },
    });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    return actividad;
  }

  async actualizar(id: string, dto: ActualizarActividadDto) {
    await this.obtener(id);
    // Ojo: los cambios de fecha que forman parte de la Línea Base deben pasar por
    // el flujo de cambio autorizado (LineaBaseService), no por este update directo.
    return this.prisma.actividad.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        finalizada: dto.finalizada,
        avancePorcentaje: dto.avancePorcentaje,
      },
    });
  }

  async eliminar(id: string) {
    await this.obtener(id);
    return this.prisma.actividad.delete({ where: { id } });
  }

  /** Estado derivado (RN-03/RN-04), con umbral configurable. */
  async estado(id: string, umbralDias?: number): Promise<{ id: string; estado: EstadoActividad }> {
    const a = await this.obtener(id);
    const estado = derivarEstado(
      {
        finalizada: a.finalizada,
        avancePorcentaje: a.avancePorcentaje,
        fechaInicioPlan: a.fechaInicioPlan,
        fechaFinPlan: a.fechaFinPlan,
      },
      new Date(),
      umbralDias,
    );
    return { id: a.id, estado };
  }
}
