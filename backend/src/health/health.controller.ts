import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{
    estado: string;
    servicio: string;
    baseDatos: string;
    hora: string;
  }> {
    let baseDatos = 'error';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      baseDatos = 'ok';
    } catch {
      baseDatos = 'error';
    }
    return {
      estado: baseDatos === 'ok' ? 'ok' : 'degradado',
      servicio: 'backend',
      baseDatos,
      hora: new Date().toISOString(),
    };
  }
}
