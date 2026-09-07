import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiJson } from '../../api-cliente';
import { obtenerDashboard } from '../../../api';
import type { DashboardResp, Fase } from '../../../tipos';
import { Esqueleto } from '../../../components/Esqueleto';

// ─── Tipos de la API de actas ───────────────────────────────────────
interface UsuarioLista {
  id: string;
  nombre: string;
  email: string;
}
interface Asistente {
  usuarioId?: string | null;
  nombre?: string | null;
  organizacion?: string | null;
  rolEnReunion?: string | null;
  esInvitado?: boolean;
  usuario?: { id: string; nombre: string } | null;
}
interface Tema {
  tema: string;
  actividadId?: string | null;
  subactividadId?: string | null;
  descripcion?: string | null;
  decisiones?: string | null;
  observaciones?: string | null;
}
interface Conclusion {
  texto: string;
}
interface Acta {
  id: string;
  numero: number;
  fecha: string;
  lugar: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  actividadTema: string | null;
  objetivo: string | null;
  elaboradoPor: string | null;
  convocadaPor: string | null;
  estado: string;
  asistentes: Asistente[];
  temas: Tema[];
  conclusiones: Conclusion[];
  tareas: {
    id: string;
    nombre: string;
    pesoPorcentaje: number;
    avancePorcentaje: number;
    usuario: { nombre: string };
    subactividad: { descripcion: string };
  }[];
  riesgosOrigen: { id: string; descripcion: string; estado: string }[];
}
interface TareaPendiente {
  id: string;
  nombre: string;
  estado: string;
  avancePorcentaje: number;
  fechaCompromiso: string | null;
  usuario: { nombre: string } | null;
  subactividad: { descripcion: string; actividad: { nombre: string } } | null;
}
interface RiesgoAbierto {
  id: string;
  descripcion: string;
  nivel: string | null;
  estado: string;
  responsable: { nombre: string } | null;
  subactividad: { descripcion: string; actividad: { nombre: string } } | null;
}
interface Contexto {
  numeroPropuesto: number;
  actaAnterior: { numero: number; fecha: string } | null;
  tareasPendientes: TareaPendiente[];
  riesgosAbiertos: RiesgoAbierto[];
}

