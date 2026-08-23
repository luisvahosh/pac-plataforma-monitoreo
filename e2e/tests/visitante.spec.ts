import { expect, test } from '@playwright/test';

// Flujo del Visitante: consulta pública sin autenticación.
test('el visitante ve el dashboard público del proyecto', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('Avance del proyecto')).toBeVisible();
});

test('el contenido de evidencias NO es accesible sin autenticación (RN-13)', async ({ request }) => {
  const r = await request.get('/api/evidencias/inexistente/contenido');
  expect(r.status()).toBe(401);
});

test('los endpoints de gestión requieren autenticación', async ({ request }) => {
  const r = await request.get('/api/usuarios');
  expect(r.status()).toBe(401);
});
