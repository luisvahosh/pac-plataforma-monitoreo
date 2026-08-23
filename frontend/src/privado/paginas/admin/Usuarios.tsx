import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch, apiJson } from '../../api-cliente';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  estado: string;
  rol: { nombre: string };
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('colaborador');

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
      await apiJson('/api/usuarios', { method: 'POST', body: JSON.stringify({ nombre, email, rol }) });
      setNombre('');
      setEmail('');
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function desactivar(id: string) {
    await apiFetch(`/api/usuarios/${id}/desactivar`, { method: 'POST' });
    await cargar();
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
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.rol.nombre}</td>
              <td>{u.estado}</td>
              <td>
                {u.estado !== 'inactivo' && (
                  <button type="button" className="enlace" onClick={() => desactivar(u.id)}>
                    desactivar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
