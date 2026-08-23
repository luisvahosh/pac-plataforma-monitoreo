import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, apiJson } from '../api-cliente';
import { useAuth } from '../auth-contexto';

interface ActividadRef {
  id: string;
  nombre: string;
}
interface Actividad {
  id: string;
  nombre: string;
  descripcion: string | null;
  avancePorcentaje: number;
  finalizada: boolean;
  tramoPago: string | null;
  tramoPagoPorcentaje: number | null;
  dependeDe: { dependeDe: ActividadRef }[];
  esDependenciaDe: { actividad: ActividadRef }[];
}
interface Avance {
  id: string;
  porcentaje: number;
  observaciones: string | null;
  fechaHora: string;
  usuario: { nombre: string };
}
interface Evidencia {
  id: string;
  tipo: string;
  url: string | null;
  nombreArchivo: string | null;
  observacion: string | null;
  fechaHora: string;
  autor: { nombre: string };
}
interface Subactividad {
  id: string;
  descripcion: string;
  orden: number;
  avancePorcentaje: number;
}

export function DetalleActividad() {
  const { id = '' } = useParams();
  const { esAdmin } = useAuth();
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [avances, setAvances] = useState<Avance[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [subactividades, setSubactividades] = useState<Subactividad[]>([]);
  const [error, setError] = useState<string | null>(null);

  // formularios
  const [porcentaje, setPorcentaje] = useState('');
  const [obsAvance, setObsAvance] = useState('');
  const [urlEnlace, setUrlEnlace] = useState('');

  // edición de la actividad (admin)
  const [editando, setEditando] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editFinalizada, setEditFinalizada] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const [a, av, ev, sub] = await Promise.all([
        apiJson<Actividad>(`/api/actividades/${id}`),
        apiJson<Avance[]>(`/api/actividades/${id}/avances`),
        apiJson<Evidencia[]>(`/api/actividades/${id}/evidencias`),
        apiJson<Subactividad[]>(`/api/actividades/${id}/subactividades`),
      ]);
      setActividad(a);
      setAvances(av);
      setEvidencias(ev);
      setSubactividades(sub);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  function iniciarEdicion() {
    if (!actividad) return;
    setError(null);
    setEditNombre(actividad.nombre);
    setEditDescripcion(actividad.descripcion ?? '');
    setEditFinalizada(actividad.finalizada);
    setEditando(true);
  }

  async function guardarEdicion(e: FormEvent) {
    e.preventDefault();
    try {
      await apiJson(`/api/actividades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nombre: editNombre,
          descripcion: editDescripcion || undefined,
          finalizada: editFinalizada,
        }),
      });
      setEditando(false);
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function registrarAvance(e: FormEvent) {
    e.preventDefault();
    try {
      await apiJson(`/api/actividades/${id}/avances`, {
        method: 'POST',
        body: JSON.stringify({ porcentaje: Number(porcentaje), observaciones: obsAvance || undefined }),
      });
      setPorcentaje('');
      setObsAvance('');
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function subirEnlace(e: FormEvent) {
    e.preventDefault();
    try {
      await apiJson(`/api/actividades/${id}/evidencias/enlace`, {
        method: 'POST',
        body: JSON.stringify({ url: urlEnlace }),
      });
      setUrlEnlace('');
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function descargar(evidencia: Evidencia) {
    const r = await apiFetch(`/api/evidencias/${evidencia.id}/contenido`);
    if (!r.ok) {
      setError('No se pudo descargar la evidencia');
      return;
    }
    const ct = r.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const j = (await r.json()) as { url?: string };
      if (j.url) window.open(j.url, '_blank', 'noopener');
      return;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = evidencia.nombreArchivo ?? 'evidencia';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error && !actividad) return <div className="form-error">{error}</div>;
  if (!actividad) return <p>Cargando…</p>;

  return (
    <section>
      {editando ? (
        <form onSubmit={guardarEdicion} className="form panel">
          <label>
            Nombre
            <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required />
          </label>
          <label>
            Descripción
            <textarea
              value={editDescripcion}
              onChange={(e) => setEditDescripcion(e.target.value)}
              rows={6}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={editFinalizada}
              onChange={(e) => setEditFinalizada(e.target.checked)}
            />
            Finalizada
          </label>
          <div className="acciones">
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2>
            {actividad.nombre}{' '}
            {esAdmin && (
              <button type="button" className="enlace" onClick={iniciarEdicion}>
                editar
              </button>
            )}
          </h2>
          <p className="tenue">
            Avance actual: {Math.round(actividad.avancePorcentaje)}%
            {actividad.tramoPago && ` · ${actividad.tramoPago} del contrato (${actividad.tramoPagoPorcentaje}%)`}
          </p>
        </>
      )}
      {(actividad.dependeDe.length > 0 || actividad.esDependenciaDe.length > 0) && (
        <p className="tenue">
          {actividad.dependeDe.length > 0 && (
            <>
              Depende de:{' '}
              {actividad.dependeDe.map((d, i) => (
                <span key={d.dependeDe.id}>
                  {i > 0 && ', '}
                  <Link to={`/app/actividad/${d.dependeDe.id}`}>{d.dependeDe.nombre}</Link>
                </span>
              ))}
              {actividad.esDependenciaDe.length > 0 && ' · '}
            </>
          )}
          {actividad.esDependenciaDe.length > 0 && (
            <>
              Requerida por:{' '}
              {actividad.esDependenciaDe.map((d, i) => (
                <span key={d.actividad.id}>
                  {i > 0 && ', '}
                  <Link to={`/app/actividad/${d.actividad.id}`}>{d.actividad.nombre}</Link>
                </span>
              ))}
            </>
          )}
        </p>
      )}
      {error && <div className="form-error">{error}</div>}

      <div className="grid-2">
        {subactividades.length > 0 ? (
          <div className="panel">
            <h3>Subactividades</h3>
            <p className="tenue">
              El avance de esta actividad se calcula como el promedio de sus subactividades.
            </p>
            <ul className="lista-simple">
              {subactividades.map((s) => (
                <SubactividadFila key={s.id} subactividad={s} onCambio={cargar} />
              ))}
            </ul>
          </div>
        ) : (
          <div className="panel">
            <h3>Registrar avance</h3>
            <form onSubmit={registrarAvance} className="form">
              <label>
                Porcentaje (0–100)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  required
                />
              </label>
              <label>
                Observaciones
                <textarea value={obsAvance} onChange={(e) => setObsAvance(e.target.value)} />
              </label>
              <button type="submit">Guardar avance</button>
            </form>

            <h4>Histórico</h4>
            <ul className="lista-simple">
              {avances.map((a) => (
                <li key={a.id}>
                  <strong>{Math.round(a.porcentaje)}%</strong> — {a.usuario.nombre}
                  <span className="tenue">
                    {new Date(a.fechaHora).toLocaleString('es-CO')}
                    {a.observaciones ? ` · ${a.observaciones}` : ''}
                  </span>
                </li>
              ))}
              {avances.length === 0 && <li className="tenue">Sin avances aún.</li>}
            </ul>
          </div>
        )}

        <div className="panel">
          <h3>Evidencias</h3>
          <form onSubmit={subirEnlace} className="form-inline">
            <label>
              Enlace (URL)
              <input
                type="url"
                value={urlEnlace}
                onChange={(e) => setUrlEnlace(e.target.value)}
                placeholder="https://…"
              />
            </label>
            <button type="submit">Añadir enlace</button>
          </form>

          <ul className="lista-simple">
            {evidencias.map((ev) => (
              <li key={ev.id}>
                <button type="button" className="enlace" onClick={() => descargar(ev)}>
                  {ev.tipo === 'enlace' ? ev.url : ev.nombreArchivo}
                </button>
                <span className="tenue">
                  {ev.tipo} · {ev.autor.nombre} · {new Date(ev.fechaHora).toLocaleDateString('es-CO')}
                </span>
              </li>
            ))}
            {evidencias.length === 0 && <li className="tenue">Sin evidencias aún.</li>}
          </ul>
        </div>
      </div>

      {esAdmin && <AsignacionesAdmin actividadId={id} descripcion={actividad.descripcion} />}
    </section>
  );
}

// ─── Fila de una subactividad: su propio avance + evidencia (enlace) ─
interface AvanceSubactividad {
  id: string;
  porcentaje: number;
  enlaceEvidencia: string | null;
  observaciones: string | null;
  fechaHora: string;
  usuario: { nombre: string };
}

function SubactividadFila({
  subactividad,
  onCambio,
}: {
  subactividad: Subactividad;
  onCambio: () => Promise<void>;
}) {
  const [porcentaje, setPorcentaje] = useState('');
  const [enlace, setEnlace] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [historial, setHistorial] = useState<AvanceSubactividad[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function registrar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiJson(`/api/subactividades/${subactividad.id}/avances`, {
        method: 'POST',
        body: JSON.stringify({
          porcentaje: Number(porcentaje),
          enlaceEvidencia: enlace || undefined,
          observaciones: observaciones || undefined,
        }),
      });
      setPorcentaje('');
      setEnlace('');
      setObservaciones('');
      setMostrarForm(false);
      setHistorial(null);
      await onCambio();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function alternarHistorial() {
    if (historial) {
      setHistorial(null);
      return;
    }
    try {
      setHistorial(await apiJson<AvanceSubactividad[]>(`/api/subactividades/${subactividad.id}/avances`));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <li>
      {subactividad.descripcion}
      <span className="tenue"> — {Math.round(subactividad.avancePorcentaje)}%</span>{' '}
      <button type="button" className="enlace" onClick={() => setMostrarForm((v) => !v)}>
        {mostrarForm ? 'cancelar' : 'actualizar avance'}
      </button>{' '}
      <button type="button" className="enlace" onClick={alternarHistorial}>
        {historial ? 'ocultar historial' : 'ver historial'}
      </button>
      {error && <div className="form-error">{error}</div>}
      {mostrarForm && (
        <form onSubmit={registrar} className="form-inline">
          <label>
            % avance
            <input
              type="number"
              min={0}
              max={100}
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
              required
            />
          </label>
          <label>
            Enlace de evidencia
            <input type="url" value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="https://…" />
          </label>
          <label>
            Observaciones
            <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </label>
          <button type="submit">Guardar</button>
        </form>
      )}
      {historial && (
        <ul className="lista-simple">
          {historial.map((h) => (
            <li key={h.id}>
              <strong>{Math.round(h.porcentaje)}%</strong> — {h.usuario.nombre}
              <span className="tenue">
                {new Date(h.fechaHora).toLocaleString('es-CO')}
                {h.observaciones ? ` · ${h.observaciones}` : ''}
              </span>
              {h.enlaceEvidencia && (
                <>
                  {' · '}
                  <a href={h.enlaceEvidencia} target="_blank" rel="noopener noreferrer">
                    evidencia
                  </a>
                </>
              )}
            </li>
          ))}
          {historial.length === 0 && <li className="tenue">Sin avances aún.</li>}
        </ul>
      )}
    </li>
  );
}

// ─── Sub-sección de asignaciones (solo admin) ──────────────────────
interface AsignacionItem {
  id: string;
  pesoTrabajoPorcentaje: number;
  usuario: { id: string; nombre: string; email: string };
}
interface RespAsignaciones {
  asignaciones: AsignacionItem[];
  sumaPesos: number;
  pesosValidos: boolean;
}
interface UsuarioLista {
  id: string;
  nombre: string;
  email: string;
}

function AsignacionesAdmin({
  actividadId,
  descripcion,
}: {
  actividadId: string;
  descripcion: string | null;
}) {
  const [datos, setDatos] = useState<RespAsignaciones | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [peso, setPeso] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [asg, us] = await Promise.all([
        apiJson<RespAsignaciones>(`/api/actividades/${actividadId}/asignaciones`),
        apiJson<UsuarioLista[]>('/api/usuarios'),
      ]);
      setDatos(asg);
      setUsuarios(us);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [actividadId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function asignar(e: FormEvent) {
    e.preventDefault();
    try {
      await apiJson(`/api/actividades/${actividadId}/asignaciones`, {
        method: 'POST',
        body: JSON.stringify({ usuarioId, pesoTrabajoPorcentaje: Number(peso) }),
      });
      setUsuarioId('');
      setPeso('');
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function quitar(asignacionId: string) {
    await apiFetch(`/api/actividades/${actividadId}/asignaciones/${asignacionId}`, {
      method: 'DELETE',
    });
    await cargar();
  }

  return (
    <div className="panel">
      <h3>Asignaciones (admin)</h3>
      {descripcion && (
        <p className="tenue" style={{ marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>
          {descripcion}
        </p>
      )}
      {error && <div className="form-error">{error}</div>}
      {datos && (
        <p className="tenue">
          Suma de pesos: {Math.round(datos.sumaPesos)}% {datos.pesosValidos ? '✓' : '(debe ser 100%)'}
        </p>
      )}
      <ul className="lista-simple">
        {datos?.asignaciones.map((a) => (
          <li key={a.id}>
            {a.usuario.nombre} — {Math.round(a.pesoTrabajoPorcentaje)}%
            <button type="button" className="enlace" onClick={() => quitar(a.id)}>
              quitar
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={asignar} className="form-inline">
        <label>
          Colaborador
          <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} required>
            <option value="">—</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.email})
              </option>
            ))}
          </select>
        </label>
        <label>
          Peso %
          <input
            type="number"
            min={0}
            max={100}
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            required
          />
        </label>
        <button type="submit">Asignar</button>
      </form>
    </div>
  );
}
