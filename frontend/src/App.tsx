import { useEffect, useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { obtenerDashboard, redondear } from './api';
import type { DashboardResp } from './tipos';
import { Donut } from './components/Donut';
import { TarjetasIndicadores } from './components/TarjetasIndicadores';
import { ListaFases } from './components/ListaFases';
import { Gantt } from './components/Gantt';
import { ActividadesBitacora } from './components/ActividadesBitacora';
import { AlertasPublicas } from './components/AlertasPublicas';
import { EjecutarPlan } from './components/EjecutarPlan/EjecutarPlan';
import { GuiaTab } from './components/GuiaTab';
import { Esqueleto } from './components/Esqueleto';
import { TemaBoton } from './components/TemaBoton';
import { useAuth } from './privado/auth-contexto';

type Pestana = 'ejecutar' | 'resumen' | 'cronograma' | 'actividades' | 'alertas';

export function App() {
  const { usuario, logout } = useAuth();
  const [data, setData] = useState<DashboardResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pestana, setPestana] = useState<Pestana>('ejecutar');
  const [faseId, setFaseId] = useState<string>('todas');

  useEffect(() => {
    obtenerDashboard()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <>
        <header className="cabecera">
          <div className="contenedor" role="status" aria-label="Cargando el estado del proyecto">
            <span className="sr-solo">Cargando el estado del proyecto…</span>
            <Esqueleto
              ancho="55%"
              alto="1.6rem"
              className="esqueleto-en-cabecera"
              aria-hidden="true"
            />
            <Esqueleto
              ancho="80%"
              alto="1rem"
              className="esqueleto-en-cabecera"
              aria-hidden="true"
            />
            <div className="resumen" aria-hidden="true">
              <Esqueleto
                ancho="120px"
                alto="120px"
                radio="999px"
                className="esqueleto-en-cabecera"
              />
              <Esqueleto ancho="160px" alto="1.1rem" className="esqueleto-en-cabecera" />
            </div>
          </div>
        </header>
        <main className="contenedor" aria-hidden="true">
          <div className="kpis">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="kpi" key={i}>
                <Esqueleto ancho="50%" alto="1.8rem" />
                <Esqueleto
                  ancho="80%"
                  alto="0.85rem"
                  className="esqueleto-fila"
                  style={{ marginTop: '0.4rem' }}
                />
              </div>
            ))}
          </div>
          {[0, 1].map((i) => (
            <div className="fase" key={i}>
              <Esqueleto ancho="35%" alto="1.15rem" />
              <Esqueleto ancho="100%" alto="10px" radio="999px" style={{ marginTop: '0.75rem' }} />
              <div className="actividad" style={{ marginTop: '1rem' }}>
                <Esqueleto ancho="60%" alto="1rem" />
                <Esqueleto ancho="100%" alto="10px" radio="999px" style={{ marginTop: '0.5rem' }} />
              </div>
            </div>
          ))}
        </main>
      </>
    );
  }
  if (error) {
    return (
      <div className="estado-error" role="alert">
        No se pudo cargar el dashboard: {error}
      </div>
    );
  }
  if (!data || !data.proyecto || !data.indicadores) {
    return <div className="estado-carga">Aún no hay un proyecto publicado.</div>;
  }

  const { proyecto, indicadores } = data;
  const fasesFiltradas =
    faseId === 'todas' ? proyecto.fases : proyecto.fases.filter((f) => f.id === faseId);

  const pestanas: { id: Pestana; etiqueta: string }[] = [
    { id: 'ejecutar', etiqueta: 'Ejecutar Plan' },
    { id: 'resumen', etiqueta: 'Resumen por componente' },
    { id: 'cronograma', etiqueta: 'Cronograma (Gantt)' },
    { id: 'actividades', etiqueta: 'Actividades' },
    { id: 'alertas', etiqueta: 'Alertas' },
  ];

  return (
    <>
      <header className="cabecera">
        <div className="contenedor">
          <div className="cabecera-acciones">
            <TemaBoton className="tema-boton tema-boton-cabecera" />
            <a href="/guia" className="enlace-guia">
              Guía
            </a>
            {usuario ? (
              <>
                <button type="button" className="enlace-guia enlace-guia-boton" onClick={logout}>
                  Cerrar sesión
                </button>
                <a href="/app" className="boton-acceso">
                  Ir a mi panel
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </a>
              </>
            ) : (
              <a href="/login" className="boton-acceso">
                Acceso colaboradores
                <ArrowRight size={14} weight="bold" aria-hidden="true" />
              </a>
            )}
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
            Nota: los pesos de las fases aún no suman 100 %, por lo que el avance global es
            aproximado.
          </div>
        )}
        <TarjetasIndicadores indicadores={indicadores} />

        <nav className="tabs">
          {pestanas.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`tab ${pestana === p.id ? 'activo' : ''}`}
              onClick={() => setPestana(p.id)}
            >
              {p.etiqueta}
            </button>
          ))}
        </nav>

        {pestana === 'ejecutar' && (
          <GuiaTab>
            <h4>Qué estás viendo</h4>
            <p>
              El tablero ejecutivo del proyecto: responde en menos de un minuto cómo va, si vamos
              adelantados o atrasados, qué entregables e hitos requieren atención, quién concentra
              la carga y si hay evidencia de lo ejecutado. Usa los filtros para acotar por
              componente, estado, colaborador o período; haz clic en la torta de estados o en un
              colaborador para profundizar.
            </p>
          </GuiaTab>
        )}
        {pestana === 'resumen' && (
          <GuiaTab>
            <h4>Qué estás viendo</h4>
            <p>
              El componente seleccionado arriba (o los 7, con "Todos los componentes"), con sus
              entregables, hitos y las actividades específicas de cada entregable.
            </p>
            <h4>Dos indicadores por actividad, no uno</h4>
            <ul>
              <li>
                <strong>Estado por fecha límite</strong> (a la derecha): pendiente, en ejecución,
                próxima a vencer, vencida o finalizada.
              </li>
              <li>
                <strong>Desviación de cronograma</strong> (debajo de las fechas): compara el avance
                real contra el esperado a hoy. Responde "¿vamos al ritmo planeado?", una pregunta
                distinta a "¿ya se venció?".
              </li>
            </ul>
          </GuiaTab>
        )}
        {pestana === 'cronograma' && (
          <GuiaTab>
            <h4>Qué estás viendo</h4>
            <p>
              La línea de tiempo completa del proyecto. Cada fila es una actividad; la barra marca
              su periodo planeado y el relleno interno cuánto lleva de avance.
            </p>
            <h4>Colores</h4>
            <p>
              Gris = no iniciada · Azul = en tiempo · Naranja = en riesgo · Rojo = atrasada · Verde
              = completada.
            </p>
            <p>La línea roja vertical marca la fecha de hoy.</p>
          </GuiaTab>
        )}
        {pestana === 'actividades' && (
          <GuiaTab>
            <h4>Qué estás viendo</h4>
            <p>
              Una bitácora: cada entregable (o cada una de sus actividades específicas) con el
              historial completo de sus reportes de avance — porcentaje, fecha, quién lo registró y
              su observación en texto libre. Haz clic en un entregable para desplegar su historial.
            </p>
            <h4>El enlace de evidencia</h4>
            <p>
              Está siempre protegido: solo aparece un botón "ver evidencia" si iniciaste sesión, y
              solo si tienes acceso a esa actividad.
            </p>
          </GuiaTab>
        )}
        {pestana === 'alertas' && (
          <GuiaTab>
            <h4>Qué estás viendo</h4>
            <p>
              Las actividades que están pendientes de atención según su fecha, agrupadas en cuatro
              niveles:
            </p>
            <ul>
              <li>
                <strong>Vencidas</strong>: ya pasó su fecha límite planeada y no está finalizada.
              </li>
              <li>
                <strong>Próximas a vencer</strong>: se acercan a su fecha límite.
              </li>
              <li>
                <strong>Atrasadas por cronograma</strong>: el avance real está muy por debajo del
                esperado a hoy, aunque su fecha límite todavía no haya llegado.
              </li>
              <li>
                <strong>En riesgo por cronograma</strong>: señal temprana de lo anterior.
              </li>
            </ul>
          </GuiaTab>
        )}

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

        {pestana === 'ejecutar' && <EjecutarPlan proyecto={proyecto} />}

        {pestana === 'cronograma' && <Gantt fases={proyecto.fases} />}

        {pestana === 'actividades' && (
          <ActividadesBitacora fases={proyecto.fases} estaLogueado={!!usuario} />
        )}

        {pestana === 'alertas' && <AlertasPublicas fases={proyecto.fases} />}
      </main>
    </>
  );
}
