import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { MUSCLE_GROUPS } from '../lib/workoutPrograms';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Search, Trophy } from 'lucide-react';

function emptySet() { return { reps: '', weight: '', rpe: '' }; }
function emptyExercise() { return { name: '', muscle: 'Brust', sets: [emptySet()], note: '' }; }

function sessionVolume(session) {
  return session.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0), 0);
}

export default function Logbook() {
  const { logs, addLog, deleteLog, todayStr } = useApp();
  const [date, setDate] = useState(todayStr());
  const [type, setType] = useState('');
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');

  const updateExercise = (idx, next) => setExercises((prev) => prev.map((e, i) => (i === idx ? next : e)));
  const addExercise = () => setExercises((prev) => [...prev, emptyExercise()]);
  const removeExercise = (idx) => setExercises((prev) => prev.filter((_, i) => i !== idx));

  const addSet = (exIdx) => updateExercise(exIdx, { ...exercises[exIdx], sets: [...exercises[exIdx].sets, emptySet()] });
  const updateSet = (exIdx, setIdx, next) => {
    const ex = exercises[exIdx];
    const sets = ex.sets.map((s, i) => (i === setIdx ? next : s));
    updateExercise(exIdx, { ...ex, sets });
  };
  const removeSet = (exIdx, setIdx) => {
    const ex = exercises[exIdx];
    updateExercise(exIdx, { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) });
  };

  const totalVolume = useMemo(
    () => exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0), 0),
    [exercises]
  );

  const handleSave = async () => {
    const cleanExercises = exercises
      .filter((e) => e.name.trim())
      .map((e) => ({ ...e, sets: e.sets.filter((s) => s.reps || s.weight) }));
    if (!cleanExercises.length) return;
    await addLog({ date, type: type || 'Training', exercises: cleanExercises });
    setType('');
    setExercises([emptyExercise()]);
  };

  const filteredLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((l) =>
      l.type.toLowerCase().includes(q) || l.exercises.some((e) => e.name.toLowerCase().includes(q))
    );
  }, [logs, search]);

  const allExerciseNames = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.exercises.forEach((e) => set.add(e.name)));
    return [...set].sort();
  }, [logs]);

  const progressData = useMemo(() => {
    if (!selectedExercise) return [];
    const rows = [];
    [...logs].sort((a, b) => (a.date > b.date ? 1 : -1)).forEach((l) => {
      l.exercises.filter((e) => e.name === selectedExercise).forEach((e) => {
        const maxWeight = Math.max(0, ...e.sets.map((s) => Number(s.weight) || 0));
        const volume = e.sets.reduce((s, set) => s + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0);
        rows.push({ date: l.date, weight: maxWeight, volume });
      });
    });
    return rows;
  }, [logs, selectedExercise]);

  const pr = useMemo(() => (progressData.length ? Math.max(...progressData.map((r) => r.weight)) : 0), [progressData]);

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Trainings-Logbuch</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Neue Einheit erfassen und Historie durchsuchen.</p>
      </div>

      <div className="card">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label">Datum</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Trainingstyp</label>
            <input className="input" placeholder="z.B. Brust/Trizeps" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {exercises.map((ex, exIdx) => (
            <div key={exIdx} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="flex gap-2 items-center mb-3">
                <input className="input" placeholder="Übungsname" value={ex.name} onChange={(e) => updateExercise(exIdx, { ...ex, name: e.target.value })} />
                <select className="input w-40" value={ex.muscle} onChange={(e) => updateExercise(exIdx, { ...ex, muscle: e.target.value })}>
                  {MUSCLE_GROUPS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <button className="btn btn-ghost btn-danger btn-sm" onClick={() => removeExercise(exIdx)}><Trash2 size={15} /></button>
              </div>

              <div className="flex flex-col gap-2">
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center">
                    <span className="text-xs w-6" style={{ color: 'var(--text-muted)' }}>#{setIdx + 1}</span>
                    <input className="input" type="number" placeholder="Wdh." value={set.reps} onChange={(e) => updateSet(exIdx, setIdx, { ...set, reps: e.target.value })} />
                    <input className="input" type="number" placeholder="kg" value={set.weight} onChange={(e) => updateSet(exIdx, setIdx, { ...set, weight: e.target.value })} />
                    <input className="input" type="number" min="1" max="10" placeholder="RPE" value={set.rpe} onChange={(e) => updateSet(exIdx, setIdx, { ...set, rpe: e.target.value })} />
                    <button className="btn btn-ghost btn-sm" onClick={() => removeSet(exIdx, setIdx)}><Trash2 size={13} /></button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm w-fit" onClick={() => addSet(exIdx)}><Plus size={13} /> Satz</button>
              </div>
              <input className="input mt-2" placeholder="Notiz (optional)" value={ex.note} onChange={(e) => updateExercise(exIdx, { ...ex, note: e.target.value })} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <button className="btn" onClick={addExercise}><Plus size={15} /> Übung</button>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Gesamtvolumen: <b style={{ color: 'var(--text)' }}>{totalVolume.toLocaleString('de-DE')} kg</b></span>
            <button className="btn btn-accent" onClick={handleSave}>Einheit speichern</button>
          </div>
        </div>
      </div>

      {allExerciseNames.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h3 className="font-bold">Fortschritt pro Übung</h3>
            <select className="input w-56" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
              <option value="">Übung wählen…</option>
              {allExerciseNames.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          {selectedExercise && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} color="var(--accent-2)" />
                <span className="text-sm">Persönlicher Rekord: <b>{pr} kg</b></span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="weight" name="Gewicht (kg)" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="volume" name="Volumen" stroke="var(--blue)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} color="var(--text-muted)" />
          <input className="input" placeholder="Historie durchsuchen…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-col gap-3">
          {filteredLogs.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Keine Einträge gefunden.</p>}
          {filteredLogs.map((l) => (
            <div key={l.id} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{l.type}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.date} · {l.exercises.length} Übungen · {sessionVolume(l).toLocaleString('de-DE')} kg Volumen</div>
                </div>
                <button className="btn btn-ghost btn-danger btn-sm" onClick={() => deleteLog(l.id)}><Trash2 size={14} /></button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {l.exercises.map((e, i) => (
                  <span key={i} className="chip">{e.name} · {e.sets.length} Sätze</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
