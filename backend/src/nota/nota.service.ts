import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearNotaDto } from './dto/crear-nota.dto';

const SELECT_PUBLICO = {
  id: true,
  actividadId: true,
  texto: true,
  resuelta: true,
  creadoEn: true,
  autor: { select: { nombre: true } },
} as const;

@Injectable()
export class NotaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lectura pública (RN de transparencia): pendientes primero, más recientes primero. */
  listar(actividadId?: string) {
    return this.prisma.nota.findMany({
      where: actividadId ? { actividadId } : undefined,
      orderBy: [{ resuelta: 'asc' }, { creadoEn: 'desc' }],
      select: SELECT_PUBLICO,
    });
  }

  crear(autorId: string, dto: CrearNotaDto) {
    return this.prisma.nota.create({
      data: { autorId, texto: dto.texto, actividadId: dto.actividadId },
      select: SELECT_PUBLICO,
    });
  }

  private async obtener(id: string) {
    const nota = await this.prisma.nota.findUnique({ where: { id } });
    if (!nota) throw new NotFoundException('Nota no encontrada');
    return nota;
  }

  async marcarResuelta(id: string, resuelta: boolean) {
    await this.obtener(id);
    return this.prisma.nota.update({ where: { id }, data: { resuelta }, select: SELECT_PUBLICO });
  }

  async eliminar(id: string, usuarioId: string, esAdmin: boolean) {
    const nota = await this.obtener(id);
    if (!esAdmin && nota.autorId !== usuarioId) {
      throw new ForbiddenException('Solo el autor o un administrador puede eliminar la nota');
    }
    await this.prisma.nota.delete({ where: { id } });
    return { mensaje: 'Nota eliminada' };
  }
}
