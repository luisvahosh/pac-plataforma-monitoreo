import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch, apiJson } from '../../api-cliente';
import { Dialogo } from '../../../components/Dialogo';
import { Modal } from '../../../components/Modal';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  celular: string | null;
  estado: string;
  rol: { nombre: string };
}

// Diálogo pendiente de mostrar: reemplaza window.alert()/window.confirm()
// (que no son accesibles ni consistentes visualmente) por un modal propio.
type DialogoPendiente =
  | { tipo: 'alerta'; titulo: string; mensaje: string }
  | {
      tipo: 'confirmar';
      titulo: string;
      mensaje: string;
      peligro?: boolean;
      onConfirmar: () => void;
    };

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [rol, setRol] = useState('colaborador');
  const [dialogo, setDialogo] = useState<DialogoPendiente | null>(null);

  // Edición en línea
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCelular, setEditCelular] = useState('');
  const [editRol, setEditRol] = useState('colaborador');

  async function cargar() {
    try {
      setUsuarios(await apiJson<Usuario[]>('/api/usuarios'));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void cargar();
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiJson('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({ nombre, email, rol, celular: celular || undefined }),
      });
      setNombre('');
      setEmail('');
      setCelular('');
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function desactivar(id: string) {
    await apiFetch(`/api/usuarios/${id}/desactivar`, { method: 'POST' });
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    try {
      await apiJson(`/api/usuarios/${id}/reactivar`, { method: 'POST' });
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function reenviarActivacion(u: Usuario) {
    setError(null);
    try {
      const r = await apiJson<{ mensaje: string }>(`/api/usuarios/${u.id}/reenviar-activacion`, {
        method: 'POST',
      });
      setDialogo({ tipo: 'alerta', titulo: 'Activación reenviada', mensaje: r.mensaje });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function pedirReiniciarActivacion(u: Usuario) {
    setError(null);
    setDialogo({
      tipo: 'confirmar',
      titulo: 'Reiniciar activación',
      mensaje:
        `¿Reiniciar la activación de "${u.nombre}"? Esto borra su contraseña y su 2FA actuales ` +
        '(dejará de poder iniciar sesión con lo que tenía) y le envía un enlace nuevo para configurar todo de cero.',
      peligro: true,
      onConfirmar: () => void reiniciarActivacion(u),
    });
  }

  async function reiniciarActivacion(u: Usuario) {
    setError(null);
    try {
      const r = await apiJson<{ mensaje: string }>(`/api/usuarios/${u.id}/reiniciar-activacion`, {
        method: 'POST',
      });
      setDialogo({ tipo: 'alerta', titulo: 'Activación reiniciada', mensaje: r.mensaje });
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function iniciarEdicion(u: Usuario) {
    setError(null);
    setEditandoId(u.id);
    setEditNombre(u.nombre);
    setEditEmail(u.email);
    setEditCelular(u.celular ?? '');
    setEditRol(u.rol.nombre);
  }

  function cancelarEdicion() {
    setEditandoId(null);
  }

  async function guardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!editandoId) return;
    setError(null);
    try {
      await apiJson(`/api/usuarios/${editandoId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nombre: editNombre,
          email: editEmail,
          rol: editRol,
          celular: editCelular || undefined,
        }),
      });
      setEditandoId(null);
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function pedirEliminar(u: Usuario) {
    setError(null);
    setDialogo({
      tipo: 'confirmar',
      titulo: 'Eliminar usuario',
      mensaje: `¿Eliminar definitivamente a "${u.nombre}" (${u.email})? Esta acción no se puede deshacer.`,
      peligro: true,
      onConfirmar: () => void eliminar(u),
    });
  }

  async function eliminar(u: Usuario) {
    setError(null);
    try {
      await apiJson(`/api/usuarios/${u.id}`, { method: 'DELETE' });
      await cargar();
    } catch (e) {
      // El backend rechaza el borrado (409) si el usuario tiene avances,
      // evidencias o cambios de línea base registrados (RN-14); en ese caso
      // el mensaje sugiere usar "desactivar" en su lugar.
      setError((e as Error).message);
    }
  }

  return (
    <section>
      <h2>Usuarios</h2>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={crear} className="form-inline">
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Celular
          <input
            type="tel"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="+57 300 000 0000"
          />
        </label>
        <label>
          Rol
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="colaborador">Colaborador</option>
            <option value="administrador">Administrador</option>
          </select>
        </label>
        <button type="submit">Crear (envía activación)</button>
      </form>

      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Celular</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.celular ?? <span className="tenue">—</span>}</td>
                <td>{u.rol.nombre}</td>
                <td>{u.estado}</td>
                <td>
                  <div className="acciones-tabla">
                    <button
                      type="button"
                      className="enlace"
                      onClick={() => iniciarEdicion(u)}
                      aria-label={`Editar a ${u.nombre}`}
                    >
                      editar
                    </button>
                    {u.estado === 'inactivo' && (
                      <button
                        type="button"
                        className="enlace"
                        onClick={() => void reactivar(u.id)}
                        aria-label={`Reactivar a ${u.nombre}`}
                      >
                        reactivar
                      </button>
                    )}
                    {u.estado !== 'inactivo' && (
                      <button
                        type="button"
                        className="enlace"
                        onClick={() => void desactivar(u.id)}
                        aria-label={`Desactivar a ${u.nombre}`}
                      >
                        desactivar
                      </button>
                    )}
                    {u.estado === 'pendiente_activacion' && (
                      <button
                        type="button"
                        className="enlace"
                        onClick={() => void reenviarActivacion(u)}
                        aria-label={`Reenviar activación a ${u.nombre}`}
                      >
                        reenviar activación
                      </button>
                    )}
                    <button
                      type="button"
                      className="enlace enlace-peligro"
                      onClick={() => pedirReiniciarActivacion(u)}
                      aria-label={`Reiniciar activación de ${u.nombre}`}
                    >
                      reiniciar activación
                    </button>
                    <button
                      type="button"
                      className="enlace enlace-peligro"
                      onClick={() => pedirEliminar(u)}
                      aria-label={`Eliminar a ${u.nombre}`}
                    >
                      eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal abierto={editandoId !== null} titulo="Editar usuario" onCerrar={cancelarEdicion}>
        <form onSubmit={guardarEdicion} className="form">
          <label>
            Nombre
            <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required />
          </label>
          <label>
            Correo
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Celular
            <input
              type="tel"
              value={editCelular}
              onChange={(e) => setEditCelular(e.target.value)}
              placeholder="+57 300 000 0000"
            />
          </label>
          <label>
            Rol
            <select value={editRol} onChange={(e) => setEditRol(e.target.value)}>
              <option value="colaborador">Colaborador</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>
          <div className="dialogo-acciones">
            <button type="button" className="boton-secundario" onClick={cancelarEdicion}>
              Cancelar
            </button>
            <button type="submit" className="boton-primario">
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <Dialogo
        abierto={dialogo !== null}
        titulo={dialogo?.titulo ?? ''}
        mensaje={dialogo?.mensaje ?? ''}
        tipo={dialogo?.tipo ?? 'alerta'}
        peligro={dialogo?.tipo === 'confirmar' ? dialogo.peligro : false}
        textoConfirmar="Confirmar"
        onConfirmar={dialogo?.tipo === 'confirmar' ? dialogo.onConfirmar : undefined}
        onCerrar={() => setDialogo(null)}
      />
    </section>
  );
}
