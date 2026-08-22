import { Client } from 'pg';

// Andamiaje del worker/scheduler (Fase 2).
// Aquí solo verifica conectividad con la base de datos y registra un latido.
// La lógica real de evaluación de vencimientos y envío de notificaciones se
// implementa en la Fase 7, como proceso de servidor independiente del navegador.

const intervaloMs = process.env.WORKER_INTERVALO_MS
  ? Number(process.env.WORKER_INTERVALO_MS)
  : 30000;

async function latido(): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await client.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log(`[worker] latido OK — base de datos conectada (${new Date().toISOString()})`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[worker] latido con error — no se pudo conectar a la base de datos:',
      (error as Error).message,
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(
    `[worker] scheduler iniciado. Intervalo: ${intervaloMs} ms. (Sin notificaciones aún — Fase 7.)`,
  );
  await latido();
  setInterval(() => {
    void latido();
  }, intervaloMs);
}

void main();