export function ActaEditor() {
  const { id = '' } = useParams();
  const [acta, setActa] = useState<Acta | null>(null);
  const [contexto, setContexto] = useState<Contexto | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Campos generales (edición local; se persisten con "Guardar borrador").
  const [gen, setGen] = useState({
    fecha: '',
    lugar: '',
    horaInicio: '',
    horaFin: '',
    actividadTema: '',
    objetivo: '',
    elaboradoPor: '',
    convocadaPor: '',
  });
  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [conclusiones, setConclusiones] = useState<string[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);

  const cargarActa = useCallback(async () => {
    const a = await apiJson<Acta>(`/api/actas/${id}`);
    setActa(a);
    setGen({
      fecha: a.fecha ? a.fecha.slice(0, 10) : '',
      lugar: a.lugar ?? '',
      horaInicio: a.horaInicio ?? '',
      horaFin: a.horaFin ?? '',
      actividadTema: a.actividadTema ?? '',
      objetivo: a.objetivo ?? '',
      elaboradoPor: a.elaboradoPor ?? '',
      convocadaPor: a.convocadaPor ?? '',
    });
    setAsistentes(a.asistentes);
    setConclusiones(a.conclusiones.map((c) => c.texto));
    setTemas(a.temas);
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const [, ctx, us, dash] = await Promise.all([
          cargarActa(),
          apiJson<Contexto>('/api/actas/contexto'),
          apiJson<UsuarioLista[]>('/api/usuarios'),
          obtenerDashboard(),
        ]);
        setContexto(ctx);
        setUsuarios(us);
        setDashboard(dash);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [cargarActa]);

  const editable = acta?.estado === 'borrador';

  async function guardarBorrador() {
    setError(null);
    setMensaje(null);
    try {
      await apiJson(`/api/actas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fecha: gen.fecha || undefined,
          lugar: gen.lugar || undefined,
          horaInicio: gen.horaInicio || undefined,
          horaFin: gen.horaFin || undefined,
          actividadTema: gen.actividadTema || undefined,
          objetivo: gen.objetivo || undefined,
          elaboradoPor: gen.elaboradoPor || undefined,
          convocadaPor: gen.convocadaPor || undefined,
          asistentes: asistentes.map((a) => ({
            usuarioId: a.usuario?.id ?? a.usuarioId ?? undefined,
            nombre: a.nombre ?? undefined,
            organizacion: a.organizacion ?? undefined,
            rolEnReunion: a.rolEnReunion ?? undefined,
            esInvitado: a.esInvitado ?? !(a.usuario?.id ?? a.usuarioId),
          })),
          temas: temas.map((t) => ({
            tema: t.tema,
            actividadId: t.actividadId ?? undefined,
            subactividadId: t.subactividadId ?? undefined,
            descripcion: t.descripcion ?? undefined,
            decisiones: t.decisiones ?? undefined,
            observaciones: t.observaciones ?? undefined,
          })),
          conclusiones: conclusiones.filter((c) => c.trim()).map((texto) => ({ texto })),
        }),
      });
      await cargarActa();
      setMensaje('Borrador guardado.');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function enviar() {
    setError(null);
    try {
      const r = await apiJson<Record<string, number>>(`/api/actas/${id}/resumen`);
      const texto =
        `Se enviará el acta con:\n` +
        `· ${r.tareasCreadas} tareas creadas\n` +
        `· ${r.riesgosCreados} riesgos creados · ${r.riesgosActualizados} actualizados\n` +
        `· ${r.temasRevisados} temas · ${r.conclusiones} conclusiones\n\n` +
        `Una vez enviada no podrá editarse. ¿Continuar?`;
      if (!window.confirm(texto)) return;
      await apiJson(`/api/actas/${id}/enviar`, { method: 'POST' });
      await cargarActa();
      setMensaje('Acta enviada. Ya es visible en la parte pública.');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function reabrir() {
    setError(null);
    if (
      !window.confirm(
        'Reabrir el acta la vuelve a borrador y la retira de la vista pública hasta que la ' +
          'envíes de nuevo. ¿Continuar?',
      )
    )
      return;
    try {
      await apiJson(`/api/actas/${id}/reabrir`, { method: 'POST' });
      await cargarActa();
      setMensaje('Acta reabierta: ya puedes editarla. Recuerda enviarla de nuevo al terminar.');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (error && !acta)
    return (
      <div className="form-error" role="alert">
        {error}
      </div>
    );
  if (!acta)
    return (
      <section role="status" aria-label="Cargando acta">
        <Esqueleto ancho="40%" alto="1.6rem" />
        <div className="panel" style={{ marginTop: '1rem' }}>
          <Esqueleto ancho="90%" />
          <Esqueleto ancho="60%" style={{ marginTop: '0.5rem' }} />
        </div>
      </section>
    );

  return (
    <section>
      <p className="tenue">
        <Link to="/app/admin/actas">← Actas</Link>
      </p>
      <h2>
        Acta {String(acta.numero).padStart(2, '0')}{' '}
        <span className={`chip ${acta.estado === 'enviada' ? 'activo' : ''}`}>{acta.estado}</span>
        {!editable && (
          <button
            type="button"
            className="enlace"
            style={{ marginLeft: '0.75rem' }}
            onClick={reabrir}
          >
            Reabrir acta
          </button>
        )}
      </h2>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {mensaje && (
        <div className="aviso" role="status">
          {mensaje}
        </div>
      )}

      {/* ── Datos generales ── */}
      <div className="panel">
        <h3>Datos generales</h3>
        <div className="form">
          <div className="grid-2">
            <label>
              Fecha
              <input
                type="date"
                value={gen.fecha}
                disabled={!editable}
                onChange={(e) => setGen({ ...gen, fecha: e.target.value })}
              />
            </label>
            <label>
              Lugar
              <input
                value={gen.lugar}
                disabled={!editable}
                onChange={(e) => setGen({ ...gen, lugar: e.target.value })}
              />
            </label>
            <label>
              Hora inicio
              <input
                type="time"
                value={gen.horaInicio}
                disabled={!editable}
                onChange={(e) => setGen({ ...gen, horaInicio: e.target.value })}
              />
            </label>
            <label>
              Hora fin
              <input
                type="time"
                value={gen.horaFin}
                disabled={!editable}
                onChange={(e) => setGen({ ...gen, horaFin: e.target.value })}
              />
            </label>
            <label>
              Elaborado por
              <input
                value={gen.elaboradoPor}
                disabled={!editable}
                onChange={(e) => setGen({ ...gen, elaboradoPor: e.target.value })}
              />
            </label>
            <label>
              Convocada por
              <input
                value={gen.convocadaPor}
                disabled={!editable}
                onChange={(e) => setGen({ ...gen, convocadaPor: e.target.value })}
              />
            </label>
          </div>
          <label>
            Actividad o tema
            <input
              value={gen.actividadTema}
              disabled={!editable}
              onChange={(e) => setGen({ ...gen, actividadTema: e.target.value })}
            />
          </label>
          <label>
            Objetivo de la reunión
            <textarea
              value={gen.objetivo}
              disabled={!editable}
              rows={2}
              onChange={(e) => setGen({ ...gen, objetivo: e.target.value })}
            />
          </label>
        </div>

        <Asistentes
          asistentes={asistentes}
          usuarios={usuarios}
          editable={editable}
          onChange={setAsistentes}
        />
      </div>

      {/* ── Seguimiento del acta anterior ── */}
      <SeguimientoAnterior contexto={contexto} editable={editable} />

      {/* ── Seleccionar actividades (varias, de cualquier componente) ── */}
      {editable && dashboard?.proyecto && (
        <SelectorActividades fases={dashboard.proyecto.fases} actaId={id} onCambio={cargarActa} />
      )}

      {/* ── Desarrollo temático ── */}
      <ListaEditable
        titulo="Desarrollo de la reunión (temas)"
        editable={editable}
        items={temas}
        vacio="Sin temas registrados."
        render={(t: Tema) => `${t.tema}${t.decisiones ? ` — decisión: ${t.decisiones}` : ''}`}
        onAdd={(texto) => setTemas([...temas, { tema: texto }])}
        onRemove={(i) => setTemas(temas.filter((_, j) => j !== i))}
        placeholder="Tema tratado…"
      />

      {/* ── Conclusiones ── */}
      <ListaEditable
        titulo="Conclusiones"
        editable={editable}
        items={conclusiones}
        vacio="Sin conclusiones."
        render={(c: string) => c}
        onAdd={(texto) => setConclusiones([...conclusiones, texto])}
        onRemove={(i) => setConclusiones(conclusiones.filter((_, j) => j !== i))}
        placeholder="Conclusión…"
      />

      {/* ── Lo creado en esta acta ── */}
      <div className="panel">
        <h3>Registrado en esta acta</h3>
        <ul className="lista-simple">
          {acta.tareas.map((t) => (
            <li key={t.id}>
              <strong>Tarea:</strong> {t.nombre} — {t.usuario.nombre} · peso{' '}
              {Math.round(t.pesoPorcentaje)}% · avance {Math.round(t.avancePorcentaje)}%{' '}
              <span className="tenue">(en {t.subactividad.descripcion})</span>
            </li>
          ))}
          {acta.riesgosOrigen.map((r) => (
            <li key={r.id}>
              <strong>Riesgo:</strong> {r.descripcion} · {r.estado}
            </li>
          ))}
          {acta.tareas.length === 0 && acta.riesgosOrigen.length === 0 && (
            <li className="tenue">Aún no se ha creado nada.</li>
          )}
        </ul>
      </div>

      {editable && (
        <div className="acciones" style={{ marginTop: '1rem' }}>
          <button type="button" onClick={guardarBorrador}>
            Guardar borrador
          </button>
          <button type="button" onClick={enviar}>
            Enviar acta
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Asistentes (usuarios del sistema + invitados externos) ─────────
function Asistentes({
  asistentes,
  usuarios,
  editable,
  onChange,
}: {
  asistentes: Asistente[];
  usuarios: UsuarioLista[];
  editable: boolean;
  onChange: (a: Asistente[]) => void;
}) {
  const [usuarioId, setUsuarioId] = useState('');
  const [invNombre, setInvNombre] = useState('');
  const [invOrg, setInvOrg] = useState('');

  function agregarUsuario() {
    if (!usuarioId) return;
    const u = usuarios.find((x) => x.id === usuarioId);
    if (!u) return;
    onChange([
      ...asistentes,
      { usuarioId: u.id, usuario: { id: u.id, nombre: u.nombre }, esInvitado: false },
    ]);
    setUsuarioId('');
  }
  function agregarInvitado() {
    if (!invNombre.trim()) return;
    onChange([
      ...asistentes,
      { nombre: invNombre.trim(), organizacion: invOrg.trim() || null, esInvitado: true },
    ]);
    setInvNombre('');
    setInvOrg('');
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4>Asistentes</h4>
      <ul className="lista-simple">
        {asistentes.map((a, i) => (
          <li key={i}>
            {a.esInvitado ? '👤 ' : ''}
            {a.usuario?.nombre ?? a.nombre}
            {a.organizacion ? ` (${a.organizacion})` : ''}
            {a.esInvitado ? ' · invitado' : ''}
            {editable && (
              <button
                type="button"
                className="enlace"
                onClick={() => onChange(asistentes.filter((_, j) => j !== i))}
              >
                quitar
              </button>
            )}
          </li>
        ))}
        {asistentes.length === 0 && <li className="tenue">Sin asistentes.</li>}
      </ul>
      {editable && (
        <div className="form-inline">
          <label>
            Colaborador
            <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
              <option value="">—</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={agregarUsuario}>
            + Responsable
          </button>
          <label>
            Invitado (nombre)
            <input
              value={invNombre}
              onChange={(e) => setInvNombre(e.target.value)}
              placeholder="Nombre externo"
            />
          </label>
          <label>
            Organización
            <input
              value={invOrg}
              onChange={(e) => setInvOrg(e.target.value)}
              placeholder="Entidad"
            />
          </label>
          <button type="button" onClick={agregarInvitado}>
            + Invitado
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Seguimiento del acta anterior ──────────────────────────────────
function SeguimientoAnterior({
  contexto,
  editable,
}: {
  contexto: Contexto | null;
  editable: boolean;
}) {
  if (!contexto) return null;
  return (
    <div className="panel">
      <h3>Seguimiento del acta anterior</h3>
      {contexto.actaAnterior ? (
        <p className="tenue">
          Última acta enviada: Acta {String(contexto.actaAnterior.numero).padStart(2, '0')} ·{' '}
          {new Date(contexto.actaAnterior.fecha).toLocaleDateString('es-CO')}
        </p>
      ) : (
        <p className="tenue">No hay acta anterior; esta es la primera.</p>
      )}

      <h4>Tareas pendientes</h4>
      <ul className="lista-simple">
        {contexto.tareasPendientes.map((t) => (
          <li key={t.id}>
            {t.nombre} — {t.usuario?.nombre ?? 'sin responsable'}
            <span className="tenue">
              {' '}
              · {t.subactividad?.actividad.nombre ?? '—'} / {t.subactividad?.descripcion ?? '—'} ·
              avance {Math.round(t.avancePorcentaje)}%
              {t.fechaCompromiso
                ? ` · vence ${new Date(t.fechaCompromiso).toLocaleDateString('es-CO')}`
                : ''}
              {' · '}
              {t.estado}
            </span>
          </li>
        ))}
        {contexto.tareasPendientes.length === 0 && (
          <li className="tenue">Sin tareas pendientes.</li>
        )}
      </ul>

      <h4>Riesgos abiertos</h4>
      <ul className="lista-simple">
        {contexto.riesgosAbiertos.map((r) => (
          <li key={r.id}>
            ⚠ {r.descripcion}
            <span className="tenue">
              {' '}
              · {r.subactividad?.actividad.nombre ?? '—'} / {r.subactividad?.descripcion ?? '—'}
              {r.nivel ? ` · nivel ${r.nivel}` : ''} · {r.responsable?.nombre ?? 'sin responsable'}
            </span>
          </li>
        ))}
        {contexto.riesgosAbiertos.length === 0 && <li className="tenue">Sin riesgos abiertos.</li>}
      </ul>
      {editable && (
        <p className="tenue">
          Las tareas y riesgos se actualizan desde el detalle de cada actividad o abajo, al
          seleccionar la actividad en la reunión.
        </p>
      )}
    </div>
  );
}

// ─── Selector de actividades (varias, de cualquier componente) ──────
function SelectorActividades({
  fases,
  actaId,
  onCambio,
}: {
  fases: Fase[];
  actaId: string;
  onCambio: () => Promise<void>;
}) {
  const [faseId, setFaseId] = useState('');
  const [entregableId, setEntregableId] = useState('');
  const [subId, setSubId] = useState('');
  // Actividades agregadas a la reunión (varias, de distintos componentes).
  const [revisadas, setRevisadas] = useState<
    { faseNombre: string; entregableNombre: string; subId: string; descripcion: string }[]
  >([]);

  const fase = fases.find((f) => f.id === faseId);
  const entregable = fase?.actividades.find((a) => a.id === entregableId);

  function agregar() {
    if (!fase || !entregable || !subId) return;
    if (revisadas.some((r) => r.subId === subId)) return;
    const sub = entregable.subactividades.find((s) => s.id === subId);
    if (!sub) return;
    setRevisadas([
      ...revisadas,
      {
        faseNombre: fase.nombre,
        entregableNombre: entregable.nombre,
        subId: sub.id,
        descripcion: sub.descripcion,
      },
    ]);
    setSubId('');
  }

  return (
    <div className="panel">
      <h3>Actividades revisadas en la reunión</h3>
      <p className="tenue">
        Agrega una o varias actividades (de cualquier componente) para tratarlas en esta reunión.
      </p>
      <div className="form-inline">
        <label>
          Componente
          <select
            value={faseId}
            onChange={(e) => {
              setFaseId(e.target.value);
              setEntregableId('');
              setSubId('');
            }}
          >
            <option value="">—</option>
            {fases.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </label>
        {fase && (
          <label>
            Entregable
            <select
              value={entregableId}
              onChange={(e) => {
                setEntregableId(e.target.value);
                setSubId('');
              }}
            >
              <option value="">—</option>
              {fase.actividades.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
        {entregable && (
          <label>
            Actividad
            <select value={subId} onChange={(e) => setSubId(e.target.value)}>
              <option value="">—</option>
              {entregable.subactividades.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.descripcion}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="button" onClick={agregar} disabled={!subId}>
          + Agregar actividad
        </button>
      </div>

      {revisadas.map((r) => (
        <PanelActividad
          key={r.subId}
          subactividadId={r.subId}
          titulo={`${r.faseNombre} › ${r.entregableNombre} › ${r.descripcion}`}
          actaId={actaId}
          onCambio={onCambio}
          onQuitar={() => setRevisadas(revisadas.filter((x) => x.subId !== r.subId))}
        />
      ))}
      {revisadas.length === 0 && (
        <p className="tenue">Aún no has agregado actividades a la reunión.</p>
      )}
    </div>
  );
}

// ─── Panel de una actividad seleccionada ────────────────────────────
interface Presupuesto {
  usuarioId: string;
  nombre: string;
  asignado: number;
  usado: number;
  disponible: number;
}
interface TareaN4 {
  id: string;
  nombre: string;
  pesoPorcentaje: number;
  avancePorcentaje: number;
  estado: string;
  usuario: { nombre: string };
}
interface Riesgo {
  id: string;
  descripcion: string;
  estado: string;
  nivel: string | null;
  responsable: { nombre: string } | null;
}

function PanelActividad({
  subactividadId,
  titulo,
  actaId,
  onCambio,
  onQuitar,
}: {
  subactividadId: string;
  titulo: string;
  actaId: string;
  onCambio: () => Promise<void>;
  onQuitar: () => void;
}) {
  const [tareas, setTareas] = useState<TareaN4[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form crear tarea (nivel 4)
  const [tUsuario, setTUsuario] = useState('');
  const [tNombre, setTNombre] = useState('');
  const [tPeso, setTPeso] = useState('');
  // form crear riesgo
  const [riesgoDesc, setRiesgoDesc] = useState('');

  const cargar = useCallback(async () => {
    try {
      const [tk, ri] = await Promise.all([
        apiJson<{ tareas: TareaN4[]; presupuestos: Presupuesto[] }>(
          `/api/subactividades/${subactividadId}/tareas`,
        ),
        apiJson<Riesgo[]>(`/api/subactividades/${subactividadId}/riesgos`),
      ]);
      setTareas(tk.tareas);
      setPresupuestos(tk.presupuestos);
      setRiesgos(ri);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [subactividadId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const dispUsuario = presupuestos.find((p) => p.usuarioId === tUsuario)?.disponible ?? null;

  async function crearTarea(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiJson(`/api/subactividades/${subactividadId}/tareas`, {
        method: 'POST',
        body: JSON.stringify({
          usuarioId: tUsuario,
          nombre: tNombre,
          pesoPorcentaje: Number(tPeso),
          actaOrigenId: actaId,
        }),
      });
      setTUsuario('');
      setTNombre('');
      setTPeso('');
      await cargar();
      await onCambio();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function crearRiesgo(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiJson(`/api/subactividades/${subactividadId}/riesgos`, {
        method: 'POST',
        body: JSON.stringify({ descripcion: riesgoDesc, actaOrigenId: actaId }),
      });
      setRiesgoDesc('');
      await cargar();
      await onCambio();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div
      style={{ marginTop: '1rem', borderTop: '1px solid var(--borde, #ddd)', paddingTop: '1rem' }}
    >
      <h4 style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <span>{titulo}</span>
        <button type="button" className="enlace" onClick={onQuitar}>
          quitar
        </button>
      </h4>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <p className="tenue">Presupuesto por colaborador (asignado · usado · disponible):</p>
      <ul className="lista-simple">
        {presupuestos.map((p) => (
          <li key={p.usuarioId}>
            {p.nombre} — {Math.round(p.asignado)}% · {Math.round(p.usado)}% ·{' '}
            <strong>{Math.round(p.disponible)}% disponible</strong>
          </li>
        ))}
        {presupuestos.length === 0 && (
          <li className="tenue">Esta actividad no tiene responsables asignados.</li>
        )}
      </ul>

      <h5>+ Crear tarea</h5>
      <p className="tenue">
        Opcional: si esta actividad se desarrolla directamente, no crees tareas. Si la desglosas, su
        avance se calculará a partir de las tareas.
      </p>
      <form onSubmit={crearTarea} className="form-inline">
        <label>
          Responsable
          <select value={tUsuario} onChange={(e) => setTUsuario(e.target.value)} required>
            <option value="">—</option>
            {presupuestos.map((p) => (
              <option key={p.usuarioId} value={p.usuarioId}>
                {p.nombre} ({Math.round(p.disponible)}% disp.)
              </option>
            ))}
          </select>
        </label>
        <label>
          Nombre
          <input value={tNombre} onChange={(e) => setTNombre(e.target.value)} required />
        </label>
        <label>
          Peso %{dispUsuario !== null ? ` (máx ${Math.round(dispUsuario)})` : ''}
          <input
            type="number"
            min={0}
            max={dispUsuario ?? 100}
            value={tPeso}
            onChange={(e) => setTPeso(e.target.value)}
            required
          />
        </label>
        <button type="submit">Crear</button>
      </form>
      <ul className="lista-simple">
        {tareas.map((t) => (
          <li key={t.id}>
            {t.nombre} — {t.usuario.nombre} · peso {Math.round(t.pesoPorcentaje)}% · avance{' '}
            {Math.round(t.avancePorcentaje)}% · {t.estado}
          </li>
        ))}
        {tareas.length === 0 && <li className="tenue">Sin tareas aún.</li>}
      </ul>

      <h5>Riesgos de la actividad</h5>
      <ul className="lista-simple">
        {riesgos.map((r) => (
          <li key={r.id}>
            ⚠ {r.descripcion} · {r.estado}
            {r.nivel ? ` · nivel ${r.nivel}` : ''} · {r.responsable?.nombre ?? 'sin responsable'}
          </li>
        ))}
        {riesgos.length === 0 && <li className="tenue">Sin riesgos.</li>}
      </ul>
      <form onSubmit={crearRiesgo} className="form-inline">
        <label>
          Nuevo riesgo
          <input value={riesgoDesc} onChange={(e) => setRiesgoDesc(e.target.value)} required />
        </label>
        <button type="submit">+ Crear riesgo</button>
      </form>
    </div>
  );
}

// ─── Lista editable genérica (temas / conclusiones) ─────────────────
function ListaEditable<T>({
  titulo,
  editable,
  items,
  vacio,
  render,
  onAdd,
  onRemove,
  placeholder,
}: {
  titulo: string;
  editable: boolean;
  items: T[];
  vacio: string;
  render: (item: T) => string;
  onAdd: (texto: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [texto, setTexto] = useState('');
  return (
    <div className="panel">
      <h3>{titulo}</h3>
      <ul className="lista-simple">
        {items.map((it, i) => (
          <li key={i}>
            {render(it)}
            {editable && (
              <button type="button" className="enlace" onClick={() => onRemove(i)}>
                quitar
              </button>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="tenue">{vacio}</li>}
      </ul>
      {editable && (
        <div className="form-inline">
          <label style={{ flex: 1 }}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={placeholder}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (texto.trim()) {
                onAdd(texto.trim());
                setTexto('');
              }
            }}
          >
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}
