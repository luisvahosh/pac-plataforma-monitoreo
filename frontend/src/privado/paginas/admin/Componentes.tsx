import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CheckCircle, UsersThree } from '@phosphor-icons/react';
import { apiFetch, apiJson } from '../../api-cliente';
import { Esqueleto } from '../../../components/Esqueleto';
import { EstadoVacio } from '../../../components/EstadoVacio';

interface Proyecto {
  id: string;
  nombre: string;
}
interface Fase {
  id: string;
  nombre: string;
  pesoPorcentaje: number;
  orden: number;
}
interface UsuarioLista {
  id: string;
  nombre: string;
  email: string;
}

/**
 * Distribución de responsabilidad por Componente (nivel 1 del modelo de dos
 * niveles): cada Componente reparte 100 % entre sus Colaboradores. Es
 * informativa (no altera el avance, que se deriva de las Actividades) y sirve
 * para ver de un vistazo quién participa en el Componente y en qué proporción.
 * Al incorporar un colaborador nuevo hay que reducir el peso de otro(s).
 */
export function Componentes() {
  const [fases, setFases] = useState<Fase[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const proyectos = await apiJson<Proyecto[]>('/api/proyectos');
      if (proyectos.length === 0) {
        setCargando(false);
        return;
      }
      const [listaFases, us] = await Promise.all([
        apiJson<Fase[]>(`/api/fases?proyectoId=${encodeURIComponent(proyectos[0].id)}`),
        apiJson<UsuarioLista[]>('/api/usuarios'),
      ]);
      setFases(listaFases);
      setUsuarios(us);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (cargando) {
    return (
      <section>
        <h2>Componentes</h2>
        <div role="status" aria-label="Cargando componentes">
          <span className="sr-solo">Cargando…</span>
          {[0, 1, 2].map((i) => (
            <div className="panel" key={i} aria-hidden="true">
              <Esqueleto ancho="45%" alto="1.15rem" />
              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                <Esqueleto ancho="70%" />
                <Esqueleto ancho="55%" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Componentes</h2>
      <p className="tenue">
        Distribución de responsabilidad de cada componente entre los colaboradores. La suma por
        componente debe ser 100 %. Es informativa: el avance se calcula a partir de las actividades,
        no de estos porcentajes.
      </p>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {fases.length === 0 && !error && (
        <EstadoVacio
          icono={UsersThree}
          titulo="No hay componentes todavía"
          descripcion="Cuando se publique el proyecto, aquí aparecerán sus componentes."
        />
      )}
      {fases.map((fase) => (
        <DistribucionComponente key={fase.id} fase={fase} usuarios={usuarios} />
      ))}
    </section>
  );
}

interface AsignacionComponenteItem {
  id: string;
  pesoPorcentaje: number;
  usuario: { id: string; nombre: string; email: string };
}
interface RespComponente {
  asignaciones: AsignacionComponenteItem[];
  sumaPesos: number;
  pesosValidos: boolean;
}

function DistribucionComponente({ fase, usuarios }: { fase: Fase; usuarios: UsuarioLista[] }) {
  const [datos, setDatos] = useState<RespComponente | null>(null);
  const [usuarioId, setUsuarioId] = useState('');
  const [peso, setPeso] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setDatos(await apiJson<RespComponente>(`/api/fases/${fase.id}/asignaciones-componente`));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [fase.id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function asignar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiJson(`/api/fases/${fase.id}/asignaciones-componente`, {
        method: 'POST',
        body: JSON.stringify({ usuarioId, pesoPorcentaje: Number(peso) }),
      });
      setUsuarioId('');
      setPeso('');
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function quitar(asignacionId: string) {
    await apiFetch(`/api/fases/${fase.id}/asignaciones-componente/${asignacionId}`, {
      method: 'DELETE',
    });
    await cargar();
  }

  return (
    <div className="panel">
      <h3>
        {fase.nombre} <span className="tenue">— peso {Math.round(fase.pesoPorcentaje)}%</span>
      </h3>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {datos && (
        <p className="tenue">
          Suma de participación: {Math.round(datos.sumaPesos)}%{' '}
          {datos.pesosValidos ? (
            <CheckCircle
              size={13}
              weight="bold"
              color="var(--finalizada)"
              aria-label="Suma correcta"
            />
          ) : (
            '(debe ser 100%)'
          )}
        </p>
      )}
      <ul className="lista-simple">
        {datos?.asignaciones.map((a) => (
          <li key={a.id}>
            {a.usuario.nombre} — {a.pesoPorcentaje.toFixed(2).replace(/\.00$/, '')}%
            <button type="button" className="enlace" onClick={() => quitar(a.id)}>
              quitar
            </button>
          </li>
        ))}
        {datos?.asignaciones.length === 0 && (
          <li className="tenue">Sin colaboradores asignados aún.</li>
        )}
      </ul>
      <form onSubmit={asignar} className="form-inline">
        <label>
          Colaborador
          <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} required>
            <option value="">—</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.email})
              </option>
            ))}
          </select>
        </label>
        <label>
          Participación %
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            required
          />
        </label>
        <button type="submit">Asignar / actualizar</button>
      </form>
    </div>
  );
}
