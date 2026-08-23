import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { guardarTokens, limpiarTokens, accessToken } from './api-cliente';

interface UsuarioSesion {
  sub: string;
  email: string;
  rol: string;
}

interface AuthContexto {
  usuario: UsuarioSesion | null;
  esAdmin: boolean;
  loginPaso1: (email: string, password: string) => Promise<string>; // devuelve retoToken
  loginPaso2: (retoToken: string, codigo: string) => Promise<void>;
  logout: () => void;
}

const Contexto = createContext<AuthContexto | null>(null);

function decodificar(token: string | null): UsuarioSesion | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.scope !== 'session') return null;
    return { sub: payload.sub, email: payload.email, rol: payload.rol };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => decodificar(accessToken()));

  const valor = useMemo<AuthContexto>(
    () => ({
      usuario,
      esAdmin: usuario?.rol === 'administrador',
      async loginPaso1(email, password) {
        const r = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!r.ok) throw new Error('Credenciales inválidas');
        const datos = (await r.json()) as { retoToken: string };
        return datos.retoToken;
      },
      async loginPaso2(retoToken, codigo) {
        const r = await fetch('/api/auth/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ retoToken, codigo }),
        });
        if (!r.ok) throw new Error('Código de 2FA incorrecto');
        const datos = (await r.json()) as { accessToken: string; refreshToken: string };
        guardarTokens(datos.accessToken, datos.refreshToken);
        setUsuario(decodificar(datos.accessToken));
      },
      logout() {
        limpiarTokens();
        setUsuario(null);
      },
    }),
    [usuario],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): AuthContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
