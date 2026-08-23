import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch, apiJson } from '../../api-cliente';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  celular: string | null;
  estado: string;
  rol: { nombre: string };
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [rol, setRol] = useState('colaborador');

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

  async function guardarEdicion(id: string) {
    setError(null);
    try {
      await apiJson(`/api/usuarios/${id}`, {
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

  async function eliminar(u: Usuario) {
    setError(null);
    if (!window.confirm(`¿Eliminar definitivamente a "${u.nombre}" (${u.email})? Esta acción no se puede deshacer.`)) {
      return;
    }
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
      {error && <div className="form-error">{error}</div>}

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
          {usuarios.map((u) =>
            editandoId === u.id ? (
              <tr key={u.id}>
                <td>
                  <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                </td>
                <td>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </td>
                <td>
                  <input
                    type="tel"
                    value={editCelular}
                    onChange={(e) => setEditCelular(e.target.value)}
                    placeholder="+57 300 000 0000"
                  />
                </td>
                <td>
                  <select value={editRol} onChange={(e) => setEditRol(e.target.value)}>
                    <option value="colaborador">Colaborador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </td>
                <td>{u.estado}</td>
                <td>
                  <button type="button" className="enlace" onClick={() => guardarEdicion(u.id)}>
                    guardar
                  </button>{' '}
                  <button type="button" className="enlace" onClick={cancelarEdicion}>
                    cancelar
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.celular ?? <span className="tenue">—</span>}</td>
                <td>{u.rol.nombre}</td>
                <td>{u.estado}</td>
                <td>
                  <button type="button" className="enlace" onClick={() => iniciarEdicion(u)}>
                    editar
                  </button>{' '}
                  {u.estado !== 'inactivo' && (
                    <>
                      <button type="button" className="enlace" onClick={() => desactivar(u.id)}>
                        desactivar
                      </button>{' '}
                    </>
                  )}
                  <button type="button" className="enlace enlace-peligro" onClick={() => eliminar(u)}>
                    eliminar
                  </button>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </section>
  );
}
