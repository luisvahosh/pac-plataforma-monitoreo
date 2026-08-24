import { CheckCircle, Circle, FolderOpen } from '@phosphor-icons/react';
import type { Fase } from '../tipos';
import { BarraAvance } from './BarraAvance';
import { EstadoBadge } from './EstadoBadge';
import { DesviacionBadge } from './DesviacionBadge';
import { EstadoVacio } from './EstadoVacio';
import { formatearFecha, redondear } from '../api';

export function ListaFases({ fases }: { fases: Fase[] }) {
  if (fases.length === 0) {
    return (
      <EstadoVacio
        icono={FolderOpen}
        titulo="No hay fases registradas todavía"
        descripcion="Cuando se publique el proyecto, aquí aparecerán sus componentes y actividades."
      />
    );
  }

  return (
    <section aria-label="Fases y actividades">
      {fases.map((fase) => (
        <article className="fase" key={fase.id}>
          <div className="fase-cabecera">
            <h3>{fase.nombre}</h3>
            <span className="fase-peso">
              Peso {redondear(fase.pesoPorcentaje)}% · Avance {redondear(fase.avance)}%
            </span>
          </div>
          <BarraAvance valor={fase.avance} />

          <ul className="actividades">
            {fase.actividades.map((actividad) => (
              <li className="actividad" key={actividad.id}>
                <div className="actividad-cabecera">
                  <span className="actividad-nombre">{actividad.nombre}</span>
                  <span>
                    <EstadoBadge estado={actividad.estado} />{' '}
                    <strong>{redondear(actividad.avancePorcentaje)}%</strong>
                  </span>
                </div>
                <BarraAvance valor={actividad.avancePorcentaje} />
                <div className="actividad-fechas">
                  Inicio: {formatearFecha(actividad.fechaInicioPlan)} · Fin:{' '}
                  {formatearFecha(actividad.fechaFinPlan)}{' '}
                  <DesviacionBadge
                    estadoCronograma={actividad.estadoCronograma}
                    desviacion={actividad.desviacion}
                  />
                </div>
                {actividad.hitos.length > 0 && (
                  <ul className="hitos">
                    {actividad.hitos.map((hito) => (
                      <li className={`hito ${hito.cumplido ? 'cumplido' : ''}`} key={hito.id}>
                        {hito.cumplido ? (
                          <CheckCircle size={13} weight="bold" aria-hidden="true" />
                        ) : (
                          <Circle size={13} weight="bold" aria-hidden="true" />
                        )}
                        {hito.nombre} ({formatearFecha(hito.fechaObjetivo)})
                      </li>
                    ))}
                  </ul>
                )}
                {actividad.subactividades.length > 0 && (
                  <ul className="subactividades">
                    {actividad.subactividades.map((sub) => (
                      <li className="subactividad" key={sub.id}>
                        <span className="subactividad-nombre">{sub.descripcion}</span>
                        <span className="subactividad-avance">
                          {redondear(sub.avancePorcentaje)}%
                        </span>
                        <BarraAvance valor={sub.avancePorcentaje} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
