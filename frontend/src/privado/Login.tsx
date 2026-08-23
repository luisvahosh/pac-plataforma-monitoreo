import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth-contexto';

export function Login() {
  const { loginPaso1, loginPaso2 } = useAuth();
  const navigate = useNavigate();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [reto, setReto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviarPaso1(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      setReto(await loginPaso1(email, password));
      setPaso(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }

  async function enviarPaso2(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await loginPaso2(reto, codigo);
      navigate('/app');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-caja">
      <h1>Acceso de colaboradores</h1>
      {error && <div className="form-error">{error}</div>}

      {paso === 1 ? (
        <form onSubmit={enviarPaso1} className="form">
          <label>
            Correo
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={cargando}>
            {cargando ? 'Verificando…' : 'Continuar'}
          </button>
        </form>
      ) : (
        <form onSubmit={enviarPaso2} className="form">
          <p>Ingresa el código de tu app Microsoft Authenticator.</p>
          <label>
            Código 2FA
            <input
              inputMode="numeric"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={cargando}>
            {cargando ? 'Validando…' : 'Ingresar'}
          </button>
        </form>
      )}
    </div>
  );
}
