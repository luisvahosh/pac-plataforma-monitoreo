import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardText } from '@phosphor-icons/react';
import { apiJson } from '../api-cliente';
import { useAuth } from '../auth-contexto';
import { Esqueleto } from '../../components/Esqueleto';
import { EstadoVacio } from '../../components/EstadoVacio';
import { EstadoBadge } from '../../components/EstadoBadge';
import { DesviacionBadge } from '../../components/DesviacionBadge';
import { BarraAvance } from '../../components/BarraAvance';
import type { EstadoActividad, EstadoCronograma } from '../../tipos';

interface MiActividad {
  asignacionId: string;
  pesoTrabajoPorcentaje: number;
  actividad: {
    id: string;
    nombre: string;
    avancePorcentaje: number;
    estado: EstadoActividad;
    estadoCronograma: EstadoCronograma;
    desviacion: number | null;
    fase: { nombre: string } | null;
  };
}

// Las más urgentes primero: atrasadas/en riesgo por cronograma, luego
// vencidas/próximas a vencer por fecha, luego el resto.
const PRIORIDAD_CRONOGRAMA: Record<EstadoCronograma, number> = {
  atrasada: 0,
  en_riesgo: 1,
  sin_iniciar: 2,
  en_tiempo: 2,
  completada: 3,
};

export function MisActividades() {
  const { esAdmin } = useAuth();
  const [items, setItems] = useState<MiActividad[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiJson<MiActividad[]>('/api/mis-actividades')
      .then((datos) =>
        setItems(
          [...datos].sort(
            (a, b) =>
              PRIORIDAD_CRONOGRAMA[a.actividad.estadoCronograma] -
              PRIORIDAD_CRONOGRAMA[b.actividad.estadoCronograma],
          ),
        ),
      )
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <section>
      <h2>Mis actividades</h2>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {!items && !error && (
        <div className="mis-actividades-lista" role="status" aria-label="Cargando tus actividades">
          <span className="sr-solo">Cargando…</span>
          {[0, 1, 2].map((i) => (
            <div className="panel" key={i} aria-hidden="true">
              <Esqueleto ancho="60%" alto="1.05rem" />
              <Esqueleto ancho="100%" alto="10px" radio="999px" style={{ marginTop: '0.75rem' }} />
            </div>
          ))}
        </div>
      )}
      {items && items.length === 0 && (
        <EstadoVacio
          icono={ClipboardText}
          titulo="No tienes actividades asignadas"
          descripcion="Cuando un administrador te asigne una (a ella o a alguna de sus tareas puntuales), aparecerá aquí."
        />
      )}

      <div className="mis-actividades-lista">
        {items?.map((it) => (
          <Link
            to={`/app/actividad/${it.actividad.id}`}
            className="panel mis-actividades-tarjeta"
            key={it.asignacionId}
          >
            <div className="mis-actividades-cabecera">
              <span className="mis-actividades-nombre">{it.actividad.nombre}</span>
              <EstadoBadge estado={it.actividad.estado} />
            </div>
            <BarraAvance valor={it.actividad.avancePorcentaje} />
            <div className="mis-actividades-pie">
              <span className="tenue">
                {it.actividad.fase?.nombre ?? '—'} · avance{' '}
                {Math.round(it.actividad.avancePorcentaje)}% · tu peso{' '}
                {Math.round(it.pesoTrabajoPorcentaje)}%
              </span>
              <DesviacionBadge
                estadoCronograma={it.actividad.estadoCronograma}
                desviacion={it.actividad.desviacion}
              />
            </div>
          </Link>
        ))}
      </div>

      {esAdmin && (
        <p className="tenue" style={{ marginTop: '1rem' }}>
          ¿Buscas otra actividad para asignar responsables o revisar avances? Ve a{' '}
          <Link to="/app/admin/actividades">Actividades</Link> para explorar todas las fases del
          proyecto.
        </p>
      )}
    </section>
  );
}
