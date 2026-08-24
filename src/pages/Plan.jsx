import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { exportPlanToPdf } from '../lib/pdf';
import { planStats, estimateDayMinutes, dayMuscleGroups, formatMinutes } from '../lib/planStats';
import ExerciseRow from '../components/ExerciseRow';
import { Plus, RefreshCw, Download, PenLine, Check, Trash2, Dumbbell, ListChecks, CalendarDays, Clock3, Layers } from 'lucide-react';

function emptyDay(n) {
  return { name: `Tag ${n}`, exercises: [] };
}

function StatChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <Icon size={16} color="var(--accent)" />
      <div className="leading-tight">
        <div className="text-sm font-bold">{value}</div>
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function Plan() {
  const { profile, plan, savePlan, regeneratePlan } = useApp();
  const [busy, setBusy] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [dragSrc, setDragSrc] = useState(null); // { dayIdx, exIdx }
  const [dragOver, setDragOver] = useState(null); // { dayIdx, exIdx }

  const stats = useMemo(() => planStats(plan), [plan]);

  const handleRegenerate = async () => {
    setBusy(true);
    await regeneratePlan();
    setBusy(false);
  };

  const handleCreateCustom = () => {
    savePlan({ key: 'custom', name: 'Mein eigener Plan', days: [emptyDay(1)] });
  };

  const updateDayName = (dayIdx, name) => {
    const days = plan.days.map((d, i) => (i === dayIdx ? { ...d, name } : d));
    savePlan({ ...plan, days });
  };

  const addDay = () => {
    savePlan({ ...plan, days: [...plan.days, emptyDay(plan.days.length + 1)] });
  };

  const deleteDay = (dayIdx) => {
    savePlan({ ...plan, days: plan.days.filter((_, i) => i !== dayIdx) });
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

  // Reihenfolge nur bei tatsächlichem Drop verändern — sonst bleibt die bestehende Reihenfolge unangetastet.
  const handleDrop = (dayIdx, exIdx) => {
    if (!dragSrc || dragSrc.dayIdx !== dayIdx || dragSrc.exIdx === exIdx) {
      setDragSrc(null);
      setDragOver(null);
      return;
    }
    const days = plan.days.map((d, i) => {
      if (i !== dayIdx) return d;
      const exercises = [...d.exercises];
      const [moved] = exercises.splice(dragSrc.exIdx, 1);
      exercises.splice(exIdx, 0, moved);
      return { ...d, exercises };
    });
    savePlan({ ...plan, days });
    setDragSrc(null);
    setDragOver(null);
  };

  if (!plan) {
    return (
      <div className="animate-in card text-center py-16 flex flex-col items-center gap-3">
        <p style={{ color: 'var(--text-muted)' }}>Noch kein Plan generiert.</p>
        <div className="flex gap-2">
          <button className="btn btn-accent" onClick={handleRegenerate} disabled={busy}>
            Trainingsplan generieren
          </button>
          <button className="btn" onClick={handleCreateCustom}>
            <PenLine size={15} /> Eigenen Plan erstellen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{plan.name}</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {plan.key === 'custom'
              ? 'Selbst erstellter Trainingsplan'
              : `${profile.goal} · ${profile.experience} · ${profile.daysPerWeek} Tage/Woche`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={handleRegenerate} disabled={busy}>
            <RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> Neu generieren
          </button>
          <button className="btn" onClick={handleCreateCustom}>
            <PenLine size={15} /> Eigenen Plan erstellen
          </button>
          <button className="btn btn-accent" onClick={() => exportPlanToPdf(plan, profile.name)}>
            <Download size={15} /> Als PDF
          </button>
        </div>
      </div>

      {/* Statistikleiste */}
      {stats && (
        <div className="card flex flex-wrap gap-x-1 gap-y-2" style={{ padding: 8 }}>
          <StatChip icon={Layers} label="Sätze gesamt" value={stats.totalSets} />
          <StatChip icon={Dumbbell} label="Übungen insgesamt" value={stats.exerciseCount} />
          <StatChip icon={CalendarDays} label="Trainingstage" value={stats.dayCount} />
          <StatChip icon={Clock3} label="Geschätzte Dauer" value={formatMinutes(stats.totalMinutes)} />
          <StatChip icon={ListChecks} label="Muskelgruppen" value={stats.muscleGroupCount} />
        </div>
      )}

      {/* Trainingstage */}
      <div className="grid md:grid-cols-2 gap-5">
        {plan.days.map((day, dayIdx) => {
          const muscles = dayMuscleGroups(day);
          const minutes = estimateDayMinutes(day);
          const isEditing = editingDay === dayIdx;
          return (
            <div key={dayIdx} className="card flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        className="input font-extrabold text-lg"
                        value={day.name}
                        onChange={(e) => updateDayName(dayIdx, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingDay(null)}
                      />
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingDay(null)}><Check size={16} color="var(--green)" /></button>
                    </div>
                  ) : (
                    <button className="flex items-center gap-2 group" onClick={() => setEditingDay(dayIdx)}>
                      <span className="font-extrabold text-lg tracking-tight uppercase">{day.name}</span>
                      <PenLine size={13} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {muscles.length > 0 ? muscles.join(' · ') : 'Noch keine Übungen'}
                  </p>
                </div>
                {plan.days.length > 1 && (
                  <button className="btn btn-ghost btn-sm shrink-0" style={{ color: 'var(--text-muted)' }} onClick={() => deleteDay(dayIdx)} title="Trainingstag löschen">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <span className="chip">{day.exercises.length} Übungen</span>
                {minutes > 0 && <span className="chip" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>ca. {minutes} Min</span>}
              </div>

              <div>
                {day.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    draggable
                    onDragStart={() => setDragSrc({ dayIdx, exIdx })}
                    onDragOver={(e) => { e.preventDefault(); setDragOver({ dayIdx, exIdx }); }}
                    onDrop={() => handleDrop(dayIdx, exIdx)}
                    onDragEnd={() => { setDragSrc(null); setDragOver(null); }}
                  >
                    <ExerciseRow
                      ex={ex}
                      onChange={(next) => updateExercise(dayIdx, exIdx, next)}
                      onDelete={() => deleteExercise(dayIdx, exIdx)}
                      isDragging={dragSrc?.dayIdx === dayIdx && dragSrc?.exIdx === exIdx}
                      isDropTarget={dragOver?.dayIdx === dayIdx && dragOver?.exIdx === exIdx && dragSrc?.exIdx !== exIdx}
                    />
                  </div>
                ))}
                {day.exercises.length === 0 && (
                  <p className="text-sm py-3 text-center" style={{ color: 'var(--text-muted)' }}>Noch keine Übungen für diesen Tag.</p>
                )}
              </div>

              <button
                className="btn w-full justify-center"
                style={{ borderStyle: 'dashed', color: 'var(--accent)', borderColor: 'var(--accent)', background: 'transparent' }}
                onClick={() => addExercise(dayIdx)}
              >
                <Plus size={15} /> Übung hinzufügen
              </button>
            </div>
          );
        })}

        <button
          className="card flex items-center justify-center gap-2 py-10"
          style={{ borderStyle: 'dashed', color: 'var(--text-muted)' }}
          onClick={addDay}
        >
          <Plus size={18} /> Trainingstag hinzufügen
        </button>
      </div>
    </div>
  );
}
