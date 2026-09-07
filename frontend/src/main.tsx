import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App as DashboardPublico } from './App';
import { Guia as GuiaPublica } from './Guia';
import './estilos.css';
import './privado/estilos-privado.css';
import { ToastProvider } from './components/ToastProvider';
import { AuthProvider } from './privado/auth-contexto';
import { Login } from './privado/Login';
import { Activar } from './privado/Activar';
import { Restablecer } from './privado/Restablecer';
import { OlvidePassword } from './privado/OlvidePassword';
import { Layout } from './privado/Layout';
import { RutaProtegida } from './privado/RutaProtegida';
import { MisActividades } from './privado/paginas/MisActividades';
import { Guia } from './privado/paginas/Guia';
import { DetalleActividad } from './privado/paginas/DetalleActividad';
import { Usuarios } from './privado/paginas/admin/Usuarios';
import { Actividades } from './privado/paginas/admin/Actividades';
import { Componentes } from './privado/paginas/admin/Componentes';
import { LineaBase } from './privado/paginas/admin/LineaBase';
import { Alertas } from './privado/paginas/admin/Alertas';
import { Auditoria } from './privado/paginas/admin/Auditoria';
import { Actas } from './privado/paginas/admin/Actas';
import { ActaEditor } from './privado/paginas/admin/ActaEditor';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardPublico />} />
            <Route path="/guia" element={<GuiaPublica />} />
            <Route path="/login" element={<Login />} />
            <Route path="/activar" element={<Activar />} />
            <Route path="/restablecer" element={<Restablecer />} />
            <Route path="/olvide" element={<OlvidePassword />} />
            <Route
              path="/app"
              element={
                <RutaProtegida>
                  <Layout />
                </RutaProtegida>
              }
            >
              <Route index element={<MisActividades />} />
              <Route path="actividad/:id" element={<DetalleActividad />} />
              <Route path="guia" element={<Guia />} />
              <Route
                path="admin/componentes"
                element={
                  <RutaProtegida rol="administrador">
                    <Componentes />
                  </RutaProtegida>
                }
              />
              <Route
                path="admin/actividades"
                element={
                  <RutaProtegida rol="administrador">
                    <Actividades />
                  </RutaProtegida>
                }
              />
              <Route
                path="admin/usuarios"
                element={
                  <RutaProtegida rol="administrador">
                    <Usuarios />
                  </RutaProtegida>
                }
              />
              <Route
                path="admin/linea-base"
                element={
                  <RutaProtegida rol="administrador">
                    <LineaBase />
                  </RutaProtegida>
                }
              />
              <Route
                path="admin/alertas"
                element={
                  <RutaProtegida rol="administrador">
                    <Alertas />
                  </RutaProtegida>
                }
              />
              <Route
                path="admin/auditoria"
                element={
                  <RutaProtegida rol="administrador">
                    <Auditoria />
                  </RutaProtegida>
                }
              />
              <Route
                path="admin/actas"
                element={
                  <RutaProtegida rol="administrador">
                    <Actas />
                  </RutaProtegida>
                }
              />
              <Route
                path="admin/actas/:id"
                element={
                  <RutaProtegida rol="administrador">
                    <ActaEditor />
                  </RutaProtegida>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
);
