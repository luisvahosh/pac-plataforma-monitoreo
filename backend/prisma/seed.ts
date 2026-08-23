import { PrismaClient } from '@prisma/client';
import { Algorithm, hash } from '@node-rs/argon2';
import { createCipheriv, createHash, randomBytes } from 'crypto';

// Seed de datos de demostración / pruebas E2E.
// Crea un administrador y un colaborador con contraseñas conocidas y un secreto
// TOTP FIJO (solo para desarrollo/pruebas), de modo que las pruebas E2E puedan
// generar códigos 2FA válidos con otplib. NO usar estos valores en producción.

const prisma = new PrismaClient();

// Secreto TOTP de pruebas (base32). Compartido por los usuarios demo.
const TOTP_SECRET_PRUEBAS = 'JBSWY3DPEHPK3PXP';

function cifrarTotp(texto: string): string {
  const clave = createHash('sha256')
    .update(process.env.CIFRADO_2FA_SECRET ?? '')
    .digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', clave, iv);
  const enc = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':');
}

async function main(): Promise<void> {
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'administrador' },
    update: {},
    create: { nombre: 'administrador' },
  });
  const rolColab = await prisma.rol.upsert({
    where: { nombre: 'colaborador' },
    update: {},
    create: { nombre: 'colaborador' },
  });

  const passAdmin = await hash('Admin12345!', { algorithm: Algorithm.Argon2id });
  const passColab = await hash('Colab12345!', { algorithm: Algorithm.Argon2id });
  const totpCifrado = cifrarTotp(TOTP_SECRET_PRUEBAS);

  await prisma.usuario.upsert({
    where: { email: 'admin@pac.local' },
    update: {},
    create: {
      nombre: 'Admin Demo',
      email: 'admin@pac.local',
      rolId: rolAdmin.id,
      passwordHash: passAdmin,
      totpSecretCifrado: totpCifrado,
      totpHabilitado: true,
      estado: 'activo',
    },
  });
  const colab = await prisma.usuario.upsert({
    where: { email: 'colab@pac.local' },
    update: {},
    create: {
      nombre: 'Colaborador Demo',
      email: 'colab@pac.local',
      rolId: rolColab.id,
      passwordHash: passColab,
      totpSecretCifrado: totpCifrado,
      totpHabilitado: true,
      estado: 'activo',
    },
  });

  const existente = await prisma.proyecto.findFirst();
  if (!existente) {
    const proyecto = await prisma.proyecto.create({
      data: {
        nombre: 'PAC Medellín (demo)',
        objetivos: 'Monitoreo del Plan de Acción Climática — datos de demostración.',
      },
    });
    const fase1 = await prisma.fase.create({
      data: { proyectoId: proyecto.id, nombre: 'Diagnóstico', pesoPorcentaje: 50, orden: 1 },
    });
    const fase2 = await prisma.fase.create({
      data: { proyectoId: proyecto.id, nombre: 'Implementación', pesoPorcentaje: 50, orden: 2 },
    });
    const act1 = await prisma.actividad.create({
      data: {
        faseId: fase1.id,
        nombre: 'Inventario de emisiones',
        fechaFinPlan: new Date(Date.now() + 5 * 86400000),
        avancePorcentaje: 40,
      },
    });
    await prisma.actividad.create({
      data: {
        faseId: fase2.id,
        nombre: 'Portafolio de medidas',
        fechaFinPlan: new Date(Date.now() + 30 * 86400000),
        avancePorcentaje: 0,
      },
    });
    await prisma.hito.create({
      data: {
        actividadId: act1.id,
        nombre: 'Entrega borrador',
        fechaObjetivo: new Date(Date.now() + 3 * 86400000),
      },
    });
    await prisma.asignacion.create({
      data: { actividadId: act1.id, usuarioId: colab.id, pesoTrabajoPorcentaje: 100 },
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    'Seed OK. admin@pac.local/Admin12345!, colab@pac.local/Colab12345! · TOTP(pruebas)=' +
      TOTP_SECRET_PRUEBAS,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
