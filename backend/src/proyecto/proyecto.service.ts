import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ActualizarProyectoDto } from './dto/actualizar-proyecto.dto';

@Injectable()
export class ProyectoService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearProyectoDto) {
    return this.prisma.proyecto.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        objetivos: dto.objetivos,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      },
    });
  }

  listar() {
    return this.prisma.proyecto.findMany({ orderBy: { creadoEn: 'asc' } });
  }

  async obtener(id: string) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');
    return proyecto;
  }

  async actualizar(id: string, dto: ActualizarProyectoDto) {
    await this.obtener(id);
    return this.prisma.proyecto.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        objetivos: dto.objetivos,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      },
    });
  }

  async eliminar(id: string) {
    await this.obtener(id);
    return this.prisma.proyecto.delete({ where: { id } });
  }
}
