import type { Fase } from '../tipos';
import { formatearFecha, redondear } from '../api';

const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function primerDiaDelMes(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function mesesEntre(inicio: Date, fin: Date): Date[] {
  const meses: Date[] = [];
  const cursor = primerDiaDelMes(inicio);
  const limite = primerDiaDelMes(fin);
  while (cursor <= limite) {
    meses.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return meses;
}

export function Gantt({ fases }: { fases: Fase[] }) {
  const fechas: Date[] = [];
  for (const fase of fases) {
    for (const act of fase.actividades) {
      if (act.fechaInicioPlan) fechas.push(new Date(act.fechaInicioPlan));
      if (act.fechaFinPlan) fechas.push(new Date(act.fechaFinPlan));
    }
  }

  if (fechas.length === 0) {
    return <p className="tenue">Sin fechas registradas para dibujar el cronograma.</p>;
  }

  const rangoInicio = primerDiaDelMes(new Date(Math.min(...fechas.map((f) => f.getTime()))));
  const rangoFinBase = new Date(Math.max(...fechas.map((f) => f.getTime())));
  const rangoFin = new Date(rangoFinBase.getFullYear(), rangoFinBase.getMonth() + 1, 0);
  const rangoMs = rangoFin.getTime() - rangoInicio.getTime();

  function posicion(inicio: string | null, fin: string | null) {
    if (!inicio || !fin) return null;
    const ini = new Date(inicio).getTime();
    const term = new Date(fin).getTime();
    const left = ((ini - rangoInicio.getTime()) / rangoMs) * 100;
    const width = Math.max(((term - ini) / rangoMs) * 100, 0.6);
    return { left, width };
  }

  const hoy = new Date();
  const hoyPct =
    hoy >= rangoInicio && hoy <= rangoFin ? ((hoy.getTime() - rangoInicio.getTime()) / rangoMs) * 100 : null;

  const meses = mesesEntre(rangoInicio, rangoFin);

  return (
    <div className="gantt-envoltura">
      <div className="gantt-leyenda">
        <span className="gantt-leyenda-item">
          <span className="gantt-punto sin_iniciar" /> No iniciada
        </span>
        <span className="gantt-leyenda-item">
          <span className="gantt-punto en_tiempo" /> En tiempo
        </span>
        <span className="gantt-leyenda-item">
          <span className="gantt-punto en_riesgo" /> En riesgo
        </span>
        <span className="gantt-leyenda-item">
          <span className="gantt-punto atrasada" /> Atrasada
        </span>
        <span className="gantt-leyenda-item">
          <span className="gantt-punto completada" /> Completada
        </span>
      </div>

      <div className="gantt-scroll">
        <div className="gantt" style={{ width: `${meses.length * 90 + 220}px` }}>
          <div className="gantt-eje">
            <div className="gantt-eje-etiqueta" />
            {meses.map((m) => (
              <div className="gantt-mes" key={m.toISOString()}>
                {MESES[m.getMonth()]} {String(m.getFullYear()).slice(2)}
              </div>
            ))}
          </div>

          <div className="gantt-cuerpo">
            {hoyPct !== null && (
              <div
                className="gantt-hoy"
                style={{ left: `calc(220px + ${hoyPct}% * (100% - 220px) / 100)` }}
                title={`Hoy: ${hoy.toLocaleDateString('es-CO')}`}
              />
            )}
            {fases.map((fase) => (
              <div key={fase.id}>
                <div className="gantt-fila gantt-fila-fase">
                  <div className="gantt-etiqueta gantt-etiqueta-fase">
                    {fase.nombre} · {redondear(fase.avance)}%
                  </div>
                  <div className="gantt-area" />
                </div>
                {fase.actividades.map((act) => {
                  const pos = posicion(act.fechaInicioPlan, act.fechaFinPlan);
                  return (
                    <div className="gantt-fila" key={act.id}>
                      <div className="gantt-etiqueta" title={act.nombre}>
                        {act.nombre}
                      </div>
                      <div className="gantt-area">
                        {pos && (
                          <div
                            className={`gantt-barra ${act.estadoCronograma}`}
                            style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
                            title={
                              `${act.nombre}\n` +
                              `${formatearFecha(act.fechaInicioPlan)} – ${formatearFecha(act.fechaFinPlan)}\n` +
                              `Avance: ${redondear(act.avancePorcentaje)}%`
                            }
                          >
                            <div
                              className="gantt-barra-progreso"
                              style={{ width: `${redondear(act.avancePorcentaje)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
