import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';

export function Activar() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('El enlace de activación no incluye un token válido.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      const r = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const datos = await r.json();
      if (!r.ok) {
        throw new Error(
          Array.isArray(datos?.message) ? datos.message.join(', ') : datos?.message ?? 'No se pudo activar la cuenta',
        );
      }
      setOtpauthUri(datos.otpauthUri as string);
      // El secreto se codifica localmente en el navegador; nunca se envía a terceros.
      setQrDataUrl(await QRCode.toDataURL(datos.otpauthUri as string, { width: 240 }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }

  if (qrDataUrl) {
    return (
      <div className="login-caja">
        <h1>Cuenta activada</h1>
        <p>Escanea este código con la app <strong>Microsoft Authenticator</strong>:</p>
        <img src={qrDataUrl} alt="Código QR para configurar 2FA" style={{ display: 'block', margin: '1rem auto' }} />
        <details style={{ marginBottom: '1rem' }}>
          <summary>¿No puedes escanear? Ver clave manual</summary>
          <p style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>{otpauthUri}</p>
        </details>
        <Link to="/login">
          <button type="button">Ir a iniciar sesión</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="login-caja">
      <h1>Activar cuenta</h1>
      {error && <div className="form-error" role="alert">{error}</div>}
      {!token && <div className="form-error" role="alert">Falta el token en el enlace de activación.</div>}
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
          {cargando ? 'Activando…' : 'Activar cuenta'}
        </button>
      </form>
    </div>
  );
}
