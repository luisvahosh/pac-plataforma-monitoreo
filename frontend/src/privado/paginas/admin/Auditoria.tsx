import { useEffect, useState, type FormEvent } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { apiJson } from '../../api-cliente';
import { EstadoVacio } from '../../../components/EstadoVacio';

interface Evento {
  id: string;
  usuarioId: string | null;
  accion: string;
  entidadTipo: string | null;
  entidadId: string | null;
  ip: string | null;
  fechaHora: string;
}

export function Auditoria() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [entidadTipo, setEntidadTipo] = useState('');
  const [accion, setAccion] = useState('');

  async function consultar(e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    const params = new URLSearchParams();
    if (entidadTipo) params.set('entidadTipo', entidadTipo);
    if (accion) params.set('accion', accion);
    try {
      setEventos(await apiJson<Evento[]>(`/api/auditoria?${params.toString()}`));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void consultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <h2>Auditoría</h2>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={consultar} className="form-inline">
        <label>
          Entidad
          <input
            value={entidadTipo}
            onChange={(e) => setEntidadTipo(e.target.value)}
            placeholder="actividades"
          />
        </label>
        <label>
          Acción
          <select value={accion} onChange={(e) => setAccion(e.target.value)}>
            <option value="">todas</option>
            <option value="crear">crear</option>
            <option value="editar">editar</option>
            <option value="eliminar">eliminar</option>
          </select>
        </label>
        <button type="submit">Filtrar</button>
      </form>

      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Entidad</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((ev) => (
              <tr key={ev.id}>
                <td>{new Date(ev.fechaHora).toLocaleString('es-CO')}</td>
                <td>{ev.usuarioId ?? '—'}</td>
                <td>{ev.accion}</td>
                <td>
                  {ev.entidadTipo ?? '—'}
                  {ev.entidadId ? ` (${ev.entidadId.slice(0, 8)}…)` : ''}
                </td>
                <td>{ev.ip ?? '—'}</td>
              </tr>
            ))}
            {eventos.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EstadoVacio
                    icono={MagnifyingGlass}
                    titulo="Sin eventos"
                    descripcion="No hay eventos de auditoría para estos filtros. Prueba a ampliar la búsqueda."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
