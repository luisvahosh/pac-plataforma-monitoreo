import { useEffect, useState } from 'react';
import { formatearFecha } from '../api';

interface ActaResumen {
  id: string;
  numero: number;
  fecha: string;
  tema: string | null;
  objetivo: string | null;
}
interface Asistente {
  nombre: string | null;
  organizacion: string | null;
  rolEnReunion: string | null;
  esInvitado: boolean;
  usuario: { nombre: string } | null;
}
interface Tema {
  tema: string;
  descripcion: string | null;
  decisiones: string | null;
  observaciones: string | null;
}
interface ActaDetalle extends ActaResumen {
  lugar: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  elaboradoPor: string | null;
  convocadaPor: string | null;
  asistentes: Asistente[];
  temas: Tema[];
  conclusiones: { texto: string }[];
  tareas: {
    nombre: string;
    estado: string;
    avancePorcentaje: number;
    fechaCompromiso: string | null;
    usuario: { nombre: string } | null;
  }[];
  riesgosOrigen: {
    descripcion: string;
    estado: string;
    nivel: string | null;
    responsable: { nombre: string } | null;
  }[];
}

export function ActasPublicas() {
  const [actas, setActas] = useState<ActaResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<ActaDetalle | null>(null);

  useEffect(() => {
    fetch('/api/public/actas')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setActas)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function abrir(id: string) {
    setError(null);
    try {
      const r = await fetch(`/api/public/actas/${id}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setDetalle(await r.json());
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (error) return <div className="aviso">No se pudieron cargar las actas: {error}</div>;
  if (!actas) return <div className="estado-carga">Cargando actas…</div>;
  if (actas.length === 0) return <div className="estado-carga">Aún no hay actas publicadas.</div>;

  if (detalle) {
    return (
      <div className="panel">
        <button type="button" className="enlace" onClick={() => setDetalle(null)}>
          ← Volver a las actas
        </button>
        <h3>
          Acta {String(detalle.numero).padStart(2, '0')} · {formatearFecha(detalle.fecha)}
        </h3>
        <p className="tenue">
          {detalle.lugar ? `${detalle.lugar} · ` : ''}
          {detalle.horaInicio && detalle.horaFin
            ? `${detalle.horaInicio}–${detalle.horaFin} · `
            : ''}
          {detalle.tema ?? ''}
        </p>
        {detalle.objetivo && (
          <p>
            <strong>Objetivo:</strong> {detalle.objetivo}
          </p>
        )}

        {detalle.asistentes.length > 0 && (
          <p className="tenue">
            <strong>Asistentes:</strong>{' '}
            {detalle.asistentes
              .map(
                (a) => (a.usuario?.nombre ?? a.nombre ?? '') + (a.esInvitado ? ' (invitado)' : ''),
              )
              .join(', ')}
          </p>
        )}

        {detalle.temas.length > 0 && (
          <>
            <h4>Desarrollo de la reunión</h4>
            <ul className="lista-simple">
              {detalle.temas.map((t, i) => (
                <li key={i}>
                  <strong>{t.tema}</strong>
                  {t.descripcion ? ` — ${t.descripcion}` : ''}
                  {t.decisiones ? ` · Decisión: ${t.decisiones}` : ''}
                </li>
              ))}
            </ul>
          </>
        )}

        {detalle.tareas.length > 0 && (
          <>
            <h4>Tareas</h4>
            <ul className="lista-simple">
              {detalle.tareas.map((t, i) => (
                <li key={i}>
                  {t.nombre} — {t.usuario?.nombre ?? 'sin responsable'}
                  <span className="tenue">
                    {' '}
                    · avance {Math.round(t.avancePorcentaje)}% · {t.estado}
                    {t.fechaCompromiso ? ` · vence ${formatearFecha(t.fechaCompromiso)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {detalle.riesgosOrigen.length > 0 && (
          <>
            <h4>Riesgos</h4>
            <ul className="lista-simple">
              {detalle.riesgosOrigen.map((r, i) => (
                <li key={i}>
                  ⚠ {r.descripcion}
                  <span className="tenue">
                    {' '}
                    · {r.estado}
                    {r.nivel ? ` · nivel ${r.nivel}` : ''} ·{' '}
                    {r.responsable?.nombre ?? 'sin responsable'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {detalle.conclusiones.length > 0 && (
          <>
            <h4>Conclusiones</h4>
            <ul className="lista-simple">
              {detalle.conclusiones.map((c, i) => (
                <li key={i}>{c.texto}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="panel">
      <ul className="lista-simple">
        {actas.map((a) => (
          <li key={a.id}>
            <button type="button" className="enlace" onClick={() => abrir(a.id)}>
              Acta {String(a.numero).padStart(2, '0')}
            </button>
            <span className="tenue">
              {' '}
              · {formatearFecha(a.fecha)}
              {a.tema ? ` · ${a.tema}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
