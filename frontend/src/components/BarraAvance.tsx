import { redondear } from '../api';

export function BarraAvance({ valor }: { valor: number }) {
  const pct = redondear(valor);
  return (
    <div
      className="barra"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Avance ${pct}%`}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
