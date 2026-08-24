import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';

function StatBlock({ label, value }) {
  return (
    <div className="flex flex-col items-start sm:items-center min-w-[64px]">
      <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-sm font-semibold">{value || '—'}</span>
    </div>
  );
}

export default function ExerciseRow({ ex, onChange, onDelete, dragHandleProps, isDragging, isDropTarget }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className="relative rounded-xl px-3 py-2.5 mb-2 transition-all"
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${isDropTarget ? 'var(--accent)' : 'var(--border)'}`,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <div className="flex items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap">
        <span
          className="cursor-grab active:cursor-grabbing shrink-0 mt-1 sm:mt-0 touch-none"
          style={{ color: 'var(--text-muted)' }}
          title="Zum Verschieben ziehen"
          {...dragHandleProps}
        >
          <GripVertical size={16} />
        </span>

        <div className="flex-1 min-w-[140px]">
          <input
            className="input"
            style={{ background: 'transparent', border: 'none', padding: '2px 0', fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'normal' }}
            value={ex.name}
            title={ex.name}
            onChange={(e) => onChange({ ...ex, name: e.target.value })}
          />
          <select
            className="input mt-1"
            style={{ width: 'auto', display: 'inline-block', background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, borderRadius: 999 }}
            value={ex.muscle}
            onChange={(e) => onChange({ ...ex, muscle: e.target.value })}
          >
            {['Brust', 'Rücken', 'Beine', 'Schultern', 'Arme', 'Core', 'Cardio'].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 sm:gap-5 w-full sm:w-auto">
          <StatBlock label="Sätze" value={
            <input className="input" style={{ background: 'transparent', border: 'none', padding: 0, width: 40, fontWeight: 600 }} value={ex.sets} onChange={(e) => onChange({ ...ex, sets: e.target.value })} />
          } />
          <StatBlock label="Wdh." value={
            <input className="input" style={{ background: 'transparent', border: 'none', padding: 0, width: 60, fontWeight: 600 }} value={ex.reps} onChange={(e) => onChange({ ...ex, reps: e.target.value })} />
          } />
          <StatBlock label="Pause" value={
            <input className="input" style={{ background: 'transparent', border: 'none', padding: 0, width: 60, fontWeight: 600 }} value={ex.rest} onChange={(e) => onChange({ ...ex, rest: e.target.value })} />
          } />
        </div>

        <button
          className="btn btn-ghost btn-sm shrink-0"
          style={{ color: 'var(--text-muted)', opacity: 0.6, padding: '4px 6px' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--red)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = 'var(--text-muted)'; }}
          onClick={() => setConfirming(true)}
          title="Übung löschen"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {confirming && (
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center gap-3 z-10"
          style={{ background: 'rgba(11,12,15,0.92)', backdropFilter: 'blur(2px)' }}
        >
          <span className="text-xs font-medium">Übung wirklich löschen?</span>
          <button className="btn btn-sm" onClick={() => setConfirming(false)}>Abbrechen</button>
          <button className="btn btn-sm btn-danger" style={{ borderColor: 'var(--red)' }} onClick={onDelete}>Löschen</button>
        </div>
      )}
    </div>
  );
}
