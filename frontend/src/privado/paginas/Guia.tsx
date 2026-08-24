import { useAuth } from '../auth-contexto';

export function Guia() {
  const { esAdmin } = useAuth();

  return (
    <section>
      <h2>Guía</h2>

      <div className="panel">
        <h3>Mis actividades y avances</h3>
        <ul className="lista-simple">
          <li>
            <strong>Mis actividades</strong> muestra las actividades que un administrador te asignó,
            con tu peso de trabajo en cada una. Haz clic en una para entrar al detalle.
          </li>
          <li>
            <strong>Registrar avance</strong>: dentro de una actividad sin tareas puntuales, escribe
            el porcentaje (0–100) y, si quieres, una observación. Queda un historial completo con
            fecha y autor — nunca se borra, aunque el porcentaje baje.
          </li>
          <li>
            <strong>Subactividades</strong>: si la actividad sí tiene tareas puntuales definidas, no
            hay formulario de avance directo — se calcula solo, como el promedio de esas tareas. Haz
            clic en "actualizar avance" junto a cada tarea para reportar su % y, si tienes, el
            enlace a la evidencia. "ver historial" muestra los reportes anteriores de esa tarea.
          </li>
          <li>
            <strong>Evidencias</strong>: en cada actividad puedes añadir un enlace (URL) que
            respalde el avance — a un documento en Drive, SharePoint, etc. No se suben archivos
            adjuntos, solo enlaces a donde ya vive el archivo real.
          </li>
        </ul>
      </div>

      <div className="panel">
        <h3>Iniciar sesión y recuperar acceso</h3>
        <ul className="lista-simple">
          <li>
            El código que pide el segundo paso del inicio de sesión lo genera la app{' '}
            <strong>Microsoft Authenticator</strong>, configurada al activar la cuenta.
          </li>
          <li>
            Si olvidaste tu contraseña, usa "¿Olvidaste tu contraseña?" en la pantalla de inicio de
            sesión.
          </li>
          <li>
            Si perdiste el celular con Microsoft Authenticator, no hay recuperación automática: pide
            a un administrador que te desactive y te vuelva a crear la cuenta para repetir la
            activación.
          </li>
        </ul>
      </div>

      {esAdmin && (
        <>
          <div className="panel">
            <h3>Administrador — Usuarios</h3>
            <ul className="lista-simple">
              <li>
                <strong>Crear</strong>: nombre, correo, celular (opcional) y rol. Al guardar se
                envía automáticamente el correo de activación.
              </li>
              <li>
                <strong>Editar</strong>: "editar" en la fila del usuario permite cambiar nombre,
                correo, celular y rol ahí mismo.
              </li>
              <li>
                <strong>Desactivar</strong> conserva todo el historial de esa persona (avances,
                evidencias) pero le revoca el acceso — es la opción recomendada para alguien que
                sale del equipo. <strong>Reactivar</strong> le devuelve el acceso con la misma
                contraseña y 2FA que tenía.
              </li>
              <li>
                <strong>Reiniciar activación</strong> borra la contraseña y el 2FA actuales y
                reenvía el enlace de activación, sin importar el estado de la cuenta — úsalo si
                alguien perdió su Microsoft Authenticator o hay que resetear credenciales por
                seguridad.
              </li>
              <li>
                <strong>Eliminar</strong> borra la cuenta por completo. Solo funciona si esa persona
                nunca registró avances, evidencias ni cambios de línea base; si los tiene, se
                rechaza y sugiere desactivar en su lugar, para no perder trazabilidad.
              </li>
            </ul>
          </div>

          <div className="panel">
            <h3>Administrador — Crear actividades y asignar responsables</h3>
            <ul className="lista-simple">
              <li>
                En <strong>Actividades</strong> hay un formulario arriba para crear una actividad
                nueva dentro de un componente. Debajo ves las 7 fases con sus actividades, sin
                necesitar ningún identificador de antemano.
              </li>
              <li>
                Cada actividad se completa a través de sus <strong>subactividades</strong> (las
                tareas puntuales). Los responsables se asignan ahí, no en la actividad general: en
                el detalle de la actividad, junto a cada subactividad hay un botón "responsables"
                para agregar un colaborador con su peso (%). Si una actividad todavía no tiene
                subactividades, hay un formulario "Nueva subactividad" para crear la primera.
              </li>
              <li>
                La suma de pesos de los responsables de una subactividad no puede superar 100 %; la
                pantalla muestra la suma actual.
              </li>
              <li>
                El botón "editar" junto al título de la actividad permite cambiar nombre,
                descripción y marcarla como finalizada. Las fechas planeadas no se editan ahí — ver
                Línea base.
              </li>
            </ul>
          </div>

          <div className="panel">
            <h3>Administrador — Línea base</h3>
            <p className="tenue">
              Las fechas de inicio/fin de una actividad, o la fecha objetivo de un hito, no se
              editan libremente: todo cambio queda registrado con quién lo hizo, cuándo y por qué,
              sin borrar el dato original. Entra a <strong>Línea base</strong>, elige la actividad
              de la lista (agrupada por componente), si el cambio es sobre la actividad o sobre uno
              de sus hitos, el campo a cambiar, la nueva fecha y una justificación (obligatoria).
              "Ver historial" muestra los cambios anteriores.
            </p>
          </div>

          <div className="panel">
            <h3>Administrador — Alertas y Auditoría</h3>
            <ul className="lista-simple">
              <li>
                <strong>Alertas</strong> define con cuántos días de anticipación se avisa por correo
                antes de que una actividad venza (revisión diaria automática a las 7 a. m.), con un
                botón "Evaluar ahora" para probarlo sin esperar, y muestra las últimas
                notificaciones realmente enviadas.
              </li>
              <li>
                <strong>Auditoría</strong> es un registro de solo lectura de qué se creó, editó o
                eliminó, por quién y cuándo — filtrable por tipo de entidad y de acción. No se puede
                modificar ni borrar desde ahí.
              </li>
            </ul>
          </div>

          <div className="panel">
            <h3>Correos provisionales del equipo</h3>
            <p className="tenue">
              Si el equipo técnico cargó datos nuevos del proyecto, puede haber creado cuentas con
              correos provisionales (formato{' '}
              <code>nombre.apellido@centrodepensamientoitm.cloud</code>). Antes de que esas personas
              puedan activar su cuenta, entra a Usuarios y reemplaza cada correo provisional por el
              real (o usa "reiniciar activación" si ya intentaron activarla con el correo viejo).
            </p>
          </div>
        </>
      )}
    </section>
  );
}
