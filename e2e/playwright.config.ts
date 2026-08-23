import { defineConfig } from '@playwright/test';

// El stack debe estar levantado (docker compose up) y la base sembrada
// (prisma db seed) antes de ejecutar. Ver e2e/README.md.
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost',
    trace: 'on-first-retry',
  },
});
