import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import {
  LEVELS, WEEKDAYS, EXERCISE_POOLS, getWeekPlan, sessionExercises, categoryIcon, weekPlanStats,
} from '../lib/basketballPlans';
import {
  Play, Pause, Square, Check, SkipForward, Repeat, Plus, Clock, Target, X,
  Flame, Dumbbell, Zap, BedDouble, TrendingUp, TrendingDown,
} from 'lucide-react';

const DAY_OPTIONS = [2, 3, 4, 5, 6, 7];
const CATEGORIES = Object.keys(EXERCISE_POOLS);
const INTENSITY_LABEL = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' };

function isoWeekKey(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNo = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}

function pct(makes, attempts) {
  if (!attempts) return null;
  return Math.round((makes / attempts) * 100);
}

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div className="text-base font-extrabold leading-none">{value}</div>
        <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

function CompletionModal({ session, onClose, onSave }) {
  const [form, setForm] = useState({
    durationMin: session.durationMin,
    makes: '', attempts: '',
    ftMakes: '', ftAttempts: '',
    threeMakes: '', threeAttempts: '',
    midMakes: '', midAttempts: '',
    notes: '',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="card w-full max-w-md flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Training abschließen</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div>
          <label className="label">Trainingsdauer (Min)</label>
          <input className="input" type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Würfe getroffen</label>
            <input className="input" type="number" value={form.makes} onChange={(e) => setForm({ ...form, makes: e.target.value })} />
          </div>
          <div>
            <label className="label">Würfe versucht</label>
            <input className="input" type="number" value={form.attempts} onChange={(e) => setForm({ ...form, attempts: e.target.value })} />
          </div>
          <div>
            <label className="label">Freiwürfe getroffen</label>
            <input className="input" type="number" value={form.ftMakes} onChange={(e) => setForm({ ...form, ftMakes: e.target.value })} />
          </div>
          <div>
            <label className="label">Freiwürfe versucht</label>
            <input className="input" type="number" value={form.ftAttempts} onChange={(e) => setForm({ ...form, ftAttempts: e.target.value })} />
          </div>
          <div>
            <label className="label">Dreier getroffen</label>
            <input className="input" type="number" value={form.threeMakes} onChange={(e) => setForm({ ...form, threeMakes: e.target.value })} />
          </div>
          <div>
            <label className="label">Dreier versucht</label>
            <input className="input" type="number" value={form.threeAttempts} onChange={(e) => setForm({ ...form, threeAttempts: e.target.value })} />
          </div>
          <div>
            <label className="label">Midrange getroffen</label>
            <input className="input" type="number" value={form.midMakes} onChange={(e) => setForm({ ...form, midMakes: e.target.value })} />
          </div>
          <div>
            <label className="label">Midrange versucht</label>
            <input className="input" type="number" value={form.midAttempts} onChange={(e) => setForm({ ...form, midAttempts: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Notizen</label>
          <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn btn-accent mt-2" onClick={() => onSave(form)}>Training als abgeschlossen markieren</button>
      </div>
    </div>
  );
}

function SessionExerciseRow({ item, onToggleDone, onToggleSkip, onEditUnit, onReplace }) {
  const [editing, setEditing] = useState(false);
  const [replacing, setReplacing] = useState(false);

  return (
    <div className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: 'var(--bg-elevated)', opacity: item.skipped ? 0.45 : 1 }}>
      <button onClick={onToggleDone} title="Erledigt">
        <div className="w-5 h-5 rounded-md flex items-center justify-center border" style={{ borderColor: item.done ? 'var(--green)' : 'var(--border-strong)', background: item.done ? 'var(--green)' : 'transparent' }}>
          {item.done && <Check size={13} color="#fff" />}
        </div>
      </button>
      <span className="text-sm">{categoryIcon(item.category)}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.name}</div>
        {editing ? (
          <input className="input mt-1" style={{ padding: '2px 6px', fontSize: '0.75rem' }} autoFocus value={item.unit}
            onChange={(e) => onEditUnit(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={(e) => e.key === 'Enter' && setEditing(false)} />
        ) : (
          <button className="text-xs" style={{ color: 'var(--text-muted)' }} onClick={() => setEditing(true)}>{item.unit}</button>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button className="btn btn-ghost btn-sm" title="Überspringen" onClick={onToggleSkip}><SkipForward size={13} /></button>
        <div className="relative">
          <button className="btn btn-ghost btn-sm" title="Ersetzen" onClick={() => setReplacing((r) => !r)}><Repeat size={13} /></button>
          {replacing && (
            <div className="absolute right-0 mt-1 z-20 rounded-xl overflow-hidden max-h-48 overflow-y-auto w-56"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow)' }}>
              {CATEGORIES.map((cat) => (
                <div key={cat}>
                  <div className="px-2 py-1 text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{cat}</div>
                  {EXERCISE_POOLS[cat].map((ex) => (
                    <button key={ex.name} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent-soft)]"
                      onClick={() => { onReplace({ name: ex.name, category: cat, unit: ex.unit }); setReplacing(false); }}>
                      {ex.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BasketballPlan() {
  const { bballLogs, addBballLog, todayStr, addXp, XP_RULES } = useApp();
  const showToast = useToast();
  const [levelKey, setLevelKey] = useState('anfaenger');
  const [days, setDays] = useState(3);
  const [active, setActive] = useState(null); // { dayIdx, day, items, elapsedSec, paused, startedAt }
  const [completing, setCompleting] = useState(false);
  const [customDraft, setCustomDraft] = useState({ name: '', unit: '' });

  const level = LEVELS.find((l) => l.key === levelKey);
  const weekPlan = useMemo(() => getWeekPlan(levelKey, days), [levelKey, days]);
  const stats = useMemo(() => (weekPlan ? weekPlanStats(weekPlan) : null), [weekPlan]);

  useEffect(() => {
    if (!active || active.paused) return;
    const t = setInterval(() => setActive((a) => (a ? { ...a, elapsedSec: a.elapsedSec + 1 } : a)), 1000);
    return () => clearInterval(t);
  }, [active?.paused, active !== null]);

  const shotStats = useMemo(() => {
    const byWeek = {};
    bballLogs.forEach((l) => {
      const wk = isoWeekKey(l.date);
      byWeek[wk] = byWeek[wk] || { makes: 0, attempts: 0, ftMakes: 0, ftAttempts: 0, threeMakes: 0, threeAttempts: 0, midMakes: 0, midAttempts: 0 };
      byWeek[wk].makes += Number(l.makes) || 0;
      byWeek[wk].attempts += Number(l.attempts) || 0;
      byWeek[wk].ftMakes += Number(l.ftMakes) || 0;
      byWeek[wk].ftAttempts += Number(l.ftAttempts) || 0;
      byWeek[wk].threeMakes += Number(l.threeMakes) || 0;
      byWeek[wk].threeAttempts += Number(l.threeAttempts) || 0;
      byWeek[wk].midMakes += Number(l.midMakes) || 0;
      byWeek[wk].midAttempts += Number(l.midAttempts) || 0;
    });
    const currentWk = isoWeekKey(todayStr());
    const [y, w] = currentWk.split('-W').map(Number);
    const prevWeekNo = w > 1 ? w - 1 : 52;
    const prevWk = `${w > 1 ? y : y - 1}-W${prevWeekNo}`;
    const cur = byWeek[currentWk];
    const prev = byWeek[prevWk];
    if (!cur) return null;
    const curPct = pct(cur.makes, cur.attempts);
    const prevPct = prev ? pct(prev.makes, prev.attempts) : null;
    return {
      fieldPct: curPct, ftPct: pct(cur.ftMakes, cur.ftAttempts), threePct: pct(cur.threeMakes, cur.threeAttempts), midPct: pct(cur.midMakes, cur.midAttempts),
      diff: curPct != null && prevPct != null ? curPct - prevPct : null,
    };
  }, [bballLogs, todayStr]);

  const startSession = (dayIdx, day) => {
    const items = sessionExercises(day).map((e) => ({ ...e, done: false, skipped: false }));
    setActive({ dayIdx, day, items, elapsedSec: 0, paused: false });
  };

  const updateItems = (fn) => setActive((a) => (a ? { ...a, items: fn(a.items) } : a));

  const handleSaveCompletion = async (form) => {
    await addBballLog({
      date: todayStr(),
      levelKey, days, weekday: active.day.day, title: active.day.title,
      durationMin: Number(form.durationMin) || active.day.durationMin,
      exercises: active.items,
      makes: form.makes, attempts: form.attempts,
      ftMakes: form.ftMakes, ftAttempts: form.ftAttempts,
      threeMakes: form.threeMakes, threeAttempts: form.threeAttempts,
      midMakes: form.midMakes, midAttempts: form.midAttempts,
      notes: form.notes,
      completedAt: new Date().toISOString(),
    });
    const madeAttempts = Number(form.attempts) || 0;
    const madeMakes = Number(form.makes) || 0;
    let xp = XP_RULES.WORKOUT_COMPLETE;
    if (madeAttempts > 0 && madeMakes / madeAttempts >= 0.7) xp += XP_RULES.PERSONAL_RECORD;
    await addXp(xp);
    showToast('Training gespeichert ✓');
    setCompleting(false);
    setActive(null);
  };

  const addCustomExercise = () => {
    if (!customDraft.name.trim()) return;
    updateItems((items) => [...items, { name: customDraft.name, category: 'Custom', unit: customDraft.unit || '—', done: false, skipped: false }]);
    setCustomDraft({ name: '', unit: '' });
  };

  const fmtTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">🏀 Basketball Einzeltraining</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Komplett alleine trainierbar — kein Mitspieler, kein Trainer nötig.
        </p>
      </div>

      <div className="card flex flex-col gap-4">
        <div>
          <span className="label">Leistungsstufe</span>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((l) => (
              <button key={l.key} className="btn" onClick={() => setLevelKey(l.key)}
                style={{ borderColor: levelKey === l.key ? l.color : 'var(--border)', background: levelKey === l.key ? l.colorSoft : 'var(--bg-elevated)', color: levelKey === l.key ? l.color : 'var(--text)' }}>
                {l.emoji} {l.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="label">Trainingstage pro Woche</span>
          <div className="flex gap-2 flex-wrap">
            {DAY_OPTIONS.map((dcount) => (
              <button key={dcount} className="btn" onClick={() => setDays(dcount)}
                style={{ borderColor: days === dcount ? level.color : 'var(--border)', background: days === dcount ? level.colorSoft : 'var(--bg-elevated)', color: days === dcount ? level.color : 'var(--text)', minWidth: 44 }}>
                {dcount}
              </button>
            ))}
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <StatTile icon={Dumbbell} label="Trainingstage" value={stats.trainingDaysCount} color={level.color} />
          <StatTile icon={Clock} label="Gesamtzeit" value={`${stats.totalMin} min`} color={level.color} />
          <StatTile icon={Target} label="Würfe" value={stats.shots} color={level.color} />
          <StatTile icon={Target} label="Freiwürfe" value={stats.freeThrows} color={level.color} />
          <StatTile icon={Flame} label="Ballhandling" value={stats.ballhandlingCount} color={level.color} />
          <StatTile icon={Zap} label="Finishing" value={stats.finishingCount} color={level.color} />
          <StatTile icon={Target} label="Shooting-Einheiten" value={stats.shootingCount} color={level.color} />
          <StatTile icon={BedDouble} label="Regeneration" value={stats.recoveryCount} color={level.color} />
        </div>
      )}

      {shotStats && (
        <div className="card flex flex-wrap gap-6">
          <div>
            <div className="eyebrow mb-1">Trefferquote</div>
            <div className="text-xl font-extrabold">{shotStats.fieldPct ?? '–'}%</div>
          </div>
          <div>
            <div className="eyebrow mb-1">Freiwurfquote</div>
            <div className="text-xl font-extrabold">{shotStats.ftPct ?? '–'}%</div>
          </div>
          <div>
            <div className="eyebrow mb-1">Dreierquote</div>
            <div className="text-xl font-extrabold">{shotStats.threePct ?? '–'}%</div>
          </div>
          <div>
            <div className="eyebrow mb-1">Midrange-Quote</div>
            <div className="text-xl font-extrabold">{shotStats.midPct ?? '–'}%</div>
          </div>
          {shotStats.diff != null && (
            <div>
              <div className="eyebrow mb-1">Vs. Vorwoche</div>
              <div className="text-xl font-extrabold flex items-center gap-1" style={{ color: shotStats.diff >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {shotStats.diff >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} {shotStats.diff > 0 ? '+' : ''}{shotStats.diff}%
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {weekPlan?.map((day, dayIdx) => {
          const isRestDay = day.isRest || day.title === 'Regeneration';
          const exs = sessionExercises(day);
          const isActiveDay = active?.dayIdx === dayIdx;
          return (
            <div key={day.day} className="card flex flex-col gap-3" style={{ borderColor: isRestDay ? 'var(--border)' : (day.intensity === 'hoch' ? level.color : 'var(--border)') }}>
              <div className="flex items-center justify-between">
                <span className="eyebrow">{day.day}</span>
                {!isRestDay && <span className="chip" style={{ background: level.colorSoft, color: level.color }}>{INTENSITY_LABEL[day.intensity]}</span>}
              </div>

              {isRestDay ? (
                <div className="flex flex-col items-center justify-center text-center gap-2 py-6" style={{ opacity: 0.6 }}>
                  <BedDouble size={20} color="var(--text-muted)" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{day.title === 'Regeneration' ? 'Regeneration' : 'Pause'}</span>
                </div>
              ) : (
                <>
                  <div className="font-bold flex items-center gap-1.5">{categoryIcon(day.themes?.[0])} {day.title}</div>
                  <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Clock size={12} /> {day.durationLabel}</span>
                    <span>{exs.length} Übungen</span>
                  </div>

                  {!isActiveDay && (
                    <ul className="text-xs flex flex-col gap-1" style={{ color: 'var(--text-muted)' }}>
                      {exs.slice(0, 4).map((e, i) => <li key={i}>• {e.name} — {e.unit}</li>)}
                      {exs.length > 4 && <li>+ {exs.length - 4} weitere…</li>}
                    </ul>
                  )}

                  {isActiveDay ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--accent-soft)' }}>
                        <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>{fmtTime(active.elapsedSec)}</span>
                        <div className="flex gap-1">
                          <button className="btn btn-sm" onClick={() => setActive((a) => ({ ...a, paused: !a.paused }))}>
                            {active.paused ? <Play size={13} /> : <Pause size={13} />}
                          </button>
                          <button className="btn btn-sm btn-accent" onClick={() => setCompleting(true)}><Square size={13} /> Beenden</button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
                        {active.items.map((item, i) => (
                          <SessionExerciseRow
                            key={i}
                            item={item}
                            onToggleDone={() => updateItems((items) => items.map((it, j) => (j === i ? { ...it, done: !it.done } : it)))}
                            onToggleSkip={() => updateItems((items) => items.map((it, j) => (j === i ? { ...it, skipped: !it.skipped } : it)))}
                            onEditUnit={(unit) => updateItems((items) => items.map((it, j) => (j === i ? { ...it, unit } : it)))}
                            onReplace={(next) => updateItems((items) => items.map((it, j) => (j === i ? { ...it, ...next, done: false, skipped: false } : it)))}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input className="input" placeholder="Eigene Übung…" value={customDraft.name} onChange={(e) => setCustomDraft({ ...customDraft, name: e.target.value })} />
                        <input className="input w-24" placeholder="Einheit" value={customDraft.unit} onChange={(e) => setCustomDraft({ ...customDraft, unit: e.target.value })} />
                        <button className="btn btn-sm" onClick={addCustomExercise}><Plus size={13} /></button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-accent w-full justify-center" onClick={() => startSession(dayIdx, day)}>
                      <Play size={14} /> Training starten
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {completing && active && (
        <CompletionModal session={active.day} onClose={() => setCompleting(false)} onSave={handleSaveCompletion} />
      )}

      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Alle Angaben sind Richtwerte. Abgeschlossene Trainingseinheiten werden dauerhaft gespeichert und bleiben auch bei Wechsel von Leistungsstufe oder Trainingstagen erhalten.
      </p>
    </div>
  );
}
