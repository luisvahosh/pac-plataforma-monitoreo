import { useState, type ReactNode } from 'react';
import { Info } from '@phosphor-icons/react';

export function GuiaTab({ children }: { children: ReactNode }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <div className="guia">
      <button
        type="button"
        className="guia-boton"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
      >
        <span className="guia-icono">
          <Info size={11} weight="bold" aria-hidden="true" />
        </span>
        {abierta ? 'Ocultar guía' : 'Guía: ¿qué estoy viendo?'}
      </button>
      {abierta && <div className="guia-caja">{children}</div>}
    </div>
  );
}
