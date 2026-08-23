export default function MacroBar({ label, current, target, color, unit = 'g' }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target;
  const diff = Math.round(Math.abs(target - current));
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {Math.round(current)} / {target} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: over ? 'var(--yellow)' : color }}
        />
      </div>
      <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
        {over ? `+${diff} ${unit} über Ziel` : `${diff} ${unit} übrig`}
      </div>
    </div>
  );
}
