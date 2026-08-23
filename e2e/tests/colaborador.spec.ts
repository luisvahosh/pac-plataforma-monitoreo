import { expect, test } from '@playwright/test';
import { iniciarSesion } from '../utils/sesion';

// Flujo del Colaborador: login con 2FA → ver actividades → registrar avance.
test('el colaborador inicia sesión con 2FA y registra un avance', async ({ page }) => {
  await iniciarSesion(page, 'colab@pac.local', 'Colab12345!');
  await expect(page.getByRole('heading', { name: 'Mis actividades' })).toBeVisible();

  await page.getByRole('link', { name: /Inventario de emisiones/ }).click();
  await expect(page.getByRole('heading', { name: /Inventario de emisiones/ })).toBeVisible();

  await page.getByLabel(/Porcentaje/).fill('55');
  await page.getByRole('button', { name: 'Guardar avance' }).click();

  // El nuevo avance aparece en el histórico.
  await expect(page.getByText('55%').first()).toBeVisible();
});
