import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface EventoAuditoriaEntrada {
  usuarioId?: string;
  accion: string;
  entidadTipo?: string | null;
  entidadId?: string | null;
  detalle?: Prisma.InputJsonValue;
  ip?: string;
}

export interface FiltrosAuditoria {
  usuarioId?: string;
  entidadTipo?: string;
  entidadId?: string;
  accion?: string;
  desde?: string;
  hasta?: string;
  limite?: number;
  offset?: number;
}

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Registra un evento de auditoría (append-only, RN-17). */
  registrar(evento: EventoAuditoriaEntrada) {
    return this.prisma.eventoAuditoria.create({
      data: {
        usuarioId: evento.usuarioId,
        accion: evento.accion,
        entidadTipo: evento.entidadTipo ?? undefined,
        entidadId: evento.entidadId ?? undefined,
        detalle: evento.detalle,
        ip: evento.ip,
      },
    });
  }

  /** Consulta filtrable (solo lectura, RN-18). */
  consultar(f: FiltrosAuditoria) {
    const where: Prisma.EventoAuditoriaWhereInput = {};
    if (f.usuarioId) where.usuarioId = f.usuarioId;
    if (f.entidadTipo) where.entidadTipo = f.entidadTipo;
    if (f.entidadId) where.entidadId = f.entidadId;
    if (f.accion) where.accion = f.accion;
    if (f.desde || f.hasta) {
      where.fechaHora = {};
      if (f.desde) where.fechaHora.gte = new Date(f.desde);
      if (f.hasta) where.fechaHora.lte = new Date(f.hasta);
    }
    return this.prisma.eventoAuditoria.findMany({
      where,
      orderBy: { fechaHora: 'desc' },
      take: f.limite ?? 100,
      skip: f.offset ?? 0,
    });
  }
}
