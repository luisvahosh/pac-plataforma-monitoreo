import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal genérico y accesible (mismo estilo que Dialogo, pero con contenido
 * libre): portal, role="dialog" + aria-modal, foco inicial en el primer
 * control, trampa de foco (Tab/Shift+Tab), cierre con Escape o clic fuera, y
 * restauración del foco al cerrarse. Útil para formularios (p. ej. editar
 * usuario) que no deben quedar fuera de la vista dentro de una tabla ancha.
 */

const SELECTOR_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
}: {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        tabIndex={-1}
      >
        <h2 id="modal-titulo" className="dialogo-titulo">
          {titulo}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
