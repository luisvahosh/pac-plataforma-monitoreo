import { LineaBaseService } from './linea-base.service';

// Prueba de inmutabilidad de la Línea Base (RN-07) a nivel de servicio, con un
// PrismaService simulado (no requiere base de datos).

describe('LineaBaseService — inmutabilidad (RN-07)', () => {
  const fechaOriginal = new Date('2026-09-01T00:00:00.000Z');
  const fechaNueva = new Date('2026-10-15T00:00:00.000Z');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prismaMock: any;
  let service: LineaBaseService;

  beforeEach(() => {
    prismaMock = {
      actividad: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'act1',
          fechaInicioPlan: null,
          fechaFinPlan: fechaOriginal,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      hito: { findUnique: jest.fn(), update: jest.fn() },
      cambioLineaBase: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: jest.fn().mockImplementation((args: any) => ({ id: 'c1', ...args.data })),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
    };
    service = new LineaBaseService(prismaMock);
  });

  it('conserva la fecha original, registra el cambio y actualiza la fecha vigente', async () => {
    const registro = await service.cambiar({
      entidadTipo: 'actividad',
      entidadId: 'act1',
      campo: 'fecha_fin',
      fechaNueva: fechaNueva.toISOString(),
      justificacion: 'reprogramación autorizada',
    });

    expect(prismaMock.cambioLineaBase.create).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = registro as any;
    expect(r.fechaOriginal).toEqual(fechaOriginal);
    expect(r.fechaNueva).toEqual(fechaNueva);
    expect(r.justificacion).toBe('reprogramación autorizada');

    // La fecha vigente de la actividad se actualizó a la nueva.
    expect(prismaMock.actividad.update).toHaveBeenCalledWith({
      where: { id: 'act1' },
      data: { fechaFinPlan: fechaNueva },
    });

    // El historial es inmutable: el servicio no dispone de update/delete sobre él.
    expect(prismaMock.cambioLineaBase.update).toBeUndefined();
    expect(prismaMock.cambioLineaBase.delete).toBeUndefined();
  });

  it('rechaza un campo inválido para una actividad', async () => {
    await expect(
      service.cambiar({
        entidadTipo: 'actividad',
        entidadId: 'act1',
        campo: 'fecha_objetivo',
        fechaNueva: fechaNueva.toISOString(),
        justificacion: 'campo incorrecto',
      }),
    ).rejects.toThrow();
  });
});
