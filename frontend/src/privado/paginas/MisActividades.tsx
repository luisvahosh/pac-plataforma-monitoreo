import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardText } from '@phosphor-icons/react';
import { apiJson } from '../api-cliente';
import { useAuth } from '../auth-contexto';
import { Esqueleto } from '../../components/Esqueleto';
import { EstadoVacio } from '../../components/EstadoVacio';

interface MiActividad {
  asignacionId: string;
  pesoTrabajoPorcentaje: number;
  actividad: {
    id: string;
    nombre: string;
    avancePorcentaje: number;
    fase: { nombre: string } | null;
  };
}

export function MisActividades() {
  const { esAdmin } = useAuth();
  const [items, setItems] = useState<MiActividad[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiJson<MiActividad[]>('/api/mis-actividades')
      .then(setItems)
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
        <div
          className="esqueleto-fila"
          role="status"
          aria-label="Cargando tus actividades"
          style={{
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '0.6rem',
            marginTop: '0.75rem',
          }}
        >
          <span className="sr-solo">Cargando…</span>
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} alto="1.1rem" ancho={i === 1 ? '80%' : '95%'} />
          ))}
        </div>
      )}
      {items && items.length === 0 && (
        <EstadoVacio
          icono={ClipboardText}
          titulo="No tienes actividades asignadas"
          descripcion="Cuando un administrador te asigne una, aparecerá aquí."
        />
      )}
      <ul className="lista-simple">
        {items?.map((it) => (
          <li key={it.asignacionId}>
            <Link to={`/app/actividad/${it.actividad.id}`}>{it.actividad.nombre}</Link>
            <span className="tenue">
              {it.actividad.fase?.nombre ?? '—'} · avance{' '}
              {Math.round(it.actividad.avancePorcentaje)}% · tu peso{' '}
              {Math.round(it.pesoTrabajoPorcentaje)}%
            </span>
          </li>
        ))}
      </ul>

      {esAdmin && (
        <p className="tenue">
          ¿Buscas otra actividad para asignar responsables o revisar avances? Ve a{' '}
          <Link to="/app/admin/actividades">Actividades</Link> para explorar todas las fases del
          proyecto.
        </p>
      )}
    </section>
  );
}
