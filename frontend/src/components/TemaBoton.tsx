import { Moon, Sun } from '@phosphor-icons/react';
import { useTema } from '../hooks/useTema';

export function TemaBoton({ className = 'tema-boton' }: { className?: string }) {
  const { esOscuro, alternar } = useTema();
  return (
    <button
      type="button"
      className={className}
      onClick={alternar}
      aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={esOscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      {esOscuro ? (
        <Sun size={18} weight="bold" aria-hidden="true" />
      ) : (
        <Moon size={18} weight="bold" aria-hidden="true" />
      )}
    </button>
  );
}
