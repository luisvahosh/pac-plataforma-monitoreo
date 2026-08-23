import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export function OlvidePassword() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    try {
      const r = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const datos = await r.json();
      // Respuesta siempre neutra: no revela si el correo existe (RN de seguridad).
      setMensaje(datos.mensaje ?? 'Si el correo corresponde a una cuenta, se enviaron instrucciones.');
    } catch {
      setMensaje('Si el correo corresponde a una cuenta, se enviaron instrucciones.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-caja">
      <h1>Recuperar contraseña</h1>
      {mensaje ? (
        <>
          <p>{mensaje}</p>
          <Link to="/login">
            <button type="button">Volver a iniciar sesión</button>
          </Link>
        </>
      ) : (
        <form onSubmit={enviar} className="form">
          <label>
            Correo
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" disabled={cargando}>
            {cargando ? 'Enviando…' : 'Enviar instrucciones'}
          </button>
        </form>
      )}
    </div>
  );
}
