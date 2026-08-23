import { expect, type Page, type APIRequestContext } from '@playwright/test';
import { authenticator } from 'otplib';

// Secreto TOTP de pruebas (debe coincidir con el del seed).
export const TOTP_SECRET_PRUEBAS = 'JBSWY3DPEHPK3PXP';

export function codigo2fa(): string {
  return authenticator.generate(TOTP_SECRET_PRUEBAS);
}

/** Inicia sesión por la interfaz (contraseña + 2FA). */
export async function iniciarSesion(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Código 2FA').fill(codigo2fa());
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/app/);
}

/** Obtiene un access token por API (login + 2FA). */
export async function tokenPorApi(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const reto = await (
    await request.post('/api/auth/login', { data: { email, password } })
  ).json();
  const sesion = await (
    await request.post('/api/auth/2fa/verify', {
      data: { retoToken: reto.retoToken, codigo: codigo2fa() },
    })
  ).json();
  return sesion.accessToken as string;
}
