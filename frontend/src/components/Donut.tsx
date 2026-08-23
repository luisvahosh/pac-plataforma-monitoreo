import { redondear } from '../api';

export function Donut({ valor }: { valor: number | null }) {
  const pct = redondear(valor);
  const radio = 42;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia * (1 - pct / 100);

  return (
    <svg className="donut" viewBox="0 0 100 100" role="img" aria-label={`Avance global ${pct}%`}>
      <circle cx="50" cy="50" r={radio} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={radio}
        fill="none"
        stroke="#ffdc2f"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circunferencia}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="54">
        {pct}%
      </text>
    </svg>
  );
}
