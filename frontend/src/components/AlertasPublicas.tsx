import type { Actividad, Fase } from '../tipos';
import { formatearFecha, redondear } from '../api';

interface ActividadConFase extends Actividad {
  faseNombre: string;
}

function agrupar(fases: Fase[]) {
  const todas: ActividadConFase[] = fases.flatMap((f) =>
    f.actividades.map((a) => ({ ...a, faseNombre: f.nombre })),
  );
  return {
    vencidas: todas.filter((a) => a.estado === 'vencida'),
    proximas: todas.filter((a) => a.estado === 'proxima_a_vencer'),
    atrasadas: todas.filter((a) => a.estadoCronograma === 'atrasada'),
    enRiesgo: todas.filter((a) => a.estadoCronograma === 'en_riesgo'),
  };
}

function Grupo({
  titulo,
  descripcion,
  tono,
  items,
}: {
  titulo: string;
  descripcion: string;
  tono: 'danger' | 'warn';
  items: ActividadConFase[];
}) {
  return (
    <div className={`alerta-grupo alerta-grupo-${tono}`}>
      <h3>
        {titulo} <span className="alerta-contador">{items.length}</span>
      </h3>
      <p className="tenue-publico">{descripcion}</p>
      {items.length === 0 ? (
        <p className="tenue-publico">Ninguna actividad en este estado.</p>
      ) : (
        <ul className="alerta-lista">
          {items.map((a) => (
            <li key={a.id}>
              <strong>{a.nombre}</strong>
              <span className="tenue-publico"> — {a.faseNombre}</span>
              <div className="tenue-publico">
                Avance {redondear(a.avancePorcentaje)}% · Fin planeado {formatearFecha(a.fechaFinPlan)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AlertasPublicas({ fases }: { fases: Fase[] }) {
  const { vencidas, proximas, atrasadas, enRiesgo } = agrupar(fases);

  return (
    <section aria-label="Alertas del proyecto">
      <Grupo
        titulo="Vencidas"
        descripcion="Ya pasó su fecha límite planeada y no está finalizada."
        tono="danger"
        items={vencidas}
      />
      <Grupo
        titulo="Próximas a vencer"
        descripcion="Se acercan a su fecha límite planeada."
        tono="warn"
        items={proximas}
      />
      <Grupo
        titulo="Atrasadas por cronograma"
        descripcion="El avance real está muy por debajo del avance esperado a la fecha, según la línea base vigente."
        tono="danger"
        items={atrasadas}
      />
      <Grupo
        titulo="En riesgo por cronograma"
        descripcion="Señal temprana: el avance real empieza a quedarse atrás del esperado."
        tono="warn"
        items={enRiesgo}
      />
    </section>
  );
}
