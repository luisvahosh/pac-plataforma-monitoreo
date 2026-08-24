import { Link } from 'react-router-dom';

export function Ayuda() {
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
          <Link to="/">← Volver al tablero</Link>
        </p>

        <section className="fase">
          <h3>Qué muestra la página principal</h3>
          <ul>
            <li>
              <strong>Avance global</strong>: el círculo con el porcentaje en el encabezado azul, y
              debajo cinco indicadores — actividades totales, vencidas, en desviación crítica de
              cronograma, e hitos cumplidos.
            </li>
            <li>
              <strong>Dos pestañas</strong>: "Resumen por componente" (fases, actividades, hitos y
              tareas) y "Cronograma (Gantt)" (línea de tiempo completa).
            </li>
          </ul>
        </section>

        <section className="fase">
          <h3>Pestaña "Resumen por componente"</h3>
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
        </section>

        <section className="fase">
          <h3>Pestaña "Cronograma (Gantt)"</h3>
          <p>
            Cada fila es una actividad; la barra marca su periodo planeado y el relleno interno
            indica cuánto lleva de avance. Los colores son los mismos en todo el sitio: gris = no
            iniciada, azul = en tiempo, naranja = en riesgo, rojo = atrasada, verde = completada. La
            línea roja vertical marca la fecha de hoy. Pasa el cursor sobre una barra para ver el
            nombre completo, las fechas y el % exacto.
          </p>
        </section>

        <section className="fase">
          <h3>¿Eres parte del equipo consultor?</h3>
          <p>
            Usa el botón <strong>Acceso colaboradores</strong> en la esquina superior para iniciar
            sesión y reportar avances. Dentro de la plataforma encontrarás una guía propia para
            colaboradores y administradores.
          </p>
        </section>
      </main>
    </>
  );
}
