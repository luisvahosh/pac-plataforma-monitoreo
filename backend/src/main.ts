import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Cabeceras de seguridad HTTP (Fase 12).
  app.use(helmet());

  // Detrás del reverse proxy (Caddy): confiar en X-Forwarded-* para obtener la
  // IP real (rate limiting y auditoría) y ocultar la cabecera x-powered-by.
  const express = app.getHttpAdapter().getInstance();
  express.set('trust proxy', 1);
  express.disable('x-powered-by');

  // CORS restrictivo: solo se habilita si se define CORS_ORIGEN (lista separada
  // por comas). El frontend se sirve en el mismo origen vía Caddy, por lo que en
  // producción normalmente no se necesita CORS.
  const origenes = process.env.CORS_ORIGEN;
  if (origenes) {
    app.enableCors({ origin: origenes.split(',').map((o) => o.trim()), credentials: false });
  }

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[backend] API escuchando en el puerto ${port} (prefijo /api)`);
}

void bootstrap();
