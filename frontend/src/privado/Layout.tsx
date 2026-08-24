import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';
import { useAuth } from './auth-contexto';

export function Layout() {
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function salir() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="barra-nav">
        <div className="contenedor nav-inner">
          <div className="nav-marca">
            <strong>PAC · Panel</strong>
            <button
              type="button"
              className="nav-menu-boton"
              aria-expanded={menuAbierto}
              aria-controls="nav-enlaces"
              onClick={() => setMenuAbierto((v) => !v)}
            >
              {menuAbierto ? (
                <X size={20} weight="bold" aria-hidden="true" />
              ) : (
                <List size={20} weight="bold" aria-hidden="true" />
              )}
              <span className="sr-solo">{menuAbierto ? 'Cerrar menú' : 'Abrir menú'}</span>
            </button>
          </div>
          <nav
            className={`nav-enlaces ${menuAbierto ? 'abierto' : ''}`}
            id="nav-enlaces"
            onClick={() => setMenuAbierto(false)}
          >
            <Link to="/app">Mis actividades</Link>
            <Link to="/app/guia">Guía</Link>
            {esAdmin && (
              <>
                <Link to="/app/admin/actividades">Actividades</Link>
                <Link to="/app/admin/usuarios">Usuarios</Link>
                <Link to="/app/admin/linea-base">Línea base</Link>
                <Link to="/app/admin/alertas">Alertas</Link>
                <Link to="/app/admin/auditoria">Auditoría</Link>
              </>
            )}
          </nav>
          <span className="nav-usuario">
            {usuario?.email}
            <button type="button" onClick={salir}>
              Salir
            </button>
          </span>
        </div>
      </header>
      <main className="contenedor">
        <Outlet />
      </main>
    </>
  );
}
