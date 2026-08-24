import { useEffect, useState } from 'react';
import { obtenerDashboard, redondear } from './api';
import type { DashboardResp } from './tipos';
import { Donut } from './components/Donut';
import { TarjetasIndicadores } from './components/TarjetasIndicadores';
import { ListaFases } from './components/ListaFases';
import { Gantt } from './components/Gantt';

type Pestana = 'resumen' | 'cronograma';

export function App() {
  const [data, setData] = useState<DashboardResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pestana, setPestana] = useState<Pestana>('resumen');
  const [faseId, setFaseId] = useState<string>('todas');

  useEffect(() => {
    obtenerDashboard()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <div className="estado-carga">Cargando el estado del proyecto…</div>;
  }
  if (error) {
    return <div className="estado-error">No se pudo cargar el dashboard: {error}</div>;
  }
  if (!data || !data.proyecto || !data.indicadores) {
    return <div className="estado-carga">Aún no hay un proyecto publicado.</div>;
  }

  const { proyecto, indicadores } = data;
  const fasesFiltradas =
    faseId === 'todas' ? proyecto.fases : proyecto.fases.filter((f) => f.id === faseId);

  return (
    <>
      <header className="cabecera">
        <div className="contenedor">
          <div className="cabecera-acciones">
            <a href="/ayuda" className="enlace-ayuda">
              ¿Cómo se lee esto?
            </a>
            <a href="/login" className="boton-acceso">
              Acceso colaboradores
            </a>
          </div>
          <h1>{proyecto.nombre}</h1>
          {proyecto.objetivos && <p>{proyecto.objetivos}</p>}
          <div className="resumen">
            <Donut valor={proyecto.avance} />
            <div>
              <strong style={{ fontSize: '1.1rem' }}>Avance global</strong>
              <div style={{ color: '#cdd8ee' }}>Monitoreo público del proyecto</div>
            </div>
          </div>
        </div>
      </header>

      <main className="contenedor">
        {!proyecto.pesosValidos && (
          <div className="aviso">
            Nota: los pesos de las fases aún no suman 100 %, por lo que el avance global es aproximado.
          </div>
        )}
        <TarjetasIndicadores indicadores={indicadores} />

        <nav className="tabs">
          <button
            type="button"
            className={`tab ${pestana === 'resumen' ? 'activo' : ''}`}
            onClick={() => setPestana('resumen')}
          >
            Resumen por componente
          </button>
          <button
            type="button"
            className={`tab ${pestana === 'cronograma' ? 'activo' : ''}`}
            onClick={() => setPestana('cronograma')}
          >
            Cronograma (Gantt)
          </button>
        </nav>

        {pestana === 'resumen' && (
          <>
            <div className="selector-componentes">
              <button
                type="button"
                className={`chip ${faseId === 'todas' ? 'activo' : ''}`}
                onClick={() => setFaseId('todas')}
              >
                Todos los componentes
              </button>
              {proyecto.fases.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  className={`chip ${faseId === f.id ? 'activo' : ''}`}
                  onClick={() => setFaseId(f.id)}
                >
                  {f.nombre} · {redondear(f.avance)}%
                </button>
              ))}
            </div>
            <ListaFases fases={fasesFiltradas} />
          </>
        )}

        {pestana === 'cronograma' && <Gantt fases={proyecto.fases} />}
      </main>
    </>
  );
}
