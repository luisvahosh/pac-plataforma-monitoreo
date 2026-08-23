import { expect, test } from '@playwright/test';
import { iniciarSesion } from '../utils/sesion';

// Flujo del Administrador: gestión de usuarios, alertas y auditoría.
test('el administrador crea un usuario', async ({ page }) => {
  await iniciarSesion(page, 'admin@pac.local', 'Admin12345!');
  await page.goto('/app/admin/usuarios');

  const correo = `nuevo${Date.now()}@pac.local`;
  await page.getByLabel('Nombre').fill('Nuevo Colaborador');
  await page.getByLabel('Correo').fill(correo);
  await page.getByRole('button', { name: /Crear/ }).click();

  await expect(page.getByText(correo)).toBeVisible();
});

test('el administrador guarda la configuración de alertas', async ({ page }) => {
  await iniciarSesion(page, 'admin@pac.local', 'Admin12345!');
  await page.goto('/app/admin/alertas');
  await page.getByLabel(/Días de anticipación/).fill('7, 3, 1');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText(/guardada/i)).toBeVisible();
});

test('el administrador consulta la auditoría', async ({ page }) => {
  await iniciarSesion(page, 'admin@pac.local', 'Admin12345!');
  await page.goto('/app/admin/auditoria');
  await expect(page.getByRole('heading', { name: 'Auditoría' })).toBeVisible();
});
