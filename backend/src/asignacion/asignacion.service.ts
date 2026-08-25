import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvanceService } from '../avance/avance.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { CrearAsignacionComponenteDto } from './dto/crear-asignacion-componente.dto';
import { derivarEstado } from '../dominio/estado-actividad';
import { calcularDesviacion } from '../dominio/desviacion-cronograma';

@Injectable()
export class AsignacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avances: AvanceService,
  ) {}

  /** Asigna (o reajusta el peso de) un Colaborador a una Actividad (RN-08: los pesos nunca suman más de 100 %). */
  async asignar(actividadId: string, dto: CrearAsignacionDto) {
    const actividad = await this.prisma.actividad.findUnique({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    const usuario = await this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const existentes = await this.prisma.asignacion.findMany({ where: { actividadId } });
    const sumaSinEste = existentes
      .filter((a) => a.usuarioId !== dto.usuarioId)
      .reduce((acc, a) => acc + a.pesoTrabajoPorcentaje, 0);
    const nuevaSuma = sumaSinEste + dto.pesoTrabajoPorcentaje;
    if (nuevaSuma > 100.01) {
      throw new BadRequestException(
        `La suma de pesos de esta actividad quedaría en ${nuevaSuma.toFixed(1)} %, más de 100 %. ` +
          `Reduce este peso o ajusta primero el de otro colaborador (suma actual sin este: ${sumaSinEste.toFixed(1)} %).`,
      );
    }

    const asignacion = await this.prisma.asignacion.upsert({
      where: { actividadId_usuarioId: { actividadId, usuarioId: dto.usuarioId } },
      update: { pesoTrabajoPorcentaje: dto.pesoTrabajoPorcentaje },
      create: {
        actividadId,
        usuarioId: dto.usuarioId,
        pesoTrabajoPorcentaje: dto.pesoTrabajoPorcentaje,
      },
    });
    await this.avances.recalcularActividad(actividadId);
    return asignacion;
  }

  /** Lista las asignaciones de una Actividad e informa si los pesos suman 100 % (RN-08). */
  async listar(actividadId: string) {
    const asignaciones = await this.prisma.asignacion.findMany({
      where: { actividadId },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    });
    const sumaPesos = asignaciones.reduce((acc, a) => acc + a.pesoTrabajoPorcentaje, 0);
    return { asignaciones, sumaPesos, pesosValidos: Math.abs(sumaPesos - 100) <= 0.01 };
  }

  async quitar(actividadId: string, asignacionId: string) {
    const asignacion = await this.prisma.asignacion.findUnique({ where: { id: asignacionId } });
    if (!asignacion || asignacion.actividadId !== actividadId) {
      throw new NotFoundException('Asignación no encontrada');
    }
    await this.prisma.asignacion.delete({ where: { id: asignacionId } });
    await this.avances.recalcularActividad(actividadId);
    return { mensaje: 'Asignación eliminada' };
  }

  /**
   * Asigna (o reajusta el peso de) un Colaborador a una Subactividad (RN-08
   * aplicado a ese nivel: los pesos de una misma subactividad nunca suman
   * más de 100 %). Es informativo — no participa en el cálculo del avance,
   * que sigue viniendo de AvanceSubactividad.
   */
  async asignarSubactividad(subactividadId: string, dto: CrearAsignacionDto) {
    const subactividad = await this.prisma.subactividad.findUnique({
      where: { id: subactividadId },
    });
    if (!subactividad) throw new NotFoundException('Subactividad no encontrada');
    const usuario = await this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const existentes = await this.prisma.asignacionSubactividad.findMany({
      where: { subactividadId },
    });
    const sumaSinEste = existentes
      .filter((a) => a.usuarioId !== dto.usuarioId)
      .reduce((acc, a) => acc + a.pesoTrabajoPorcentaje, 0);
    const nuevaSuma = sumaSinEste + dto.pesoTrabajoPorcentaje;
    if (nuevaSuma > 100.01) {
      throw new BadRequestException(
        `La suma de pesos de esta subactividad quedaría en ${nuevaSuma.toFixed(1)} %, más de 100 %. ` +
          `Reduce este peso o ajusta primero el de otro colaborador (suma actual sin este: ${sumaSinEste.toFixed(1)} %).`,
      );
    }

    return this.prisma.asignacionSubactividad.upsert({
      where: { subactividadId_usuarioId: { subactividadId, usuarioId: dto.usuarioId } },
      update: { pesoTrabajoPorcentaje: dto.pesoTrabajoPorcentaje },
      create: {
        subactividadId,
        usuarioId: dto.usuarioId,
        pesoTrabajoPorcentaje: dto.pesoTrabajoPorcentaje,
      },
    });
  }

  /** Lista las asignaciones de una Subactividad e informa si los pesos suman 100 %. */
  async listarSubactividad(subactividadId: string) {
    const asignaciones = await this.prisma.asignacionSubactividad.findMany({
      where: { subactividadId },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    });
    const sumaPesos = asignaciones.reduce((acc, a) => acc + a.pesoTrabajoPorcentaje, 0);
    return { asignaciones, sumaPesos, pesosValidos: Math.abs(sumaPesos - 100) <= 0.01 };
  }

  async quitarSubactividad(subactividadId: string, asignacionId: string) {
    const asignacion = await this.prisma.asignacionSubactividad.findUnique({
      where: { id: asignacionId },
    });
    if (!asignacion || asignacion.subactividadId !== subactividadId) {
      throw new NotFoundException('Asignación no encontrada');
    }
    await this.prisma.asignacionSubactividad.delete({ where: { id: asignacionId } });
    return { mensaje: 'Asignación eliminada' };
  }

  // ─── Asignación por Componente (Fase) ─────────────────────────────
  // Distribución de responsabilidad de un Componente entre sus Colaboradores:
  // suma 100 % (RN-08 a nivel de Componente). Es informativa (no altera el
  // cálculo del avance). Al incorporar un nuevo Colaborador hay que reducir el
  // peso de otro(s) para seguir en 100 %.

  /** Asigna (o reajusta) el % de participación de un Colaborador en un Componente. */
  async asignarComponente(faseId: string, dto: CrearAsignacionComponenteDto) {
    const fase = await this.prisma.fase.findUnique({ where: { id: faseId } });
    if (!fase) throw new NotFoundException('Componente no encontrado');
    const usuario = await this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const existentes = await this.prisma.asignacionComponente.findMany({ where: { faseId } });
    const sumaSinEste = existentes
      .filter((a) => a.usuarioId !== dto.usuarioId)
      .reduce((acc, a) => acc + a.pesoPorcentaje, 0);
    const nuevaSuma = sumaSinEste + dto.pesoPorcentaje;
    if (nuevaSuma > 100.01) {
      throw new BadRequestException(
        `La suma de participación de este componente quedaría en ${nuevaSuma.toFixed(1)} %, más de 100 %. ` +
          `Reduce este porcentaje o ajusta primero el de otro colaborador (suma actual sin este: ${sumaSinEste.toFixed(1)} %).`,
      );
    }

    return this.prisma.asignacionComponente.upsert({
      where: { faseId_usuarioId: { faseId, usuarioId: dto.usuarioId } },
      update: { pesoPorcentaje: dto.pesoPorcentaje },
      create: { faseId, usuarioId: dto.usuarioId, pesoPorcentaje: dto.pesoPorcentaje },
    });
  }

  /** Lista la distribución de un Componente e informa si suma 100 %. */
  async listarComponente(faseId: string) {
    const asignaciones = await this.prisma.asignacionComponente.findMany({
      where: { faseId },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
      orderBy: { pesoPorcentaje: 'desc' },
    });
    const sumaPesos = asignaciones.reduce((acc, a) => acc + a.pesoPorcentaje, 0);
    return { asignaciones, sumaPesos, pesosValidos: Math.abs(sumaPesos - 100) <= 0.01 };
  }

  async quitarComponente(faseId: string, asignacionId: string) {
    const asignacion = await this.prisma.asignacionComponente.findUnique({
      where: { id: asignacionId },
    });
    if (!asignacion || asignacion.faseId !== faseId) {
      throw new NotFoundException('Asignación no encontrada');
    }
    await this.prisma.asignacionComponente.delete({ where: { id: asignacionId } });
    return { mensaje: 'Asignación eliminada' };
  }

  /**
   * Actividades asignadas a un Colaborador ("mis actividades"): incluye tanto
   * la asignación directa a la Actividad como la asignación a cualquiera de
   * sus Subactividades (el responsable real puede estar asignado solo ahí).
   * Si aparece por ambos caminos para la misma actividad, se muestra una vez.
   */
  async misActividades(usuarioId: string) {
    const [porActividad, porSubactividad] = await Promise.all([
      this.prisma.asignacion.findMany({
        where: { usuarioId },
        include: { actividad: { include: { fase: { select: { id: true, nombre: true } } } } },
      }),
      this.prisma.asignacionSubactividad.findMany({
        where: { usuarioId },
        include: {
          subactividad: {
            include: { actividad: { include: { fase: { select: { id: true, nombre: true } } } } },
          },
        },
      }),
    ]);

    const ahora = new Date();
    // Mismo estado por fecha límite y desviación de cronograma que ve el
    // tablero público (dominio compartido), para que el colaborador entienda
    // de un vistazo si alguna de sus actividades está atrasada.
    const enriquecer = <
      T extends {
        finalizada: boolean;
        avancePorcentaje: number;
        fechaInicioPlan: Date | null;
        fechaFinPlan: Date | null;
      },
    >(
      actividad: T,
    ) => ({
      ...actividad,
      estado: derivarEstado(actividad, ahora),
      ...calcularDesviacion(actividad, ahora),
    });

    const vistos = new Set(porActividad.map((a) => a.actividadId));
    const resultado = porActividad.map((a) => ({
      asignacionId: a.id,
      pesoTrabajoPorcentaje: a.pesoTrabajoPorcentaje,
      actividad: enriquecer(a.actividad),
    }));

    for (const asg of porSubactividad) {
      const actividadId = asg.subactividad.actividadId;
      if (vistos.has(actividadId)) continue;
      vistos.add(actividadId);
      resultado.push({
        asignacionId: asg.id,
        pesoTrabajoPorcentaje: asg.pesoTrabajoPorcentaje,
        actividad: enriquecer(asg.subactividad.actividad),
      });
    }

    return resultado;
  }
}
