import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Nota } from '../tipos';
import { formatearFecha } from '../api';
import { apiJson } from '../privado/api-cliente';

interface ActividadOpcion {
  id: string;
  nombre: string;
}

export function PendientesNotas({
  estaLogueado,
  actividades,
}: {
  estaLogueado: boolean;
  actividades: ActividadOpcion[];
}) {
  const [notas, setNotas] = useState<Nota[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [actividadId, setActividadId] = useState('');

  const cargar = useCallback(async () => {
    try {
      setNotas(await apiJson<Nota[]>('/api/public/notas'));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiJson('/api/notas', {
        method: 'POST',
        body: JSON.stringify({ texto, actividadId: actividadId || undefined }),
      });
      setTexto('');
      setActividadId('');
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function alternarResuelta(nota: Nota) {
    setError(null);
    try {
      await apiJson(`/api/notas/${nota.id}/${nota.resuelta ? 'reabrir' : 'resolver'}`, { method: 'PATCH' });
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function eliminar(nota: Nota) {
    setError(null);
    try {
      await apiJson(`/api/notas/${nota.id}`, { method: 'DELETE' });
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function nombreActividad(id: string | null): string | null {
    if (!id) return null;
    return actividades.find((a) => a.id === id)?.nombre ?? null;
  }

  return (
    <section aria-label="Pendientes y notas">
      {error && <div className="aviso">{error}</div>}

      {estaLogueado ? (
        <form onSubmit={crear} className="nota-formulario">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe un pendiente o una nota…"
            required
          />
          <div className="nota-formulario-acciones">
            <select value={actividadId} onChange={(e) => setActividadId(e.target.value)}>
              <option value="">General del proyecto</option>
              {actividades.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
            <button type="submit" className="boton-primario-publico">
              Registrar
            </button>
          </div>
        </form>
      ) : (
        <p className="tenue-publico">
          Inicia sesión (botón "Acceso colaboradores") para registrar un pendiente o una nota.
        </p>
      )}

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
            {estaLogueado && (
              <div className="nota-acciones">
                <button type="button" className="enlace-evidencia-boton" onClick={() => alternarResuelta(n)}>
                  {n.resuelta ? 'reabrir' : 'marcar resuelta'}
                </button>
                <button type="button" className="enlace-evidencia-boton" onClick={() => eliminar(n)}>
                  eliminar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
