import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react';

type TipoToast = 'exito' | 'info' | 'error';

interface Toast {
  id: number;
  mensaje: string;
  tipo: TipoToast;
}

interface ToastContexto {
  mostrar: (mensaje: string, tipo?: TipoToast) => void;
}

const Contexto = createContext<ToastContexto | null>(null);

const ICONO: Record<TipoToast, typeof CheckCircle> = {
  exito: CheckCircle,
  info: Info,
  error: WarningCircle,
};

const DURACION_MS = 4500;

/**
 * Notificaciones no bloqueantes (a diferencia de <Dialogo>, que sí requiere
 * una decisión del usuario). Se anuncian a lectores de pantalla vía
 * aria-live, se autodescartan a los ~4.5s y también se pueden cerrar a mano.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const cerrar = useCallback((id: number) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (mensaje: string, tipo: TipoToast = 'exito') => {
      const id = Date.now() + Math.random();
      setToasts((actuales) => [...actuales, { id, mensaje, tipo }]);
      setTimeout(() => cerrar(id), DURACION_MS);
    },
    [cerrar],
  );

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      {createPortal(
        <div className="toasts-contenedor" aria-live="polite" aria-atomic="false">
          {toasts.map((t) => {
            const Icono = ICONO[t.tipo];
            return (
              <div className={`toast toast-${t.tipo}`} key={t.id} role="status">
                <Icono size={18} weight="bold" aria-hidden="true" />
                <span>{t.mensaje}</span>
                <button
                  type="button"
                  className="toast-cerrar"
                  onClick={() => cerrar(t.id)}
                  aria-label="Cerrar notificación"
                >
                  <X size={14} weight="bold" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </Contexto.Provider>
  );
}

export function useToast(): ToastContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
