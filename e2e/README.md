# Pruebas E2E de sistema (Fase 11)

Suite Playwright que valida los cuatro flujos generales del documento original
(Visitante, Colaborador, Administrador y Sistema de notificaciones) sobre el
stack completo levantado con Docker.

## Requisitos previos

1. Levantar el stack (desde la raíz del repo):
   ```bash
   docker compose up --build -d
   ```
2. Aplicar migraciones y **sembrar datos de demostración** (crea usuarios y un
   proyecto de ejemplo):
   ```bash
   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npm run prisma:seed
   ```
   Usuarios sembrados (solo para pruebas):
   - `admin@pac.local` / `Admin12345!`
   - `colab@pac.local` / `Colab12345!`
   - Secreto TOTP de pruebas: `JBSWY3DPEHPK3PXP` (las pruebas generan el código con otplib).

   > El correo corre en modo `dev` (no envía correos reales), por lo que las
   > pruebas no requieren un servidor SMTP.

## Ejecutar las pruebas

```bash
cd e2e
npm install
npm run install:browsers
E2E_BASE_URL=http://localhost npm test
```

## Cobertura

- `visitante.spec.ts` — dashboard público visible; el contenido de evidencias y
  los endpoints de gestión exigen autenticación (RN-13, RBAC).
- `colaborador.spec.ts` — login con 2FA, ver "mis actividades", registrar avance.
- `administrador.spec.ts` — crear usuario, configurar alertas, consultar auditoría.
- `sistema.spec.ts` — evaluación de vencimientos por el sistema; un colaborador
  no puede dispararla (403).

## Nota

Estas pruebas se generaron en la Fase 11 pero **no se ejecutaron en runtime** en
el entorno de desarrollo de este repositorio (el despliegue se hará en Hostinger).
La primera corrida real valida integración de extremo a extremo; los bugs de
integración que aparezcan se corrigen en esta misma fase.
