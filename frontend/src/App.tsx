import { useEffect, useState } from 'react';
import { obtenerDashboard } from './api';
import type { DashboardResp } from './tipos';
import { Donut } from './components/Donut';
import { TarjetasIndicadores } from './components/TarjetasIndicadores';
import { ListaFases } from './components/ListaFases';

export function App() {
  const [data, setData] = useState<DashboardResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

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

  return (
    <>
      <header className="cabecera">
        <div className="contenedor">
          <div style={{ textAlign: 'right' }}>
            <a href="/login" style={{ color: '#cdd8ee', fontSize: '0.85rem' }}>
              Acceso colaboradores →
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
        <ListaFases fases={proyecto.fases} />
      </main>
    </>
  );
}
