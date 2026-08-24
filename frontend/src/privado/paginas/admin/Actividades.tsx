import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from '@phosphor-icons/react';
import { apiJson } from '../../api-cliente';
import { Esqueleto } from '../../../components/Esqueleto';
import { EstadoVacio } from '../../../components/EstadoVacio';

interface Proyecto {
  id: string;
  nombre: string;
}
interface Fase {
  id: string;
  nombre: string;
  pesoPorcentaje: number;
  orden: number;
}
interface ActividadResumen {
  id: string;
  nombre: string;
  descripcion: string | null;
  avancePorcentaje: number;
  finalizada: boolean;
  tramoPago: string | null;
  tramoPagoPorcentaje: number | null;
}

/**
 * Explorador de Fases → Actividades para el Administrador: punto de entrada
 * para asignar responsables (peso de trabajo por colaborador) sin tener que
 * conocer el ID de la actividad de antemano.
 */
export function Actividades() {
  const [fases, setFases] = useState<Fase[]>([]);
  const [actividadesPorFase, setActividadesPorFase] = useState<Record<string, ActividadResumen[]>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const proyectos = await apiJson<Proyecto[]>('/api/proyectos');
        if (proyectos.length === 0) {
          setCargando(false);
          return;
        }
        const listaFases = await apiJson<Fase[]>(
          `/api/fases?proyectoId=${encodeURIComponent(proyectos[0].id)}`,
        );
        setFases(listaFases);

        const pares = await Promise.all(
          listaFases.map(
            async (f) =>
              [
                f.id,
                await apiJson<ActividadResumen[]>(
                  `/api/actividades?faseId=${encodeURIComponent(f.id)}`,
                ),
              ] as const,
          ),
        );
        setActividadesPorFase(Object.fromEntries(pares));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setCargando(false);
      }
    }
    void cargar();
  }, []);

  if (cargando) {
    return (
      <section>
        <h2>Actividades</h2>
        <div role="status" aria-label="Cargando actividades">
          <span className="sr-solo">Cargando…</span>
          {[0, 1, 2].map((i) => (
            <div className="panel" key={i} aria-hidden="true">
              <Esqueleto ancho="40%" alto="1.15rem" />
              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                <Esqueleto ancho="70%" />
                <Esqueleto ancho="55%" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Actividades</h2>
      <p className="tenue">
        Entra a una actividad para registrar avances, ver evidencias o asignar responsables (peso de
        trabajo por colaborador).
      </p>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {fases.length === 0 && !error && (
        <EstadoVacio
          icono={FolderOpen}
          titulo="No hay fases registradas todavía"
          descripcion="Cuando se publique el proyecto, aquí aparecerán sus componentes y actividades."
        />
      )}

      {fases.map((fase) => (
        <div className="panel" key={fase.id}>
          <h3>
            {fase.nombre} <span className="tenue">— peso {Math.round(fase.pesoPorcentaje)}%</span>
          </h3>
          <ul className="lista-simple">
            {(actividadesPorFase[fase.id] ?? []).map((a) => (
              <li key={a.id}>
                <Link to={`/app/actividad/${a.id}`}>{a.nombre}</Link>
                <span className="tenue">
                  Avance {Math.round(a.avancePorcentaje)}%{a.finalizada ? ' · finalizada' : ''}
                  {a.tramoPago ? ` · ${a.tramoPago} (${a.tramoPagoPorcentaje}%)` : ''}
                </span>
              </li>
            ))}
            {(actividadesPorFase[fase.id] ?? []).length === 0 && (
              <li className="tenue">Sin actividades en esta fase.</li>
            )}
          </ul>
        </div>
      ))}
    </section>
  );
}
