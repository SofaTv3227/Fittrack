import { Trophy, Flame } from 'lucide-react';

export default function WorkoutComplete({ summary, onDone }) {
  return (
    <div className="card flex flex-col items-center text-center gap-4 py-10">
      <span className="text-4xl">🎉</span>
      <h2 className="text-2xl font-extrabold">Training abgeschlossen</h2>
      <div className="flex items-center gap-2 chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
        <Flame size={14} /> +{summary.xp} XP
      </div>

      <div className="grid grid-cols-3 gap-6 mt-2">
        <div><div className="text-2xl font-extrabold">{summary.durationMin}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Minuten</div></div>
        <div><div className="text-2xl font-extrabold">{summary.exerciseCount}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Übungen</div></div>
        <div><div className="text-2xl font-extrabold">{summary.setCount}</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Sätze</div></div>
      </div>

      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Gesamtvolumen: <b style={{ color: 'var(--text)' }}>{summary.volume.toLocaleString('de-DE')} kg</b>
      </div>

      {summary.prs.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-2 w-full max-w-xs">
          {summary.prs.map((pr, i) => (
            <div key={i} className="chip justify-center" style={{ background: 'rgba(234,179,8,0.15)', color: 'var(--yellow)' }}>
              <Trophy size={13} /> Neuer Rekord: {pr.name} {pr.weight} kg
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-accent mt-2" onClick={onDone}>Fertig</button>
    </div>
  );
}
