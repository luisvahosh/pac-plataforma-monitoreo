import { useEffect, useState } from 'react';
import type { Nota } from '../tipos';
import { formatearFecha } from '../api';

interface ActividadOpcion {
  id: string;
  nombre: string;
}

// Solo lectura: los pendientes y notas se registran desde la actividad a la
// que pertenecen (panel privado), no desde el tablero público.
export function PendientesNotas({ actividades }: { actividades: ActividadOpcion[] }) {
  const [notas, setNotas] = useState<Nota[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public/notas')
      .then((r) => {
        if (!r.ok) throw new Error(`No se pudieron cargar las notas (HTTP ${r.status})`);
        return r.json() as Promise<Nota[]>;
      })
      .then(setNotas)
      .catch((e: Error) => setError(e.message));
  }, []);

  function nombreActividad(id: string | null): string | null {
    if (!id) return null;
    return actividades.find((a) => a.id === id)?.nombre ?? null;
  }

  return (
    <section aria-label="Pendientes y notas">
      {error && <div className="aviso">{error}</div>}
      {!notas && !error && <p>Cargando…</p>}
      {notas && notas.length === 0 && <p className="tenue-publico">No hay pendientes ni notas registradas.</p>}

      <ul className="nota-lista">
        {notas?.map((n) => (
          <li className={`nota ${n.resuelta ? 'resuelta' : ''}`} key={n.id}>
            <div className="nota-texto">{n.texto}</div>
            <div className="nota-meta">
              {n.resuelta ? 'Resuelta' : 'Pendiente'} · {n.autor.nombre} · {formatearFecha(n.creadoEn)}
              {nombreActividad(n.actividadId) && ` · ${nombreActividad(n.actividadId)}`}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
