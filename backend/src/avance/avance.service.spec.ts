import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AvanceService } from './avance.service';

// Pruebas de autorización del registro de avances (RN-10), con Prisma simulado.
describe('AvanceService — autorización (RN-10)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;
  let service: AvanceService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let notificaciones: any;

  beforeEach(() => {
    notificaciones = { confirmarRegistroAvance: jest.fn().mockResolvedValue(undefined) };
    prisma = {
      actividad: {
        findUnique: jest.fn().mockResolvedValue({ id: 'act1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      asignacion: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      avance: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: jest.fn().mockImplementation((args: any) => ({ id: 'av1', ...args.data })),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      subactividad: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    service = new AvanceService(prisma, notificaciones);
  });

  it('rechaza a un colaborador NO asignado', async () => {
    prisma.asignacion.findUnique.mockResolvedValue(null);
    await expect(
      service.registrar('act1', 'colab', false, { porcentaje: 50 }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite a un colaborador asignado', async () => {
    prisma.asignacion.findUnique.mockResolvedValue({ id: 'asg1' });
    const avance = await service.registrar('act1', 'colab', false, { porcentaje: 50 });
    expect(prisma.avance.create).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((avance as any).porcentaje).toBe(50);
  });

  it('permite a un administrador aunque no esté asignado', async () => {
    prisma.asignacion.findUnique.mockResolvedValue(null);
    await service.registrar('act1', 'admin', true, { porcentaje: 70 });
    expect(prisma.avance.create).toHaveBeenCalled();
  });

  it('rechaza el avance directo si la actividad tiene subactividades', async () => {
    prisma.asignacion.findUnique.mockResolvedValue({ id: 'asg1' });
    prisma.subactividad.count.mockResolvedValue(2);
    await expect(
      service.registrar('act1', 'colab', false, { porcentaje: 50 }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.avance.create).not.toHaveBeenCalled();
  });
});
