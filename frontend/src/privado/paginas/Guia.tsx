import type { ComponentType, ReactNode } from 'react';
import {
  ClipboardText,
  LockKey,
  Users,
  UsersThree,
  FolderOpen,
  CalendarCheck,
  Bell,
  EnvelopeSimple,
  type IconProps,
} from '@phosphor-icons/react';
import { useAuth } from '../auth-contexto';

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
    <div className="panel guia-panel" id={id}>
      <h3 className="guia-panel-titulo">
        <span className="guia-panel-icono">
          <Icono size={18} weight="bold" aria-hidden="true" />
        </span>
        {titulo}
      </h3>
      {children}
    </div>
  );
}

export function Guia() {
  const { esAdmin } = useAuth();

  return (
    <section>
      <h2>Guía</h2>
      <p className="tenue">Cómo usar el panel, según lo que necesites hacer.</p>

      <nav className="guia-nav" aria-label="Ir a una sección">
        <a href="#mis-actividades">Mis actividades y avances</a>
        <a href="#sesion">Iniciar sesión y recuperar acceso</a>
        {esAdmin && (
          <>
            <a href="#usuarios">Usuarios</a>
            <a href="#componentes">Componentes y responsabilidad</a>
            <a href="#actividades-responsables">Actividades y responsables</a>
            <a href="#linea-base">Línea base</a>
            <a href="#alertas-auditoria">Alertas y auditoría</a>
            <a href="#correos-provisionales">Correos provisionales</a>
          </>
        )}
      </nav>

      <div className="guia-grupo guia-grupo-colaborador">
        <span className="guia-grupo-rotulo">Para todos los colaboradores</span>

        <GuiaPanel icono={ClipboardText} titulo="Mis actividades y avances" id="mis-actividades">
          <ul className="lista-simple">
            <li>
              <strong>Mis actividades</strong> muestra los entregables en los que un administrador
              te asignó alguna actividad. Haz clic en uno para entrar al detalle y ver, dentro, las
              actividades específicas de las que eres responsable.
            </li>
            <li>
              <strong>Registrar avance</strong>: dentro de una actividad sin tareas puntuales,
              escribe el porcentaje (0–100) y, si quieres, una observación. Queda un historial
              completo con fecha y autor — nunca se borra, aunque el porcentaje baje.
            </li>
            <li>
              <strong>Actividades del entregable</strong>: cada entregable se desglosa en
              actividades específicas (con su etapa y peso). El avance del entregable no se reporta
              directo: se calcula solo, como la <strong>suma ponderada</strong> de sus actividades
              por su peso. Haz clic en "actualizar avance" junto a cada actividad para reportar su %
              y, si tienes, el enlace a la evidencia. "ver historial" muestra los reportes
              anteriores de esa actividad.
            </li>
            <li>
              <strong>Evidencias</strong>: en cada actividad puedes añadir un enlace (URL) que
              respalde el avance — a un documento en Drive, SharePoint, etc. No se suben archivos
              adjuntos, solo enlaces a donde ya vive el archivo real.
            </li>
          </ul>
        </GuiaPanel>

        <GuiaPanel icono={LockKey} titulo="Iniciar sesión y recuperar acceso" id="sesion">
          <ul className="lista-simple">
            <li>
              El código que pide el segundo paso del inicio de sesión lo genera la app{' '}
              <strong>Microsoft Authenticator</strong>, configurada al activar la cuenta.
            </li>
            <li>
              Si olvidaste tu contraseña, usa "¿Olvidaste tu contraseña?" en la pantalla de inicio
              de sesión.
            </li>
            <li>
              Si perdiste el celular con Microsoft Authenticator, no hay recuperación automática:
              pide a un administrador que te desactive y te vuelva a crear la cuenta para repetir la
              activación.
            </li>
          </ul>
        </GuiaPanel>
      </div>

      {esAdmin && (
        <div className="guia-grupo guia-grupo-admin">
          <span className="guia-grupo-rotulo">Solo administrador</span>

          <GuiaPanel icono={Users} titulo="Usuarios" id="usuarios">
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
          </GuiaPanel>

          <GuiaPanel icono={UsersThree} titulo="Componentes y responsabilidad" id="componentes">
            <p className="tenue">
              El modelo tiene <strong>dos niveles</strong> de asignación:
            </p>
            <ul className="lista-simple">
              <li>
                <strong>Componentes</strong> (esta página): la distribución porcentual de
                responsabilidad de cada componente entre sus colaboradores. La suma por componente
                debe ser <strong>100 %</strong>. Es informativa —el avance se calcula desde las
                actividades, no desde estos porcentajes— y sirve para ver quién participa en el
                componente y en qué proporción. Al incorporar un colaborador nuevo, reduce el % de
                otro(s) para seguir en 100 %.
              </li>
              <li>
                <strong>Actividades</strong>: el responsable concreto de cada actividad específica
                (ver el panel siguiente).
              </li>
            </ul>
          </GuiaPanel>

          <GuiaPanel
            icono={FolderOpen}
            titulo="Actividades y responsables"
            id="actividades-responsables"
          >
            <ul className="lista-simple">
              <li>
                En <strong>Actividades</strong> hay un formulario arriba para crear un entregable
                nuevo dentro de un componente. Debajo ves las 7 fases (Preparación + C1–C6) con sus
                entregables, sin necesitar ningún identificador de antemano.
              </li>
              <li>
                Cada entregable se completa a través de sus <strong>actividades específicas</strong>
                . El responsable se asigna en cada actividad, no en el entregable general: en el
                detalle, junto a cada actividad hay un botón "responsables" para agregar un
                colaborador con su peso (%). Si un entregable aún no tiene actividades, el
                formulario "Nueva subactividad" crea la primera (recuerda darle su peso).
              </li>
              <li>
                El avance del entregable es la <strong>suma ponderada</strong> de sus actividades
                por su peso (que suman 100 %: 85 % elaboración + 10 % revisión y aval + 5 % revisión
                final de la Secretaría). La suma de pesos de los responsables de una misma actividad
                no puede superar 100 %; la pantalla muestra la suma actual.
              </li>
              <li>
                El botón "editar" junto al título del entregable permite cambiar nombre, descripción
                y marcarlo como finalizado. Las fechas planeadas no se editan ahí — ver Línea base.
              </li>
            </ul>
          </GuiaPanel>

          <GuiaPanel icono={CalendarCheck} titulo="Línea base" id="linea-base">
            <p className="tenue">
              Las fechas de inicio/fin de una actividad, o la fecha objetivo de un hito, no se
              editan libremente: todo cambio queda registrado con quién lo hizo, cuándo y por qué,
              sin borrar el dato original. Entra a <strong>Línea base</strong>, elige la actividad
              de la lista (agrupada por componente), si el cambio es sobre la actividad o sobre uno
              de sus hitos, el campo a cambiar, la nueva fecha y una justificación (obligatoria).
              "Ver historial" muestra los cambios anteriores.
            </p>
          </GuiaPanel>

          <GuiaPanel icono={Bell} titulo="Alertas y auditoría" id="alertas-auditoria">
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
          </GuiaPanel>

          <GuiaPanel
            icono={EnvelopeSimple}
            titulo="Correos provisionales del equipo"
            id="correos-provisionales"
          >
            <p className="tenue">
              Si el equipo técnico cargó datos nuevos del proyecto, puede haber creado cuentas con
              correos provisionales (formato{' '}
              <code>nombre.apellido@centrodepensamientoitm.cloud</code>). Antes de que esas personas
              puedan activar su cuenta, entra a Usuarios y reemplaza cada correo provisional por el
              real (o usa "reiniciar activación" si ya intentaron activarla con el correo viejo).
            </p>
          </GuiaPanel>
        </div>
      )}
    </section>
  );
}
