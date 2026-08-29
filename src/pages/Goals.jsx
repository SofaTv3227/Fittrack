import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { Plus, Trash2, Target } from 'lucide-react';

const ICONS = ['🏃', '🏋️', '🏀', '🔥', '⚡', '🎯'];

function emptyGoal() {
  return { icon: '🎯', title: '', current: 0, target: 100, unit: '' };
}

function GoalCard({ goal, onUpdate, onDelete }) {
  const [editingCurrent, setEditingCurrent] = useState(false);
  const [val, setVal] = useState(goal.current);
  const pct = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
  const reached = goal.current >= goal.target;

  const save = () => {
    onUpdate({ current: Number(val) || 0 });
    setEditingCurrent(false);
  };

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{goal.icon}</span>
          <span className="font-bold truncate">{goal.title}</span>
        </div>
        <button className="btn btn-ghost btn-sm shrink-0" onClick={onDelete}><Trash2 size={14} /></button>
      </div>

      <div className="flex items-center justify-between text-sm">
        {editingCurrent ? (
          <div className="flex items-center gap-2">
            <input className="input w-24" type="number" autoFocus value={val}
              onChange={(e) => setVal(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()} />
            <span style={{ color: 'var(--text-muted)' }}>/ {goal.target} {goal.unit}</span>
          </div>
        ) : (
          <button onClick={() => setEditingCurrent(true)} className="font-semibold">
            {goal.current} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {goal.target} {goal.unit}</span>
          </button>
        )}
        <span className="font-bold" style={{ color: reached ? 'var(--green)' : 'var(--accent)' }}>{pct}%</span>
      </div>

      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: reached ? 'var(--green)' : 'linear-gradient(90deg, var(--accent), var(--accent-2))' }} />
      </div>

      {reached && <span className="chip w-fit" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)' }}>🎯 Ziel erreicht</span>}
    </div>
  );
}

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();
  const showToast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyGoal());

  const handleAdd = async () => {
    if (!draft.title.trim()) return;
    await addGoal({ ...draft, current: Number(draft.current) || 0, target: Number(draft.target) || 1 });
    setDraft(emptyGoal());
    setShowForm(false);
    showToast('Ziel hinzugefügt ✓');
  };

  const handleUpdate = async (goal, patch) => {
    await updateGoal(goal.id, patch);
    if ((patch.current ?? goal.current) >= goal.target && goal.current < goal.target) {
      showToast('Ziel erreicht 🎯');
    }
  };

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Meine Ziele 🎯</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Setz dir konkrete Ziele und tracke deinen Fortschritt.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}><Plus size={15} /> Ziel hinzufügen</button>
      </div>

      {showForm && (
        <div className="card grid sm:grid-cols-2 gap-3">
          <div className="flex gap-1.5 sm:col-span-2">
            {ICONS.map((i) => (
              <button key={i} className="btn btn-sm" style={{ borderColor: draft.icon === i ? 'var(--accent)' : 'var(--border)' }} onClick={() => setDraft({ ...draft, icon: i })}>{i}</button>
            ))}
          </div>
          <input className="input sm:col-span-2" placeholder="z.B. 5 km unter 25 Minuten" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input className="input" type="number" placeholder="Aktueller Wert" value={draft.current} onChange={(e) => setDraft({ ...draft, current: e.target.value })} />
          <input className="input" type="number" placeholder="Zielwert" value={draft.target} onChange={(e) => setDraft({ ...draft, target: e.target.value })} />
          <input className="input sm:col-span-2" placeholder="Einheit (kg, min, Wdh. …)" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
          <button className="btn btn-accent sm:col-span-2" onClick={handleAdd}>Speichern</button>
        </div>
      )}

      {goals.length === 0 && !showForm ? (
        <div className="card flex flex-col items-center text-center gap-3 py-14">
          <Target size={28} color="var(--text-muted)" />
          <div>
            <div className="font-bold">Noch keine Ziele</div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Leg dein erstes Ziel an und verfolge deinen Fortschritt.</p>
          </div>
          <button className="btn btn-accent" onClick={() => setShowForm(true)}>Ziel hinzufügen</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onUpdate={(patch) => handleUpdate(g, patch)} onDelete={() => deleteGoal(g.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
