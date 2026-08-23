import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEnlaceDto } from './dto/crear-enlace.dto';
import { SubirArchivoDto } from './dto/subir-archivo.dto';
import { EVIDENCIAS_DIR } from './evidencia.storage';

// Metadatos que se exponen en el listado: NUNCA se incluye archivo_ref.
const SELECT_LISTA = {
  id: true,
  tipo: true,
  url: true,
  nombreArchivo: true,
  mime: true,
  tamanoBytes: true,
  observacion: true,
  fechaHora: true,
  avanceId: true,
  autor: { select: { id: true, nombre: true } },
} satisfies Prisma.EvidenciaSelect;

@Injectable()
export class EvidenciaService {
  constructor(private readonly prisma: PrismaService) {}

  private async verificarPermisoCarga(actividadId: string, usuarioId: string, esAdmin: boolean) {
    const actividad = await this.prisma.actividad.findUnique({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    if (esAdmin) return;
    const asignacion = await this.prisma.asignacion.findUnique({
      where: { actividadId_usuarioId: { actividadId, usuarioId } },
    });
    if (!asignacion) throw new ForbiddenException('No estás asignado a esta actividad');
  }

  async crearEnlace(actividadId: string, autorId: string, esAdmin: boolean, dto: CrearEnlaceDto) {
    await this.verificarPermisoCarga(actividadId, autorId, esAdmin);
    return this.prisma.evidencia.create({
      data: {
        actividadId,
        autorId,
        avanceId: dto.avanceId,
        tipo: 'enlace',
        url: dto.url,
        observacion: dto.observacion,
      },
      select: SELECT_LISTA,
    });
  }

  async crearArchivo(
    actividadId: string,
    autorId: string,
    esAdmin: boolean,
    dto: SubirArchivoDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new NotFoundException('No se recibió ningún archivo');
    await this.verificarPermisoCarga(actividadId, autorId, esAdmin);

    const checksum = createHash('sha256').update(readFileSync(file.path)).digest('hex');
    return this.prisma.evidencia.create({
      data: {
        actividadId,
        autorId,
        avanceId: dto.avanceId,
        tipo: dto.tipo,
        archivoRef: file.filename,
        nombreArchivo: file.originalname,
        mime: file.mimetype,
        tamanoBytes: file.size,
        checksum,
        observacion: dto.observacion,
      },
      select: SELECT_LISTA,
    });
  }

  listar(actividadId: string) {
    return this.prisma.evidencia.findMany({
      where: { actividadId },
      orderBy: { fechaHora: 'asc' },
      select: SELECT_LISTA,
    });
  }

  /** Devuelve la evidencia completa (incluye archivo_ref) para servir su contenido. */
  async obtenerCompleta(id: string) {
    const evidencia = await this.prisma.evidencia.findUnique({ where: { id } });
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');
    return evidencia;
  }

  rutaArchivo(archivoRef: string): string {
    return join(EVIDENCIAS_DIR, archivoRef);
  }

  async eliminar(id: string, usuarioId: string, esAdmin: boolean) {
    const evidencia = await this.obtenerCompleta(id);
    if (!esAdmin && evidencia.autorId !== usuarioId) {
      throw new ForbiddenException('Solo el autor o un administrador puede eliminar la evidencia');
    }
    if (evidencia.archivoRef) {
      const ruta = this.rutaArchivo(evidencia.archivoRef);
      if (existsSync(ruta)) unlinkSync(ruta);
    }
    await this.prisma.evidencia.delete({ where: { id } });
    return { mensaje: 'Evidencia eliminada' };
  }
}
