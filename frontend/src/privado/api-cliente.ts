// Cliente HTTP autenticado: adjunta el access token y renueva con el refresh
// token ante un 401 (una vez).

const CLAVE_ACCESS = 'pac_access';
const CLAVE_REFRESH = 'pac_refresh';

export function guardarTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(CLAVE_ACCESS, accessToken);
  localStorage.setItem(CLAVE_REFRESH, refreshToken);
}

export function limpiarTokens(): void {
  localStorage.removeItem(CLAVE_ACCESS);
  localStorage.removeItem(CLAVE_REFRESH);
}

export function accessToken(): string | null {
  return localStorage.getItem(CLAVE_ACCESS);
}

async function intentarRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem(CLAVE_REFRESH);
  if (!refreshToken) return false;
  const r = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!r.ok) return false;
  const datos = (await r.json()) as { accessToken: string; refreshToken: string };
  guardarTokens(datos.accessToken, datos.refreshToken);
  return true;
}

export async function apiFetch(
  url: string,
  opciones: RequestInit = {},
  reintentar = true,
): Promise<Response> {
  const headers = new Headers(opciones.headers);
  const token = accessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (opciones.body && !(opciones.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const respuesta = await fetch(url, { ...opciones, headers });
  if (respuesta.status === 401 && reintentar) {
    if (await intentarRefresh()) return apiFetch(url, opciones, false);
  }
  return respuesta;
}

/** Helper que devuelve JSON o lanza con el mensaje del backend. */
export async function apiJson<T>(url: string, opciones: RequestInit = {}): Promise<T> {
  const r = await apiFetch(url, opciones);
  if (!r.ok) {
    let mensaje = `HTTP ${r.status}`;
    try {
      const cuerpo = await r.json();
      if (cuerpo?.message) mensaje = Array.isArray(cuerpo.message) ? cuerpo.message.join(', ') : cuerpo.message;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(mensaje);
  }
  return r.json() as Promise<T>;
}
