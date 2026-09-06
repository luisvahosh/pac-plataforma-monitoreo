import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Warning, WarningOctagon } from '@phosphor-icons/react';
import type { EstadoActividad, Proyecto } from '../../tipos';
import { redondear } from '../../api';
import { EstadoBadge } from '../EstadoBadge';
import { DesviacionBadge } from '../DesviacionBadge';
import { COLOR_NIVEL, nivelSemaforo } from './semaforo';
import { calcularMetricas, FILTROS_INICIALES, filtrarProyecto, type Filtros } from './metricas';

const ESTADO_COLOR: Record<EstadoActividad, string> = {
  pendiente: 'var(--pendiente)',
  en_ejecucion: 'var(--ejecucion)',
  finalizada: 'var(--finalizada)',
  proxima_a_vencer: 'var(--proxima)',
  vencida: 'var(--vencida)',
};
const ESTADO_LABEL: Record<EstadoActividad, string> = {
  pendiente: 'Pendientes',
  en_ejecucion: 'En ejecución',
  finalizada: 'Finalizadas',
  proxima_a_vencer: 'Próximas a vencer',
  vencida: 'Vencidas',
};

const TOOLTIP_STYLE = {
  background: 'var(--superficie)',
  border: '1px solid var(--borde)',
  borderRadius: 8,
  color: 'var(--texto)',
  fontSize: 13,
};
const EJE_TICK = { fill: 'var(--texto-tenue)', fontSize: 12 };

function Punto({ nivel }: { nivel: 'verde' | 'amarillo' | 'rojo' }) {
  return (
    <span className="ejec-punto" style={{ background: COLOR_NIVEL[nivel] }} aria-hidden="true" />
  );
}

