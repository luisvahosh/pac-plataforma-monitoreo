import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiJson } from '../api-cliente';
import { useAuth } from '../auth-contexto';

interface MiActividad {
  asignacionId: string;
  pesoTrabajoPorcentaje: number;
  actividad: {
    id: string;
    nombre: string;
    avancePorcentaje: number;
    fase: { nombre: string } | null;
  };
}

export function MisActividades() {
  const { esAdmin } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<MiActividad[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idManual, setIdManual] = useState('');

  useEffect(() => {
    apiJson<MiActividad[]>('/api/mis-actividades')
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, []);

  function abrirManual(e: FormEvent) {
    e.preventDefault();
    if (idManual.trim()) navigate(`/app/actividad/${idManual.trim()}`);
  }

  return (
    <section>
      <h2>Mis actividades</h2>
      {error && <div className="form-error">{error}</div>}
      {!items && !error && <p>Cargando…</p>}
      {items && items.length === 0 && <p>No tienes actividades asignadas.</p>}
      <ul className="lista-simple">
        {items?.map((it) => (
          <li key={it.asignacionId}>
            <Link to={`/app/actividad/${it.actividad.id}`}>{it.actividad.nombre}</Link>
            <span className="tenue">
              {it.actividad.fase?.nombre ?? '—'} · avance {Math.round(it.actividad.avancePorcentaje)}% · tu
              peso {Math.round(it.pesoTrabajoPorcentaje)}%
            </span>
          </li>
        ))}
      </ul>

      {esAdmin && (
        <form onSubmit={abrirManual} className="form-inline">
          <label>
            Abrir actividad por ID (admin)
            <input value={idManual} onChange={(e) => setIdManual(e.target.value)} placeholder="uuid de actividad" />
          </label>
          <button type="submit">Abrir</button>
        </form>
      )}
    </section>
  );
}
