import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearCambioLineaBaseDto } from './dto/crear-cambio-linea-base.dto';

@Injectable()
export class LineaBaseService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cambio autorizado de una fecha de la Línea Base (RN-07).
   * Conserva la fecha original en el historial (que es inmutable) y actualiza la
   * fecha vigente en la Actividad/Hito. La fecha original NUNCA se sobrescribe.
   */
  async cambiar(dto: CrearCambioLineaBaseDto) {
    const fechaNueva = new Date(dto.fechaNueva);

    if (dto.entidadTipo === 'actividad') {
      if (dto.campo !== 'fecha_inicio' && dto.campo !== 'fecha_fin') {
        throw new BadRequestException("Para una actividad, el campo debe ser 'fecha_inicio' o 'fecha_fin'.");
      }
      const actividad = await this.prisma.actividad.findUnique({ where: { id: dto.entidadId } });
      if (!actividad) throw new NotFoundException('Actividad no encontrada');

      const fechaOriginal =
        dto.campo === 'fecha_inicio' ? actividad.fechaInicioPlan : actividad.fechaFinPlan;

      const [registro] = await this.prisma.$transaction([
        this.prisma.cambioLineaBase.create({
          data: {
            entidadTipo: 'actividad',
            entidadId: dto.entidadId,
            campo: dto.campo,
            fechaOriginal,
            fechaNueva,
            usuarioId: dto.usuarioId,
            justificacion: dto.justificacion,
          },
        }),
        this.prisma.actividad.update({
          where: { id: dto.entidadId },
          data:
            dto.campo === 'fecha_inicio'
              ? { fechaInicioPlan: fechaNueva }
              : { fechaFinPlan: fechaNueva },
        }),
      ]);
      return registro;
    }

    // Hito
    if (dto.campo !== 'fecha_objetivo') {
      throw new BadRequestException("Para un hito, el campo debe ser 'fecha_objetivo'.");
    }
    const hito = await this.prisma.hito.findUnique({ where: { id: dto.entidadId } });
    if (!hito) throw new NotFoundException('Hito no encontrado');

    const [registro] = await this.prisma.$transaction([
      this.prisma.cambioLineaBase.create({
        data: {
          entidadTipo: 'hito',
          entidadId: dto.entidadId,
          campo: dto.campo,
          fechaOriginal: hito.fechaObjetivo,
          fechaNueva,
          usuarioId: dto.usuarioId,
          justificacion: dto.justificacion,
        },
      }),
      this.prisma.hito.update({
        where: { id: dto.entidadId },
        data: { fechaObjetivo: fechaNueva },
      }),
    ]);
    return registro;
  }

  /** Historial completo (inmutable) de cambios de una entidad. */
  historial(entidadTipo: 'actividad' | 'hito', entidadId: string) {
    return this.prisma.cambioLineaBase.findMany({
      where: { entidadTipo, entidadId },
      orderBy: { fechaHoraCambio: 'asc' },
    });
  }
}