export function EjecutarPlan({ proyecto }: { proyecto: Proyecto }) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);

  const fasesFiltradas = useMemo(() => filtrarProyecto(proyecto, filtros), [proyecto, filtros]);
  const m = useMemo(() => calcularMetricas(fasesFiltradas), [fasesFiltradas]);

  // Colaboradores para el selector (de todo el proyecto, no del recorte).
  const colaboradores = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of proyecto.fases)
      for (const a of f.actividades)
        for (const s of a.subactividades)
          for (const r of s.responsables) map.set(r.usuarioId, r.nombre);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [proyecto]);

  function set<K extends keyof Filtros>(clave: K, valor: Filtros[K]) {
    setFiltros((f) => ({ ...f, [clave]: valor }));
  }

  const cumplimientoEntregables =
    m.totalEntregables > 0 ? Math.round((m.estados.finalizada / m.totalEntregables) * 100) : 0;

  const dataEstados = (Object.keys(ESTADO_LABEL) as EstadoActividad[])
    .map((e) => ({ estado: e, nombre: ESTADO_LABEL[e], valor: m.estados[e] }))
    .filter((d) => d.valor > 0);

  const dataComponentes = m.porComponente.map((c) => ({
    nombre: c.nombre,
    Real: redondear(c.avanceReal),
    Esperado: c.avanceEsperado === null ? null : redondear(c.avanceEsperado),
  }));

  const dataColab = m.colaboradores.map((c) => ({
    nombre: c.nombre,
    avance: redondear(c.avance),
    actividades: c.actividades,
    usuarioId: c.usuarioId,
  }));

  const dataEvid =
    m.evidencias.ejecutadas > 0
      ? [
          { nombre: 'Con evidencia', valor: m.evidencias.conEvidencia, color: 'var(--finalizada)' },
          { nombre: 'Sin evidencia', valor: m.evidencias.sinEvidencia, color: 'var(--vencida)' },
        ]
      : [];

  return (
    <div className="ejec">
      {/* Filtros */}
      <div className="ejec-filtros" role="group" aria-label="Filtros del tablero">
        <label>
          Componente
          <select value={filtros.componente} onChange={(e) => set('componente', e.target.value)}>
            <option value="todas">Todos</option>
            {proyecto.fases.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            value={filtros.estado}
            onChange={(e) => set('estado', e.target.value as Filtros['estado'])}
          >
            <option value="todos">Todos</option>
            {(Object.keys(ESTADO_LABEL) as EstadoActividad[]).map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Colaborador
          <select value={filtros.colaborador} onChange={(e) => set('colaborador', e.target.value)}>
            <option value="todos">Todos</option>
            {colaboradores.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Período
          <select
            value={filtros.periodo}
            onChange={(e) => set('periodo', e.target.value as Filtros['periodo'])}
          >
            <option value="todos">Todo el proyecto</option>
            <option value="proximos_30">Vencen ≤ 30 días</option>
            <option value="proximos_90">Vencen ≤ 90 días</option>
          </select>
        </label>
        {(filtros.componente !== 'todas' ||
          filtros.estado !== 'todos' ||
          filtros.colaborador !== 'todos' ||
          filtros.periodo !== 'todos') && (
          <button
            type="button"
            className="ejec-limpiar"
            onClick={() => setFiltros(FILTROS_INICIALES)}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* KPIs */}
      <section className="kpis ejec-kpis" aria-label="Indicadores ejecutivos">
        <div className="kpi kpi-info">
          <div className="valor">{m.avanceReal === null ? '—' : `${redondear(m.avanceReal)}%`}</div>
          <div className="etiqueta">Avance real</div>
        </div>
        <div className="kpi kpi-neutro">
          <div className="valor">
            {m.avanceEsperado === null ? '—' : `${redondear(m.avanceEsperado)}%`}
          </div>
          <div className="etiqueta">Avance esperado</div>
        </div>
        <div className="kpi">
          <div className="valor ejec-valor-desv">
            {m.desviacion === null ? (
              '—'
            ) : (
              <>
                <Punto
                  nivel={m.desviacion >= 0 ? 'verde' : m.desviacion >= -15 ? 'amarillo' : 'rojo'}
                />
                {m.desviacion > 0 ? '+' : ''}
                {redondear(m.desviacion)} pts
              </>
            )}
          </div>
          <div className="etiqueta">Desviación (real − esperado)</div>
        </div>
        <div className="kpi">
          <div className="valor ejec-valor-desv">
            <Punto nivel={nivelSemaforo(cumplimientoEntregables)} />
            {cumplimientoEntregables}%
          </div>
          <div className="etiqueta">Entregables finalizados</div>
        </div>
        <div className="kpi kpi-ok">
          <div className="valor">
            {m.hitos.cumplidos}/{m.hitos.total}
          </div>
          <div className="etiqueta">Hitos cumplidos</div>
        </div>
        <div className="kpi">
          <div className="valor ejec-valor-desv">
            {m.evidencias.trazabilidad === null ? (
              '—'
            ) : (
              <>
                <Punto nivel={nivelSemaforo(m.evidencias.trazabilidad)} />
                {m.evidencias.trazabilidad}%
              </>
            )}
          </div>
          <div className="etiqueta">Trazabilidad de evidencias</div>
        </div>
      </section>

      <div className="ejec-grid">
        {/* Avance real vs esperado por componente */}
        <section className="ejec-panel">
          <h3>Avance real vs. esperado por componente</h3>
          {dataComponentes.length === 0 ? (
            <p className="ejec-vacio">Sin componentes para el filtro actual.</p>
          ) : (
            <ResponsiveContainer width="100%" height={40 + dataComponentes.length * 46}>
              <BarChart
                data={dataComponentes}
                layout="vertical"
                margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" tick={EJE_TICK} />
                <YAxis type="category" dataKey="nombre" width={130} tick={EJE_TICK} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                <Legend />
                <Bar dataKey="Real" fill="var(--primario)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Esperado" fill="var(--pendiente)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Estado de entregables (torta clicable) */}
        <section className="ejec-panel">
          <h3>Estado de entregables</h3>
          <p className="ejec-sub">Haz clic en una porción para filtrar.</p>
          {dataEstados.length === 0 ? (
            <p className="ejec-vacio">Sin entregables para el filtro actual.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={dataEstados}
                  dataKey="valor"
                  nameKey="nombre"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  onClick={(_, index) => {
                    const d = dataEstados[index];
                    if (d) set('estado', d.estado);
                  }}
                >
                  {dataEstados.map((d) => (
                    <Cell
                      key={d.estado}
                      fill={ESTADO_COLOR[d.estado]}
                      cursor="pointer"
                      stroke="var(--superficie)"
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Cumplimiento por colaborador */}
        <section className="ejec-panel ejec-ancho">
          <h3>Cumplimiento por colaborador</h3>
          <p className="ejec-sub">
            % de avance de las actividades asignadas. Sirve para ver cuellos de botella, no para
            calificar a las personas.
          </p>
          {dataColab.length === 0 ? (
            <p className="ejec-vacio">No hay colaboradores asignados para el filtro actual.</p>
          ) : (
            <div className="ejec-colab">
              <ResponsiveContainer width="100%" height={40 + dataColab.length * 34}>
                <BarChart
                  data={dataColab}
                  layout="vertical"
                  margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                >
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={EJE_TICK} />
                  <YAxis type="category" dataKey="nombre" width={150} tick={EJE_TICK} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                  <Bar
                    dataKey="avance"
                    name="Avance"
                    radius={[0, 4, 4, 0]}
                    cursor="pointer"
                    onClick={(_, index) => {
                      const c = dataColab[index];
                      if (c) set('colaborador', c.usuarioId);
                    }}
                  >
                    {dataColab.map((c) => (
                      <Cell key={c.usuarioId} fill={COLOR_NIVEL[nivelSemaforo(c.avance)]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <table className="ejec-tabla">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Actividades</th>
                    <th>% avance</th>
                  </tr>
                </thead>
                <tbody>
                  {dataColab.map((c) => (
                    <tr key={c.usuarioId}>
                      <td>{c.nombre}</td>
                      <td>{c.actividades}</td>
                      <td>
                        <Punto nivel={nivelSemaforo(c.avance)} /> {c.avance}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Hitos */}
        <section className="ejec-panel">
          <h3>Hitos</h3>
          <div className="ejec-tiles">
            <div className="ejec-tile">
              <span className="ejec-tile-num">{m.hitos.cumplidos}</span>
              <span>Cumplidos</span>
            </div>
            <div className="ejec-tile">
              <span className="ejec-tile-num">{m.hitos.pendientes}</span>
              <span>Pendientes</span>
            </div>
            <div className={`ejec-tile ${m.hitos.proximos > 0 ? 'ejec-alerta' : ''}`}>
              <span className="ejec-tile-num">
                {m.hitos.proximos > 0 && <Warning size={16} weight="fill" aria-hidden="true" />}
                {m.hitos.proximos}
              </span>
              <span>Próximos a vencer</span>
            </div>
            <div className={`ejec-tile ${m.hitos.retrasados > 0 ? 'ejec-peligro' : ''}`}>
              <span className="ejec-tile-num">
                {m.hitos.retrasados > 0 && (
                  <WarningOctagon size={16} weight="fill" aria-hidden="true" />
                )}
                {m.hitos.retrasados}
              </span>
              <span>Retrasados</span>
            </div>
          </div>
        </section>

        {/* Evidencias */}
        <section className="ejec-panel">
          <h3>Trazabilidad de evidencias</h3>
          {m.evidencias.ejecutadas === 0 ? (
            <p className="ejec-vacio">Aún no hay actividades ejecutadas que evidenciar.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dataEvid}
                    dataKey="valor"
                    nameKey="nombre"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {dataEvid.map((d) => (
                      <Cell key={d.nombre} fill={d.color} stroke="var(--superficie)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="ejec-sub">
                {m.evidencias.conEvidencia} de {m.evidencias.ejecutadas} actividades ejecutadas con
                evidencia · {m.evidencias.sinEvidencia} sin evidencia.
              </p>
            </>
          )}
        </section>

        {/* Riesgos anotados */}
        <section className="ejec-panel ejec-ancho">
          <h3>Riesgos anotados ({m.riesgos.length})</h3>
          {m.riesgos.length === 0 ? (
            <p className="ejec-vacio">
              No hay riesgos anotados para el filtro actual. Se registran desde el panel privado.
            </p>
          ) : (
            <ul className="ejec-riesgos">
              {m.riesgos.map((r) => (
                <li key={r.actividadId}>
                  <Warning size={16} weight="fill" aria-hidden="true" className="ejec-riesgo-ico" />
                  <div>
                    <div className="ejec-riesgo-ctx">
                      {r.componente} · {r.entregable} · {r.descripcion}
                    </div>
                    <div className="ejec-riesgo-txt">{r.texto}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* No disponible */}
        <section className="ejec-panel ejec-nodisp">
          <h3>No disponible todavía</h3>
          <p>
            <strong>Calidad de entregables</strong> (ciclos de revisión, tiempo de aprobación):
            requiere un flujo de aprobación con estados y fechas. <strong>Riesgos con nivel</strong>{' '}
            (probabilidad × impacto, matriz de calor): hoy se capturan como texto; el módulo
            estructurado se incorpora a futuro.
          </p>
        </section>
      </div>

      {/* Detalle / trazabilidad: entregables del filtro actual */}
      <section className="ejec-panel">
        <h3>Detalle de entregables ({m.totalEntregables})</h3>
        {fasesFiltradas.every((f) => f.actividades.length === 0) ? (
          <p className="ejec-vacio">Sin entregables para el filtro actual.</p>
        ) : (
          <div className="ejec-detalle">
            {fasesFiltradas.map((f) =>
              f.actividades.map((a) => (
                <div className="ejec-entregable" key={a.id}>
                  <div className="ejec-entregable-cab">
                    <strong>{a.nombre}</strong>
                    <span className="ejec-badges">
                      <EstadoBadge estado={a.estado} />
                      <DesviacionBadge
                        estadoCronograma={a.estadoCronograma}
                        desviacion={a.desviacion}
                      />
                    </span>
                  </div>
                  <div className="ejec-entregable-meta">
                    {f.nombre} · Avance {redondear(a.avancePorcentaje)}%
                    {a.subactividades.length > 0 && <> · {a.subactividades.length} actividades</>}
                  </div>
                  {a.subactividades.some((s) => s.responsables.length > 0) && (
                    <div className="ejec-responsables">
                      {[
                        ...new Set(
                          a.subactividades.flatMap((s) => s.responsables.map((r) => r.nombre)),
                        ),
                      ].map((n) => (
                        <span className="chip" key={n}>
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
