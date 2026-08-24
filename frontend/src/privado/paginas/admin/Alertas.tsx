import { useEffect, useState, type FormEvent } from 'react';
import { apiJson } from '../../api-cliente';

interface Regla {
  id: string;
  diasAnticipacion: number[];
  activo: boolean;
}
interface NotificacionEnviada {
  id: string;
  tipo: string;
  usuarioId: string | null;
  entidadTipo: string | null;
  entidadId: string | null;
  umbralDias: number | null;
  fechaHora: string;
}

const ETIQUETA_TIPO: Record<string, string> = {
  proxima_a_vencer: 'Próxima a vencer',
  vencida: 'Vencida',
  activacion: 'Activación de cuenta',
  recuperacion: 'Recuperación de contraseña',
  confirmacion_avance: 'Confirmación de avance',
  cambio_importante: 'Cambio importante',
};

export function Alertas() {
  const [dias, setDias] = useState('');
  const [activo, setActivo] = useState(true);
  const [enviadas, setEnviadas] = useState<NotificacionEnviada[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [evaluando, setEvaluando] = useState(false);

  async function cargar() {
    try {
      const [r, env] = await Promise.all([
        apiJson<Regla>('/api/reglas-alerta'),
        apiJson<NotificacionEnviada[]>('/api/notificaciones/enviadas'),
      ]);
      setDias(r.diasAnticipacion.join(', '));
      setActivo(r.activo);
      setEnviadas(env);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const diasAnticipacion = dias
      .split(',')
      .map((d) => Number(d.trim()))
      .filter((d) => !Number.isNaN(d));
    try {
      await apiJson('/api/reglas-alerta', {
        method: 'PUT',
        body: JSON.stringify({ diasAnticipacion, activo }),
      });
      setOk('Configuración de alertas guardada.');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function evaluarAhora() {
    setError(null);
    setOk(null);
    setEvaluando(true);
    try {
      const r = await apiJson<{ actividades: number; enviadas: number }>('/api/notificaciones/evaluar', {
        method: 'POST',
      });
      setOk(
        `Revisadas ${r.actividades} actividades sin finalizar; se enviaron ${r.enviadas} correos de alerta ` +
          `(no se reenvía dos veces el mismo aviso a la misma persona).`,
      );
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEvaluando(false);
    }
  }

  return (
    <section>
      <h2>Alertas de vencimiento</h2>
      <p className="tenue">
        Todos los días a las 7:00 a. m., la plataforma revisa las actividades sin finalizar y envía
        un correo a cada colaborador asignado cuando faltan exactamente los días configurados abajo
        para su fecha límite planeada (por ejemplo, con "7, 3, 1" avisa a los 7 días, a los 3 y el
        último día). Si ya venció, envía un aviso de "vencida" en su lugar. Cada aviso se envía una
        sola vez por persona.
      </p>
      {error && <div className="form-error">{error}</div>}
      {ok && <div className="form-ok">{ok}</div>}

      <form onSubmit={guardar} className="form">
        <label>
          Días de anticipación (separados por coma)
          <input value={dias} onChange={(e) => setDias(e.target.value)} placeholder="7, 3, 1" />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          Alertas activas
        </label>
        <div className="acciones">
          <button type="submit">Guardar</button>
          <button type="button" onClick={evaluarAhora} disabled={evaluando}>
            {evaluando ? 'Evaluando…' : 'Evaluar ahora (sin esperar a las 7 a. m.)'}
          </button>
        </div>
      </form>

      <h3>Últimas notificaciones enviadas</h3>
      <table className="tabla">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Días de anticipación</th>
            <th>Fecha de envío</th>
          </tr>
        </thead>
        <tbody>
          {enviadas.map((n) => (
            <tr key={n.id}>
              <td>{ETIQUETA_TIPO[n.tipo] ?? n.tipo}</td>
              <td>{n.umbralDias ?? '—'}</td>
              <td>{new Date(n.fechaHora).toLocaleString('es-CO')}</td>
            </tr>
          ))}
          {enviadas.length === 0 && (
            <tr>
              <td colSpan={3} className="tenue">
                Aún no se ha enviado ninguna alerta de vencimiento.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
