import { useState, type FormEvent } from 'react';
import { apiJson } from '../../api-cliente';

interface Cambio {
  id: string;
  campo: string;
  fechaOriginal: string | null;
  fechaNueva: string | null;
  justificacion: string;
  fechaHoraCambio: string;
}

export function LineaBase() {
  const [entidadTipo, setEntidadTipo] = useState<'actividad' | 'hito'>('actividad');
  const [entidadId, setEntidadId] = useState('');
  const [campo, setCampo] = useState('fecha_fin');
  const [fechaNueva, setFechaNueva] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [historial, setHistorial] = useState<Cambio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const camposDisponibles =
    entidadTipo === 'actividad' ? ['fecha_inicio', 'fecha_fin'] : ['fecha_objetivo'];

  async function cambiar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
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
      {error && <div className="form-error">{error}</div>}
      {ok && <div className="form-ok">{ok}</div>}

      <form onSubmit={cambiar} className="form">
        <label>
          Entidad
          <select
            value={entidadTipo}
            onChange={(e) => {
              const v = e.target.value as 'actividad' | 'hito';
              setEntidadTipo(v);
              setCampo(v === 'actividad' ? 'fecha_fin' : 'fecha_objetivo');
            }}
          >
            <option value="actividad">Actividad</option>
            <option value="hito">Hito</option>
          </select>
        </label>
        <label>
          ID de la entidad
          <input value={entidadId} onChange={(e) => setEntidadId(e.target.value)} required />
        </label>
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
          <input type="date" value={fechaNueva} onChange={(e) => setFechaNueva(e.target.value)} required />
        </label>
        <label>
          Justificación
          <textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)} required />
        </label>
        <div className="acciones">
          <button type="submit">Registrar cambio</button>
          <button type="button" onClick={consultar}>
            Ver historial
          </button>
        </div>
      </form>

      {historial.length > 0 && (
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
                <td>{c.fechaOriginal ? new Date(c.fechaOriginal).toLocaleDateString('es-CO') : '—'}</td>
                <td>{c.fechaNueva ? new Date(c.fechaNueva).toLocaleDateString('es-CO') : '—'}</td>
                <td>{c.justificacion}</td>
                <td>{new Date(c.fechaHoraCambio).toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
