import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

// Bootstrap del primer administrador (producción). No define contraseña: crea la
// cuenta en estado 'pendiente_activacion' y emite un enlace de activación para
// que el propio administrador establezca su contraseña y enrole su 2FA.
//
//   ADMIN_EMAIL=admin@tu-dominio.com ADMIN_NOMBRE="Nombre" npm run bootstrap:admin

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const nombre = process.env.ADMIN_NOMBRE ?? 'Administrador';
  if (!email) {
    // eslint-disable-next-line no-console
    console.error('Falta la variable ADMIN_EMAIL.');
    process.exit(1);
  }

  const rol = await prisma.rol.upsert({
    where: { nombre: 'administrador' },
    update: {},
    create: { nombre: 'administrador' },
  });

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { rolId: rol.id },
    create: { nombre, email, rolId: rol.id, estado: 'pendiente_activacion' },
  });

  const token = randomBytes(32).toString('hex');
  await prisma.tokenCuenta.create({
    data: {
      usuarioId: usuario.id,
      tipo: 'activacion',
      tokenHash: createHash('sha256').update(token).digest('hex'),
      expiraEn: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  const base = process.env.APP_URL ?? 'http://localhost';
  // eslint-disable-next-line no-console
  console.log('Administrador creado (pendiente de activación).');
  // eslint-disable-next-line no-console
  console.log('Enlace de activación (válido 48 h):');
  // eslint-disable-next-line no-console
  console.log(`${base}/activar?token=${token}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
