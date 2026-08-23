import { PieChart, Pie, Cell } from 'recharts';

export default function CalorieRing({ target, eaten, burned = 0, addBurned = false, size = 200 }) {
  const effectiveTarget = target + (addBurned ? burned : 0);
  const remaining = effectiveTarget - eaten;
  const over = remaining < 0;
  const pct = effectiveTarget > 0 ? Math.min(eaten / effectiveTarget, 1) : 0;

  const data = over
    ? [{ value: 1 }]
    : [{ value: pct }, { value: 1 - pct }];

  const color = over ? 'var(--red)' : 'var(--accent)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={size * 0.36}
          outerRadius={size * 0.48}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive
        >
          {over ? (
            <Cell fill={color} />
          ) : (
            <>
              <Cell fill={color} />
              <Cell fill="var(--bg-elevated)" />
            </>
          )}
        </Pie>
      </PieChart>
      <div className="absolute flex flex-col items-center justify-center text-center px-2">
        <span className="text-2xl font-extrabold" style={{ color: over ? 'var(--red)' : 'var(--text)' }}>
          {over ? `+${Math.abs(remaining)}` : remaining}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          kcal {over ? 'über Ziel' : 'übrig'}
        </span>
      </div>
    </div>
  );
}
