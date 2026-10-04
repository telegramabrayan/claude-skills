/** Gráfico de barras SVG simple y accesible (sin librerías). */
export function BarChart({ data, color = "var(--primary)", height = 140, unit = "", label }: { data: { label: string; value: number }[]; color?: string; height?: number; unit?: string; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 400;
  const bw = W / data.length;
  const showEvery = data.length > 14 ? Math.ceil(data.length / 10) : 1;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${height + 20}`} className="h-auto w-full" role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(", ")}`}>
        <line x1={0} x2={W} y1={height} y2={height} stroke="var(--border)" />
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 16);
          return (
            <g key={i}>
              <rect x={i * bw + bw * 0.15} y={height - h} width={bw * 0.7} height={Math.max(h, d.value ? 2 : 0)} rx={Math.min(4, bw * 0.2)} fill={color} opacity={0.9} />
              {d.value > 0 && data.length <= 14 && (
                <text x={i * bw + bw / 2} y={height - h - 4} textAnchor="middle" fontSize={10} fill="var(--muted)">
                  {Math.round(d.value)}
                </text>
              )}
              {i % showEvery === 0 && (
                <text x={i * bw + bw / 2} y={height + 14} textAnchor="middle" fontSize={10} fill="var(--muted)">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
