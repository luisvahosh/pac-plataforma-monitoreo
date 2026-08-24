import { useState } from 'react';
import type { Actividad, Fase, Subactividad } from '../tipos';
import { formatearFecha, redondear } from '../api';
import { apiJson } from '../privado/api-cliente';

interface EvidenciaEnlace {
  id: string;
  tipo: string;
  url: string | null;
  nombreArchivo: string | null;
  fechaHora: string;
  autor: { nombre: string };
}
interface AvanceConEvidencia {
  id: string;
  porcentaje: number;
  enlaceEvidencia: string | null;
  fechaHora: string;
  usuario: { nombre: string };
}

/** Botón que, solo si hay sesión, revela el enlace de evidencia (nunca visible sin login). */
function VerEvidencia({ url }: { url: string }) {
  const [estado, setEstado] = useState<'oculto' | 'cargando' | 'items' | 'sin-acceso'>('oculto');
  const [items, setItems] = useState<{ enlace: string | null; nota: string }[]>([]);

  async function revelar() {
    setEstado('cargando');
    try {
      const datos = await apiJson<EvidenciaEnlace[] | AvanceConEvidencia[]>(url);
      const normalizado = datos.map((d) => {
        if ('enlaceEvidencia' in d) {
          return { enlace: d.enlaceEvidencia, nota: `${d.usuario.nombre} · ${formatearFecha(d.fechaHora)}` };
        }
        return { enlace: d.url, nota: `${d.autor.nombre} · ${formatearFecha(d.fechaHora)}` };
      });
      setItems(normalizado.filter((i) => i.enlace));
      setEstado('items');
    } catch {
      setEstado('sin-acceso');
    }
  }

  if (estado === 'oculto') {
    return (
      <button type="button" className="enlace-evidencia-boton" onClick={revelar}>
        ver evidencia
      </button>
    );
  }
  if (estado === 'cargando') return <span className="tenue-publico"> cargando…</span>;
  if (estado === 'sin-acceso') return <span className="tenue-publico"> no tienes acceso a la evidencia</span>;
  if (items.length === 0) return <span className="tenue-publico"> sin evidencia registrada</span>;
  return (
    <ul className="evidencia-lista">
      {items.map((i, idx) => (
        <li key={idx}>
          <a href={i.enlace ?? '#'} target="_blank" rel="noopener noreferrer">
            {i.enlace}
          </a>
          <span className="tenue-publico"> — {i.nota}</span>
        </li>
      ))}
    </ul>
  );
}

function ListaAvances({ avances }: { avances: Actividad['avances'] }) {
  if (avances.length === 0) return <p className="tenue-publico">Sin reportes de avance aún.</p>;
  return (
    <ul className="bitacora-lista">
      {[...avances].reverse().map((av) => (
        <li key={av.id}>
          <strong>{redondear(av.porcentaje)}%</strong> — {av.usuario}
          <span className="tenue-publico"> · {formatearFecha(av.fechaHora)}</span>
          {av.observaciones && <p>{av.observaciones}</p>}
        </li>
      ))}
    </ul>
  );
}

function FilaSubactividad({ sub, estaLogueado }: { sub: Subactividad; estaLogueado: boolean }) {
  return (
    <div className="bitacora-subactividad">
      <div className="bitacora-subactividad-cabecera">
        <span>{sub.descripcion}</span>
        <strong>{redondear(sub.avancePorcentaje)}%</strong>
      </div>
      <ListaAvances avances={sub.avances} />
      {estaLogueado && sub.avances.length > 0 && <VerEvidencia url={`/api/subactividades/${sub.id}/avances`} />}
    </div>
  );
}

function FilaActividad({ actividad, estaLogueado }: { actividad: Actividad; estaLogueado: boolean }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <div className="bitacora-actividad">
      <button type="button" className="bitacora-actividad-cabecera" onClick={() => setAbierta((v) => !v)}>
        <span>{abierta ? '▾' : '▸'} {actividad.nombre}</span>
        <strong>{redondear(actividad.avancePorcentaje)}%</strong>
      </button>
      {abierta && (
        <div className="bitacora-actividad-cuerpo">
          {actividad.subactividades.length === 0 ? (
            <>
              <ListaAvances avances={actividad.avances} />
              {estaLogueado && actividad.avances.length > 0 && (
                <VerEvidencia url={`/api/actividades/${actividad.id}/evidencias`} />
              )}
            </>
          ) : (
            actividad.subactividades.map((s) => (
              <FilaSubactividad key={s.id} sub={s} estaLogueado={estaLogueado} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ActividadesBitacora({ fases, estaLogueado }: { fases: Fase[]; estaLogueado: boolean }) {
  return (
    <section aria-label="Actividades y su bitácora de avance">
      {!estaLogueado && (
        <p className="tenue-publico">
          Inicia sesión para ver el enlace de la evidencia de cada reporte.
        </p>
      )}
      {fases.map((fase) => (
        <article className="fase" key={fase.id}>
          <div className="fase-cabecera">
            <h3>{fase.nombre}</h3>
          </div>
          {fase.actividades.map((a) => (
            <FilaActividad key={a.id} actividad={a} estaLogueado={estaLogueado} />
          ))}
        </article>
      ))}
    </section>
  );
}
