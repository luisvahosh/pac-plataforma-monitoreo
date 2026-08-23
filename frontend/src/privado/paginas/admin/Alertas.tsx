import { useEffect, useState, type FormEvent } from 'react';
import { apiJson } from '../../api-cliente';

interface Regla {
  id: string;
  diasAnticipacion: number[];
  activo: boolean;
}

export function Alertas() {
  const [dias, setDias] = useState('');
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    apiJson<Regla>('/api/reglas-alerta')
      .then((r) => {
        setDias(r.diasAnticipacion.join(', '));
        setActivo(r.activo);
      })
      .catch((e: Error) => setError(e.message));
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

  return (
    <section>
      <h2>Alertas de vencimiento</h2>
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
        <button type="submit">Guardar</button>
      </form>
    </section>
  );
}
