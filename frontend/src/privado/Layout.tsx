import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth-contexto';

export function Layout() {
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="barra-nav">
        <div className="contenedor nav-inner">
          <strong>PAC · Panel</strong>
          <nav className="nav-enlaces">
            <Link to="/app">Mis actividades</Link>
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
