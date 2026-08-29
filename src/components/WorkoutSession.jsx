import { useEffect, useState } from 'react';
import { Play, Pause, Square, Check, SkipForward, Plus, ChevronRight } from 'lucide-react';

function emptySet() { return { weight: '', reps: '', done: false }; }

// Fokussierter Trainingsmodus: eine Übung im Fokus, Sätze eintragen/abhaken, Timer, Pause, Überspringen.
export default function WorkoutSession({ day, onFinish, onCancel }) {
  const [exercises, setExercises] = useState(() =>
    day.exercises.map((ex) => ({
      name: ex.name, muscle: ex.muscle, targetReps: ex.reps, note: '',
      sets: Array.from({ length: Number(ex.sets) || 1 }, emptySet),
      skipped: false,
    }))
  );
  const [current, setCurrent] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [paused]);

  const fmtTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const updateSet = (exIdx, setIdx, patch) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      return { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) };
    }));
  };
  const addSet = (exIdx) => {
    setExercises((prev) => prev.map((ex, i) => (i === exIdx ? { ...ex, sets: [...ex.sets, emptySet()] } : ex)));
  };
  const skipExercise = (exIdx) => {
    setExercises((prev) => prev.map((ex, i) => (i === exIdx ? { ...ex, skipped: true } : ex)));
    if (exIdx < exercises.length - 1) setCurrent(exIdx + 1);
  };

  const ex = exercises[current];
  const isLast = current === exercises.length - 1;
  const nextEx = !isLast ? exercises[current + 1] : null;

  const handleFinish = () => {
    const cleanExercises = exercises
      .filter((e) => !e.skipped)
      .map((e) => ({ name: e.name, muscle: e.muscle, sets: e.sets.filter((s) => s.done && (s.reps || s.weight)), note: e.note }))
      .filter((e) => e.sets.length > 0);
    onFinish({ exercises: cleanExercises, durationMin: Math.round(elapsedSec / 60) || 1 });
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--accent-soft)' }}>
        <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>{fmtTime(elapsedSec)}</span>
        <div className="flex gap-1">
          <button className="btn btn-sm" onClick={() => setPaused((p) => !p)}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
          <button className="btn btn-sm" onClick={onCancel}><Square size={13} /> Abbrechen</button>
          <button className="btn btn-sm btn-accent" onClick={handleFinish}>Training beenden</button>
        </div>
      </div>

      <div>
        <div className="eyebrow">Übung {current + 1} / {exercises.length}</div>
        <h3 className="text-xl font-extrabold uppercase tracking-tight mt-1">{ex.name}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ex.muscle} · Ziel: {ex.targetReps} Wdh.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-[10px] font-semibold uppercase px-1" style={{ color: 'var(--text-muted)' }}>
          <span>Satz</span><span>Gewicht</span><span>Wdh.</span><span>Status</span>
        </div>
        {ex.sets.map((set, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center rounded-lg px-2 py-1.5" style={{ background: 'var(--bg-elevated)' }}>
            <span className="text-sm w-5 text-center" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
            <input className="input" type="number" placeholder="kg" value={set.weight} onChange={(e) => updateSet(current, i, { weight: e.target.value })} />
            <input className="input" type="number" placeholder="Wdh." value={set.reps} onChange={(e) => updateSet(current, i, { reps: e.target.value })} />
            <button
              onClick={() => updateSet(current, i, { done: !set.done })}
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ borderColor: set.done ? 'var(--green)' : 'var(--border-strong)', background: set.done ? 'var(--green)' : 'transparent' }}
            >
              {set.done && <Check size={15} color="#fff" />}
            </button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm w-fit" onClick={() => addSet(current)}><Plus size={13} /> Satz hinzufügen</button>
      </div>

      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button className="btn btn-sm" onClick={() => skipExercise(current)} disabled={isLast && current === exercises.length - 1 && false}>
          <SkipForward size={13} /> Überspringen
        </button>
        {nextEx ? (
          <button className="btn btn-accent btn-sm" onClick={() => setCurrent(current + 1)}>
            Nächste Übung: {nextEx.name} <ChevronRight size={14} />
          </button>
        ) : (
          <button className="btn btn-accent btn-sm" onClick={handleFinish}>Training beenden</button>
        )}
      </div>
    </div>
  );
}
