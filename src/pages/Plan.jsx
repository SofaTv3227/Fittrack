import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { generateProgram, MUSCLE_GROUPS } from '../lib/workoutPrograms';
import { exportPlanToPdf } from '../lib/pdf';
import { Plus, Trash2, RefreshCw, Download } from 'lucide-react';

function ExerciseRow({ ex, onChange, onDelete }) {
  return (
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center py-2 border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}>
      <input className="input" value={ex.name} onChange={(e) => onChange({ ...ex, name: e.target.value })} />
      <select className="input hidden sm:block" value={ex.muscle} onChange={(e) => onChange({ ...ex, muscle: e.target.value })}>
        {MUSCLE_GROUPS.map((m) => <option key={m}>{m}</option>)}
      </select>
      <input className="input hidden sm:block" value={ex.sets} onChange={(e) => onChange({ ...ex, sets: e.target.value })} placeholder="Sätze" />
      <input className="input hidden sm:block" value={ex.reps} onChange={(e) => onChange({ ...ex, reps: e.target.value })} placeholder="Wdh." />
      <input className="input hidden sm:block" value={ex.rest} onChange={(e) => onChange({ ...ex, rest: e.target.value })} placeholder="Pause" />
      <button className="btn btn-ghost btn-danger btn-sm" onClick={onDelete}><Trash2 size={15} /></button>
    </div>
  );
}

export default function Plan() {
  const { profile, plan, savePlan, regeneratePlan } = useApp();
  const [busy, setBusy] = useState(false);

  const handleRegenerate = async () => {
    setBusy(true);
    await regeneratePlan();
    setBusy(false);
  };

  const updateExercise = (dayIdx, exIdx, next) => {
    const days = plan.days.map((d, i) => {
      if (i !== dayIdx) return d;
      const exercises = d.exercises.map((e, j) => (j === exIdx ? next : e));
      return { ...d, exercises };
    });
    savePlan({ ...plan, days });
  };

  const deleteExercise = (dayIdx, exIdx) => {
    const days = plan.days.map((d, i) => {
      if (i !== dayIdx) return d;
      return { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) };
    });
    savePlan({ ...plan, days });
  };

  const addExercise = (dayIdx) => {
    const days = plan.days.map((d, i) => {
      if (i !== dayIdx) return d;
      return { ...d, exercises: [...d.exercises, { name: 'Neue Übung', muscle: 'Brust', sets: 3, reps: '10-12', rest: '90 s' }] };
    });
    savePlan({ ...plan, days });
  };

  if (!plan) {
    return (
      <div className="animate-in card text-center py-16">
        <p style={{ color: 'var(--text-muted)' }}>Noch kein Plan generiert.</p>
        <button className="btn btn-accent mt-4" onClick={handleRegenerate} disabled={busy}>
          Trainingsplan generieren
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{plan.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Basierend auf: {profile.goal} · {profile.experience} · {profile.daysPerWeek} Tage/Woche
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={handleRegenerate} disabled={busy}>
            <RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> Neu generieren
          </button>
          <button className="btn btn-accent" onClick={() => exportPlanToPdf(plan, profile.name)}>
            <Download size={15} /> Als PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {plan.days.map((day, dayIdx) => (
          <div key={dayIdx} className="card">
            <h3 className="font-bold mb-3">{day.name}</h3>
            <div>
              {day.exercises.map((ex, exIdx) => (
                <ExerciseRow
                  key={exIdx}
                  ex={ex}
                  onChange={(next) => updateExercise(dayIdx, exIdx, next)}
                  onDelete={() => deleteExercise(dayIdx, exIdx)}
                />
              ))}
            </div>
            <button className="btn btn-ghost btn-sm mt-3" onClick={() => addExercise(dayIdx)}>
              <Plus size={14} /> Übung hinzufügen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
