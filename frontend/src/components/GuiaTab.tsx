import { useState, type ReactNode } from 'react';

export function GuiaTab({ children }: { children: ReactNode }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <div className="guia">
      <button type="button" className="guia-boton" onClick={() => setAbierta((v) => !v)}>
        <span className="guia-icono">i</span>
        {abierta ? 'Ocultar guía' : 'Guía: ¿qué estoy viendo?'}
      </button>
      {abierta && <div className="guia-caja">{children}</div>}
    </div>
  );
}
