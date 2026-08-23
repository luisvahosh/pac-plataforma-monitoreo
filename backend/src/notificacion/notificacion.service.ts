import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CorreoService } from '../correo/correo.service';
import { ReglaAlertaService } from './regla-alerta.service';
import { evaluarAlerta } from '../dominio/alertas';

@Injectable()
export class NotificacionService {
  private readonly logger = new Logger(NotificacionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly correo: CorreoService,
    private readonly reglas: ReglaAlertaService,
  ) {}

  private async yaEnviada(
    tipo: string,
    entidadId: string,
    usuarioId: string,
    umbralDias: number | null,
  ): Promise<boolean> {
    const existe = await this.prisma.notificacionEnviada.findFirst({
      where: { tipo, entidadId, usuarioId, umbralDias },
    });
    return !!existe;
  }

  private registrar(
    tipo: string,
    usuarioId: string,
    entidadId: string,
    umbralDias: number | null,
  ) {
    return this.prisma.notificacionEnviada.create({
      data: { tipo, usuarioId, entidadTipo: 'actividad', entidadId, umbralDias },
    });
  }

  /** Evalúa el cronograma y envía alertas de vencimiento sin duplicar (RN-11). */
  async evaluarVencimientos(): Promise<{ actividades: number; enviadas: number }> {
    const regla = await this.reglas.obtener();
    if (!regla.activo) return { actividades: 0, enviadas: 0 };
    const umbrales = regla.diasAnticipacion;
    const ahora = new Date();

    const actividades = await this.prisma.actividad.findMany({
      where: { finalizada: false, fechaFinPlan: { not: null } },
      include: {
        asignaciones: { include: { usuario: { select: { id: true, email: true } } } },
      },
    });

    let enviadas = 0;
    for (const act of actividades) {
      if (!act.fechaFinPlan) continue;
      const resultado = evaluarAlerta(act.fechaFinPlan, ahora, umbrales);
      const destinatarios = act.asignaciones.map((a) => a.usuario);

      if (resultado.vencida) {
        for (const dest of destinatarios) {
          if (!(await this.yaEnviada('vencida', act.id, dest.id, null))) {
            await this.correo.enviarAlertaVencida(dest.email, act.nombre);
            await this.registrar('vencida', dest.id, act.id, null);
            enviadas += 1;
          }
        }
      }

      for (const umbral of resultado.umbralesAlcanzados) {
        for (const dest of destinatarios) {
          if (!(await this.yaEnviada('proxima_a_vencer', act.id, dest.id, umbral))) {
            await this.correo.enviarAlertaProximaVencer(dest.email, act.nombre, umbral);
            await this.registrar('proxima_a_vencer', dest.id, act.id, umbral);
            enviadas += 1;
          }
        }
      }
    }

    this.logger.log(`Evaluación de vencimientos: ${actividades.length} actividades, ${enviadas} alertas enviadas.`);
    return { actividades: actividades.length, enviadas };
  }

  /** Confirmación por correo al registrar un avance (RNF-16). */
  async confirmarRegistroAvance(
    actividadId: string,
    autorId: string,
    porcentaje: number,
  ): Promise<void> {
    const actividad = await this.prisma.actividad.findUnique({ where: { id: actividadId } });
    const autor = await this.prisma.usuario.findUnique({ where: { id: autorId } });
    if (!actividad || !autor) return;
    await this.correo.enviarConfirmacionAvance(autor.email, actividad.nombre, porcentaje);
    await this.prisma.notificacionEnviada.create({
      data: {
        tipo: 'confirmacion_avance',
        usuarioId: autorId,
        entidadTipo: 'actividad',
        entidadId: actividadId,
      },
    });
  }

  listarEnviadas() {
    return this.prisma.notificacionEnviada.findMany({
      orderBy: { fechaHora: 'desc' },
      take: 200,
    });
  }
}
