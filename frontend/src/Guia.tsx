import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Gauge,
  SquaresFour,
  ChartBar,
  ClipboardText,
  Bell,
  SignIn,
  type IconProps,
} from '@phosphor-icons/react';

function GuiaPanel({
  icono: Icono,
  titulo,
  id,
  children,
}: {
  icono: ComponentType<IconProps>;
  titulo: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <section className="panel guia-panel" id={id}>
      <h3 className="guia-panel-titulo">
        <span className="guia-panel-icono">
          <Icono size={18} weight="bold" aria-hidden="true" />
        </span>
        {titulo}
      </h3>
      {children}
    </section>
  );
}

export function Guia() {
  return (
    <>
      <header className="cabecera">
        <div className="contenedor">
          <h1>Cómo leer este tablero</h1>
          <p>Guía rápida del tablero público del Plan de Acción Climática de Medellín.</p>
        </div>
      </header>

      <main className="contenedor">
        <p>
          <Link to="/" className="enlace-volver">
            <ArrowLeft size={14} weight="bold" aria-hidden="true" />
            Volver al tablero
          </Link>
        </p>

        <nav className="guia-nav" aria-label="Ir a una sección">
          <a href="#que-muestra">Qué muestra la página principal</a>
          <a href="#resumen">Resumen por componente</a>
          <a href="#gantt">Cronograma (Gantt)</a>
          <a href="#actividades">Actividades</a>
          <a href="#alertas">Alertas</a>
          <a href="#equipo">¿Eres del equipo consultor?</a>
        </nav>

        <GuiaPanel icono={Gauge} titulo="Qué muestra la página principal" id="que-muestra">
          <ul>
            <li>
              <strong>Avance global</strong>: el círculo con el porcentaje en el encabezado azul, y
              debajo cinco indicadores — actividades totales, vencidas, en desviación crítica de
              cronograma, e hitos cumplidos.
            </li>
            <li>
              <strong>Cuatro pestañas</strong>: "Resumen por componente", "Cronograma (Gantt)",
              "Actividades" y "Alertas". Cada una tiene su propio botón "Guía" que explica qué estás
              viendo.
            </li>
          </ul>
        </GuiaPanel>

        <GuiaPanel icono={SquaresFour} titulo='Pestaña "Resumen por componente"' id="resumen">
          <p>
            Arriba hay un selector para ver un componente (C1 a C6) a la vez, en vez de desplazarte
            por los 7. Cada actividad muestra dos indicadores distintos, uno junto al otro:
          </p>
          <ul>
            <li>
              <strong>Estado por fecha límite</strong>, a la derecha del nombre:{' '}
              <span className="badge pendiente">PENDIENTE</span>{' '}
              <span className="badge en_ejecucion">EN EJECUCIÓN</span>{' '}
              <span className="badge proxima_a_vencer">PRÓXIMA A VENCER</span>{' '}
              <span className="badge vencida">VENCIDA</span>{' '}
              <span className="badge finalizada">FINALIZADA</span>
            </li>
            <li>
              <strong>Desviación de cronograma</strong>, debajo de las fechas: compara el avance
              real contra el avance esperado a la fecha de hoy (sin_iniciar, en_tiempo, en_riesgo,
              atrasada, completada). Es una pregunta distinta a la anterior: "¿vamos al ritmo
              planeado?", no "¿ya se venció?".
            </li>
          </ul>
          <p>
            Si la actividad tiene tareas específicas definidas (algunos de los 18 entregables las
            traen desglosadas), aparecen listadas debajo con su propia barra de avance.
          </p>
        </GuiaPanel>

        <GuiaPanel icono={ChartBar} titulo='Pestaña "Cronograma (Gantt)"' id="gantt">
          <p>
            Cada fila es una actividad; la barra marca su periodo planeado y el relleno interno
            indica cuánto lleva de avance. Los colores son los mismos en todo el sitio: gris = no
            iniciada, azul = en tiempo, naranja = en riesgo, rojo = atrasada, verde = completada. La
            línea roja vertical marca la fecha de hoy. Pasa el cursor sobre una barra para ver el
            nombre completo, las fechas y el % exacto.
          </p>
        </GuiaPanel>

        <GuiaPanel icono={ClipboardText} titulo='Pestaña "Actividades"' id="actividades">
          <p>
            La bitácora del proyecto: cada actividad (o cada tarea puntual, si las tiene) con el
            historial completo de sus reportes de avance — porcentaje, fecha, quién lo registró y su
            observación en texto libre. Haz clic en una actividad para desplegar su historial. El
            enlace de evidencia de cada reporte solo aparece (botón "ver evidencia") si iniciaste
            sesión y tienes acceso a esa actividad — nunca es visible sin iniciar sesión.
          </p>
        </GuiaPanel>

        <GuiaPanel icono={Bell} titulo='Pestaña "Alertas"' id="alertas">
          <p>
            Las actividades que están pendientes de atención según su fecha, agrupadas en cuatro
            niveles: <strong>vencidas</strong> (ya pasó su fecha límite y no está finalizada),{' '}
            <strong>próximas a vencer</strong>, <strong>atrasadas por cronograma</strong> (el avance
            real está muy por debajo del esperado a hoy, aunque la fecha límite aún no haya llegado)
            y <strong>en riesgo por cronograma</strong> (señal temprana de lo anterior).
          </p>
        </GuiaPanel>

        <GuiaPanel icono={SignIn} titulo="¿Eres parte del equipo consultor?" id="equipo">
          <p>
            Usa el botón <strong>Acceso colaboradores</strong> en la esquina superior para iniciar
            sesión y reportar avances. Dentro de la plataforma encontrarás una guía propia para
            colaboradores y administradores.
          </p>
        </GuiaPanel>
      </main>
    </>
  );
}
