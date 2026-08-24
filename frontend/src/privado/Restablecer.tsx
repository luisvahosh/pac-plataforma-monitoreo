import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export function Restablecer() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('El enlace de recuperación no incluye un token válido.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      const r = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const datos = await r.json();
      if (!r.ok) {
        throw new Error(
          Array.isArray(datos?.message) ? datos.message.join(', ') : datos?.message ?? 'No se pudo restablecer la contraseña',
        );
      }
      setOk(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }

  if (ok) {
    return (
      <div className="login-caja">
        <h1>Contraseña actualizada</h1>
        <p>Tu contraseña se cambió correctamente. Vuelve a iniciar sesión.</p>
        <Link to="/login">
          <button type="button">Ir a iniciar sesión</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="login-caja">
      <h1>Restablecer contraseña</h1>
      {error && <div className="form-error" role="alert">{error}</div>}
      {!token && <div className="form-error" role="alert">Falta el token en el enlace de recuperación.</div>}
      <form onSubmit={enviar} className="form">
        <label>
          Nueva contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
        </label>
        <label>
          Confirmar contraseña
          <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required minLength={10} />
        </label>
        <button type="submit" disabled={cargando || !token}>
          {cargando ? 'Guardando…' : 'Restablecer contraseña'}
        </button>
      </form>
    </div>
  );
}
