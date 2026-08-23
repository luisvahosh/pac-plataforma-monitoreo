import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './auth-contexto';

export function RutaProtegida({ children, rol }: { children: ReactNode; rol?: string }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (rol && usuario.rol !== rol) {
    return (
      <div className="contenedor">
        <p>No tienes permiso para ver esta sección.</p>
      </div>
    );
  }
  return <>{children}</>;
}
