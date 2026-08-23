import type { Indicadores } from '../tipos';
import { redondear } from '../api';

export function TarjetasIndicadores({ indicadores }: { indicadores: Indicadores }) {
  const tarjetas: Array<{ etiqueta: string; valor: string | number }> = [
    { etiqueta: 'Avance del proyecto', valor: `${redondear(indicadores.avanceProyecto)}%` },
    { etiqueta: 'Actividades', valor: indicadores.totalActividades },
    { etiqueta: 'Vencidas', valor: indicadores.actividadesVencidas },
    { etiqueta: 'Hitos cumplidos', valor: `${indicadores.hitosCumplidos}/${indicadores.totalHitos}` },
  ];

  return (
    <section className="kpis" aria-label="Indicadores del proyecto">
      {tarjetas.map((t) => (
        <div className="kpi" key={t.etiqueta}>
          <div className="valor">{t.valor}</div>
          <div className="etiqueta">{t.etiqueta}</div>
        </div>
      ))}
    </section>
  );
}
