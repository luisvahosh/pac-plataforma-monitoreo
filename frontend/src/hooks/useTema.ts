import { useCallback, useEffect, useState } from 'react';

export type Tema = 'claro' | 'oscuro';

const CLAVE = 'pac-tema';

function prefiereOscuroSistema(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function leerTemaGuardado(): Tema | null {
  try {
    const valor = localStorage.getItem(CLAVE);
    return valor === 'claro' || valor === 'oscuro' ? valor : null;
  } catch {
    // localStorage no disponible (modo privado, cuota agotada, etc.): se
    // sigue el esquema del sistema operativo sin persistir la elección.
    return null;
  }
}

function aplicarAtributo(tema: Tema | null) {
  if (typeof document === 'undefined') return;
  if (tema) {
    document.documentElement.setAttribute('data-tema', tema);
  } else {
    document.documentElement.removeAttribute('data-tema');
  }
}

/**
 * Modo oscuro manual: por defecto sigue `prefers-color-scheme` del sistema
 * (ver estilos.css), pero el usuario puede fijar una preferencia explícita
 * con `alternar()`, que se persiste en localStorage y gana sobre el
 * sistema hasta que la borre (no hay UI para "volver a automático" porque
 * un botón con 2 estados es más simple de usar que 3; alternar dos veces
 * desde cualquier punto de partida llega al mismo resultado que el
 * sistema si el usuario así lo prefiere).
 */
export function useTema() {
  const [temaGuardado, setTemaGuardado] = useState<Tema | null>(() => leerTemaGuardado());
  const [esOscuro, setEsOscuro] = useState<boolean>(() =>
    temaGuardado ? temaGuardado === 'oscuro' : prefiereOscuroSistema(),
  );

  useEffect(() => {
    aplicarAtributo(temaGuardado);
    setEsOscuro(temaGuardado ? temaGuardado === 'oscuro' : prefiereOscuroSistema());
  }, [temaGuardado]);

  useEffect(() => {
    if (temaGuardado) return; // el usuario ya eligió explícitamente; no seguir al sistema
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const escuchar = () => setEsOscuro(mq.matches);
    mq.addEventListener('change', escuchar);
    return () => mq.removeEventListener('change', escuchar);
  }, [temaGuardado]);

  const alternar = useCallback(() => {
    setTemaGuardado((actual) => {
      const efectivoActual = actual ?? (prefiereOscuroSistema() ? 'oscuro' : 'claro');
      const nuevo: Tema = efectivoActual === 'oscuro' ? 'claro' : 'oscuro';
      try {
        localStorage.setItem(CLAVE, nuevo);
      } catch {
        // El tema igual se aplica en esta sesión; solo no persiste.
      }
      return nuevo;
    });
  }, []);

  return { esOscuro, alternar };
}
