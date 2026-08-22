import { useEffect, useState } from 'react';

interface Salud {
  estado: string;
  servicio: string;
  baseDatos: string;
  hora: string;
}

export function App() {
  const [salud, setSalud] = useState<Salud | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Salud>;
      })
      .then((data) => setSalud(data))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 640,
        margin: '4rem auto',
        padding: '0 1rem',
        lineHeight: 1.5,
      }}
    >
      <h1>PAC — Plataforma de Seguimiento y Monitoreo</h1>
      <p>Andamiaje de la Fase 2. Estado del backend (consulta a /api/health):</p>
      {error && <p style={{ color: '#b00020' }}>Error al consultar /api/health: {error}</p>}
      {!error && !salud && <p>Consultando…</p>}
      {salud && (
        <ul>
          <li>
            Estado: <strong>{salud.estado}</strong>
          </li>
          <li>Servicio: {salud.servicio}</li>
          <li>Base de datos: {salud.baseDatos}</li>
          <li>Hora: {salud.hora}</li>
        </ul>
      )}
    </main>
  );
}
