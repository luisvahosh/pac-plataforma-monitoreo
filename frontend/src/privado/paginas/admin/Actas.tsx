import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardText } from '@phosphor-icons/react';
import { apiJson } from '../../api-cliente';
import { Esqueleto } from '../../../components/Esqueleto';
import { EstadoVacio } from '../../../components/EstadoVacio';

interface ActaResumen {
  id: string;
  numero: number;
  fecha: string;
  tema: string | null;
  estado: string;
  tareas: number;
}

export function Actas() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ActaResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setItems(await apiJson<ActaResumen[]>('/api/actas'));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function nuevaActa() {
    setError(null);
    setCreando(true);
    try {
      const acta = await apiJson<{ id: string }>('/api/actas', { method: 'POST' });
      navigate(`/app/admin/actas/${acta.id}`);
    } catch (e) {
      setError((e as Error).message);
      setCreando(false);
    }
  }

  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <h2>Gestión de Actas</h2>
        <button type="button" onClick={nuevaActa} disabled={creando}>
          {creando ? 'Creando…' : '+ Nueva acta'}
        </button>
      </div>
      <p className="tenue">
        Documenta las reuniones de seguimiento. Cada acta parte del estado actual del proyecto y del
        acta anterior; desde ella se crean subactividades, tareas y riesgos que quedan integrados al
        seguimiento.
      </p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {!items && !error && (
        <div className="panel" role="status" aria-label="Cargando actas">
          <span className="sr-solo">Cargando…</span>
          <Esqueleto ancho="60%" alto="1.05rem" />
          <Esqueleto ancho="100%" alto="1rem" style={{ marginTop: '0.75rem' }} />
        </div>
      )}

      {items && items.length === 0 && (
        <EstadoVacio
          icono={ClipboardText}
          titulo="Aún no hay actas"
          descripcion="Crea la primera acta con «+ Nueva acta»."
        />
      )}

      {items && items.length > 0 && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Tema</th>
              <th>Estado</th>
              <th>Tareas</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link to={`/app/admin/actas/${a.id}`}>
                    Acta {String(a.numero).padStart(2, '0')}
                  </Link>
                </td>
                <td>{new Date(a.fecha).toLocaleDateString('es-CO')}</td>
                <td>{a.tema ?? '—'}</td>
                <td>
                  <span className={`chip ${a.estado === 'enviada' ? 'activo' : ''}`}>
                    {a.estado}
                  </span>
                </td>
                <td>{a.tareas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
