import { expect, test } from '@playwright/test';
import { tokenPorApi } from '../utils/sesion';

// Flujo del Sistema de Notificaciones: la evaluación de vencimientos se ejecuta
// sin error y devuelve un resumen (el envío real de correo está en modo dev).
test('la evaluación de vencimientos se ejecuta correctamente', async ({ request }) => {
  const token = await tokenPorApi(request, 'admin@pac.local', 'Admin12345!');
  const r = await request.post('/api/notificaciones/evaluar', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(r.ok()).toBeTruthy();
  const cuerpo = await r.json();
  expect(cuerpo).toHaveProperty('actividades');
  expect(cuerpo).toHaveProperty('enviadas');
});

test('un colaborador no puede acceder a la evaluación (RBAC)', async ({ request }) => {
  const token = await tokenPorApi(request, 'colab@pac.local', 'Colab12345!');
  const r = await request.post('/api/notificaciones/evaluar', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(r.status()).toBe(403);
});
