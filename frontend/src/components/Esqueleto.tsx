import type { HTMLAttributes } from 'react';

/** Placeholder de carga con efecto de brillo (respeta prefers-reduced-motion vía CSS). */
export function Esqueleto({
  ancho = '100%',
  alto = '1rem',
  radio,
  className = '',
  style,
  ...resto
}: {
  ancho?: string;
  alto?: string;
  radio?: string;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`esqueleto ${className}`}
      style={{ width: ancho, height: alto, borderRadius: radio, ...style }}
      aria-hidden="true"
      {...resto}
    />
  );
}
