import type { Indicadores } from '../tipos';
import { redondear } from '../api';

type Tono = 'info' | 'ok' | 'danger' | 'warn' | 'neutro';

export function TarjetasIndicadores({ indicadores }: { indicadores: Indicadores }) {
  const tarjetas: Array<{ etiqueta: string; valor: string | number; tono: Tono }> = [
    { etiqueta: 'Avance del proyecto', valor: `${redondear(indicadores.avanceProyecto)}%`, tono: 'info' },
    { etiqueta: 'Actividades', valor: indicadores.totalActividades, tono: 'neutro' },
    { etiqueta: 'Vencidas', valor: indicadores.actividadesVencidas, tono: 'danger' },
    {
      etiqueta: 'Desviación crítica de cronograma',
      valor: indicadores.desviacionesCriticas,
      tono: 'warn',
    },
    {
      etiqueta: 'Hitos cumplidos',
      valor: `${indicadores.hitosCumplidos}/${indicadores.totalHitos}`,
      tono: 'ok',
    },
  ];

  return (
    <section className="kpis" aria-label="Indicadores del proyecto">
      {tarjetas.map((t) => (
        <div className={`kpi kpi-${t.tono}`} key={t.etiqueta}>
          <div className="valor">{t.valor}</div>
          <div className="etiqueta">{t.etiqueta}</div>
        </div>
      ))}
    </section>
  );
}
