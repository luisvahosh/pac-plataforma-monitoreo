import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReglaAlertaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Obtiene la regla global (la crea con valores por defecto si no existe). */
  async obtener() {
    const existente = await this.prisma.reglaAlerta.findFirst({ where: { ambito: 'global' } });
    if (existente) return existente;
    return this.prisma.reglaAlerta.create({
      data: { ambito: 'global', diasAnticipacion: [7, 3, 1], activo: true },
    });
  }

  async actualizar(diasAnticipacion: number[], activo: boolean) {
    const regla = await this.obtener();
    return this.prisma.reglaAlerta.update({
      where: { id: regla.id },
      data: { diasAnticipacion, activo },
    });
  }
}
