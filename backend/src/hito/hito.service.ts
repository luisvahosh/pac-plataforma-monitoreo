import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearHitoDto } from './dto/crear-hito.dto';
import { ActualizarHitoDto } from './dto/actualizar-hito.dto';

@Injectable()
export class HitoService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearHitoDto) {
    return this.prisma.hito.create({
      data: {
        actividadId: dto.actividadId,
        nombre: dto.nombre,
        fechaObjetivo: dto.fechaObjetivo ? new Date(dto.fechaObjetivo) : undefined,
        cumplido: dto.cumplido ?? false,
      },
    });
  }

  listarPorActividad(actividadId: string) {
    return this.prisma.hito.findMany({ where: { actividadId } });
  }

  async obtener(id: string) {
    const hito = await this.prisma.hito.findUnique({ where: { id } });
    if (!hito) throw new NotFoundException('Hito no encontrado');
    return hito;
  }

  async actualizar(id: string, dto: ActualizarHitoDto) {
    await this.obtener(id);
    // La fecha objetivo, al ser parte de la Línea Base, debe cambiarse por el
    // flujo autorizado (LineaBaseService), no por este update directo.
    return this.prisma.hito.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        cumplido: dto.cumplido,
      },
    });
  }

  async eliminar(id: string) {
    await this.obtener(id);
    return this.prisma.hito.delete({ where: { id } });
  }
}
