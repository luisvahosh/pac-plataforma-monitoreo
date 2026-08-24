import { useEffect, useState, type FormEvent } from 'react';
import { apiJson } from '../../api-cliente';

interface Proyecto {
  id: string;
  nombre: string;
}
interface Fase {
  id: string;
  nombre: string;
}
interface ActividadOpcion {
  id: string;
  nombre: string;
}
interface HitoOpcion {
  id: string;
  nombre: string;
  fechaObjetivo: string | null;
}
interface Cambio {
  id: string;
  campo: string;
  fechaOriginal: string | null;
  fechaNueva: string | null;
  justificacion: string;
  fechaHoraCambio: string;
}

export function LineaBase() {
  const [fases, setFases] = useState<Fase[]>([]);
  const [actividadesPorFase, setActividadesPorFase] = useState<Record<string, ActividadOpcion[]>>(
    {},
  );
  const [cargandoLista, setCargandoLista] = useState(true);

  // Selección: primero la actividad del proyecto; el hito (si aplica) sale de esa actividad.
  const [actividadId, setActividadId] = useState('');
  const [hitos, setHitos] = useState<HitoOpcion[]>([]);
  const [entidadTipo, setEntidadTipo] = useState<'actividad' | 'hito'>('actividad');
  const [hitoId, setHitoId] = useState('');

  const [campo, setCampo] = useState('fecha_fin');
  const [fechaNueva, setFechaNueva] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [historial, setHistorial] = useState<Cambio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const camposDisponibles =
    entidadTipo === 'actividad' ? ['fecha_inicio', 'fecha_fin'] : ['fecha_objetivo'];
  const entidadId = entidadTipo === 'actividad' ? actividadId : hitoId;

  // Carga Fase → Actividades del proyecto, igual que la página "Actividades".
  useEffect(() => {
    async function cargar() {
      try {
        const proyectos = await apiJson<Proyecto[]>('/api/proyectos');
        if (proyectos.length === 0) return;
        const listaFases = await apiJson<Fase[]>(
          `/api/fases?proyectoId=${encodeURIComponent(proyectos[0].id)}`,
        );
        setFases(listaFases);
        const pares = await Promise.all(
          listaFases.map(
            async (f) =>
              [
                f.id,
                await apiJson<ActividadOpcion[]>(
                  `/api/actividades?faseId=${encodeURIComponent(f.id)}`,
                ),
              ] as const,
          ),
        );
        setActividadesPorFase(Object.fromEntries(pares));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setCargandoLista(false);
      }
    }
    void cargar();
  }, []);

  // Al elegir una actividad, trae sus hitos (por si el cambio es sobre un hito).
  useEffect(() => {
    setHitoId('');
    setHitos([]);
    if (!actividadId) return;
    apiJson<HitoOpcion[]>(`/api/hitos?actividadId=${encodeURIComponent(actividadId)}`)
      .then(setHitos)
      .catch((e: Error) => setError(e.message));
  }, [actividadId]);

  useEffect(() => {
    setHistorial([]);
  }, [entidadId, entidadTipo]);

  async function cambiar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!entidadId) {
      setError('Elige primero una actividad' + (entidadTipo === 'hito' ? ' y un hito' : '') + '.');
      return;
    }
    try {
      await apiJson('/api/linea-base/cambios', {
        method: 'POST',
        body: JSON.stringify({
          entidadTipo,
          entidadId,
          campo,
          fechaNueva: new Date(fechaNueva).toISOString(),
          justificacion,
        }),
      });
      setOk('Cambio de línea base registrado.');
      setJustificacion('');
      await consultar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function consultar() {
    if (!entidadId) return;
    try {
      setHistorial(
        await apiJson<Cambio[]>(
          `/api/linea-base/cambios?entidadTipo=${entidadTipo}&entidadId=${encodeURIComponent(entidadId)}`,
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section>
      <h2>Línea base — cambio autorizado</h2>
      <p className="tenue">
        Las fechas planeadas no se editan libremente: todo cambio queda registrado con quién lo
        hizo, cuándo y por qué, sin borrar el dato original (RN-07).
      </p>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {ok && (
        <div className="form-ok" role="status">
          {ok}
        </div>
      )}

      <form onSubmit={cambiar} className="form">
        <label>
          Actividad
          {cargandoLista ? (
            <span className="tenue">Cargando…</span>
          ) : (
            <select value={actividadId} onChange={(e) => setActividadId(e.target.value)} required>
              <option value="">— Elige una actividad —</option>
              {fases.map((f) => (
                <optgroup label={f.nombre} key={f.id}>
                  {(actividadesPorFase[f.id] ?? []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </label>

        <label>
          ¿Qué se cambia?
          <select
            value={entidadTipo}
            onChange={(e) => {
              const v = e.target.value as 'actividad' | 'hito';
              setEntidadTipo(v);
              setCampo(v === 'actividad' ? 'fecha_fin' : 'fecha_objetivo');
            }}
            disabled={!actividadId}
          >
            <option value="actividad">Una fecha de la actividad (inicio o fin)</option>
            <option value="hito">La fecha objetivo de un hito de la actividad</option>
          </select>
        </label>

        {entidadTipo === 'hito' && (
          <label>
            Hito
            <select
              value={hitoId}
              onChange={(e) => setHitoId(e.target.value)}
              required
              disabled={!actividadId}
            >
              <option value="">— Elige un hito —</option>
              {hitos.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombre}
                  {h.fechaObjetivo
                    ? ` (${new Date(h.fechaObjetivo).toLocaleDateString('es-CO')})`
                    : ''}
                </option>
              ))}
            </select>
            {actividadId && hitos.length === 0 && (
              <span className="tenue">Esta actividad no tiene hitos.</span>
            )}
          </label>
        )}

        <label>
          Campo
          <select value={campo} onChange={(e) => setCampo(e.target.value)}>
            {camposDisponibles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nueva fecha
          <input
            type="date"
            value={fechaNueva}
            onChange={(e) => setFechaNueva(e.target.value)}
            required
          />
        </label>
        <label>
          Justificación
          <textarea
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            required
          />
        </label>
        <div className="acciones">
          <button type="submit" disabled={!entidadId}>
            Registrar cambio
          </button>
          <button type="button" onClick={consultar} disabled={!entidadId}>
            Ver historial
          </button>
        </div>
      </form>

      {historial.length > 0 && (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Original</th>
                <th>Nueva</th>
                <th>Justificación</th>
                <th>Fecha del cambio</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((c) => (
                <tr key={c.id}>
                  <td>{c.campo}</td>
                  <td>
                    {c.fechaOriginal ? new Date(c.fechaOriginal).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td>{c.fechaNueva ? new Date(c.fechaNueva).toLocaleDateString('es-CO') : '—'}</td>
                  <td>{c.justificacion}</td>
                  <td>{new Date(c.fechaHoraCambio).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
