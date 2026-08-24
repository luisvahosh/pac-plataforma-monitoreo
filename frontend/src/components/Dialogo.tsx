import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Diálogo modal accesible, reutilizable para reemplazar `window.alert()` y
 * `window.confirm()`:
 * - role="alertdialog" + aria-modal, foco inicial en el primer control,
 *   trampa de foco (Tab/Shift+Tab) y cierre con Escape (RN a11y §1).
 * - Restaura el foco al elemento que abrió el diálogo al cerrarse.
 */

type TipoDialogo = 'confirmar' | 'alerta';

type PropsDialogo = {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  tipo?: TipoDialogo;
  peligro?: boolean;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar?: () => void;
  onCerrar: () => void;
};

const SELECTOR_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialogo({
  abierto,
  titulo,
  mensaje,
  tipo = 'confirmar',
  peligro = false,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCerrar,
}: PropsDialogo) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const disparadorPrevio = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!abierto) return;

    disparadorPrevio.current = document.activeElement as HTMLElement | null;
    const caja = cajaRef.current;
    const primerFocable = caja?.querySelector<HTMLElement>(SELECTOR_FOCUSABLE);
    (primerFocable ?? caja)?.focus();

    function alTeclado(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCerrar();
        return;
      }
      if (e.key !== 'Tab' || !caja) return;
      const focables = Array.from(caja.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE));
      if (focables.length === 0) return;
      const primero = focables[0];
      const ultimo = focables[focables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener('keydown', alTeclado);
    return () => {
      document.removeEventListener('keydown', alTeclado);
      disparadorPrevio.current?.focus();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div
      className="dialogo-fondo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        className="dialogo-caja"
        ref={cajaRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        aria-describedby="dialogo-mensaje"
        tabIndex={-1}
      >
        <h2 id="dialogo-titulo" className="dialogo-titulo">
          {titulo}
        </h2>
        <p id="dialogo-mensaje" className="dialogo-mensaje">
          {mensaje}
        </p>
        <div className="dialogo-acciones">
          {tipo === 'confirmar' && (
            <button type="button" className="boton-secundario" onClick={onCerrar}>
              {textoCancelar}
            </button>
          )}
          <button
            type="button"
            className={peligro ? 'boton-peligro' : 'boton-primario'}
            onClick={() => {
              if (tipo === 'confirmar') onConfirmar?.();
              onCerrar();
            }}
          >
            {tipo === 'confirmar' ? textoConfirmar : 'Entendido'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
