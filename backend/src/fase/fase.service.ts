import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearFaseDto } from './dto/crear-fase.dto';
import { ActualizarFaseDto } from './dto/actualizar-fase.dto';
import { sumaPesosFases, validarPesosFases } from '../dominio/calculo-avance';

@Injectable()
export class FaseService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearFaseDto) {
    return this.prisma.fase.create({
      data: {
        proyectoId: dto.proyectoId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        pesoPorcentaje: dto.pesoPorcentaje,
        orden: dto.orden ?? 0,
      },
    });
  }

  listarPorProyecto(proyectoId: string) {
    return this.prisma.fase.findMany({
      where: { proyectoId },
      orderBy: { orden: 'asc' },
    });
  }

  async obtener(id: string) {
    const fase = await this.prisma.fase.findUnique({ where: { id } });
    if (!fase) throw new NotFoundException('Fase no encontrada');
    return fase;
  }

  async actualizar(id: string, dto: ActualizarFaseDto) {
    await this.obtener(id);
    return this.prisma.fase.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        pesoPorcentaje: dto.pesoPorcentaje,
        orden: dto.orden,
      },
    });
  }

  async eliminar(id: string) {
    await this.obtener(id);
    return this.prisma.fase.delete({ where: { id } });
  }

  /** Valida que los pesos de las Fases de un Proyecto sumen 100 % (RN-02). */
  async validarPesos(proyectoId: string) {
    const fases = await this.listarPorProyecto(proyectoId);
    return {
      proyectoId,
      sumaPesos: sumaPesosFases(fases),
      valido: validarPesosFases(fases),
    };
  }
}
