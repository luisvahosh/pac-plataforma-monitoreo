import type { ComponentType } from 'react';
import type { IconProps } from '@phosphor-icons/react';

/** Estado vacío con icono + mensaje, en vez de una sola línea de texto suelta. */
export function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
}: {
  icono: ComponentType<IconProps>;
  titulo: string;
  descripcion?: string;
}) {
  return (
    <div className="estado-vacio">
      <Icono size={28} weight="regular" aria-hidden="true" />
      <p className="estado-vacio-titulo">{titulo}</p>
      {descripcion && <p className="estado-vacio-descripcion">{descripcion}</p>}
    </div>
  );
}
