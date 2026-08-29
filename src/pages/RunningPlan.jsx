import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { LEVELS, getRunningPlan, planStats } from '../lib/runningPlans';
import { Footprints, Clock, Route, Zap, BedDouble, Heart, Gauge, Play, Check } from 'lucide-react';

const DAY_OPTIONS = [2, 3, 4, 5, 6, 7];

const INTENSITY_LABEL = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' };

function paceLabel(km, min) {
  if (!km || !min) return '–';
  const paceMin = min / km;
  const m = Math.floor(paceMin);
  const s = Math.round((paceMin - m) * 60);
  return `${m}:${String(s).padStart(2, '0')} min/km`;
}

function RunLogForm({ session, onSave, onCancel }) {
  const [km, setKm] = useState(session?.distanceKm || '');
  const [min, setMin] = useState(session?.durationMin || '');
  const [hr, setHr] = useState('');
  const [kcal, setKcal] = useState('');

  return (
    <div className="card flex flex-col gap-3">
      <span className="eyebrow">{session ? session.type : 'Lauf loggen'}</span>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Distanz (km)</label>
          <input className="input" type="number" step="0.01" value={km} onChange={(e) => setKm(e.target.value)} />
        </div>
        <div>
          <label className="label">Zeit (Min)</label>
          <input className="input" type="number" value={min} onChange={(e) => setMin(e.target.value)} />
        </div>
        <div>
          <label className="label">Ø Herzfrequenz (optional)</label>
          <input className="input" type="number" value={hr} onChange={(e) => setHr(e.target.value)} />
        </div>
        <div>
          <label className="label">Kalorien (optional)</label>
          <input className="input" type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Gauge size={14} /> Pace: <b style={{ color: 'var(--text)' }}>{paceLabel(Number(km), Number(min))}</b>
      </div>
      <div className="flex gap-2">
        <button className="btn" onClick={onCancel}>Abbrechen</button>
        <button
          className="btn btn-accent"
          onClick={() => onSave({ distanceKm: Number(km) || 0, durationMin: Number(min) || 0, avgHr: hr ? Number(hr) : null, kcal: kcal ? Number(kcal) : null })}
        >
          <Check size={14} /> Lauf abschließen
        </button>
      </div>
    </div>
  );
}

function DayCard({ session, color, colorSoft, onStart }) {
  if (session.isRest) {
    return (
      <div className="card flex flex-col items-center justify-center text-center gap-2 py-8" style={{ opacity: 0.6 }}>
        <span className="eyebrow">{session.day}</span>
        <BedDouble size={22} color="var(--text-muted)" />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Pause / Regeneration</span>
      </div>
    );
  }
  return (
    <div className="card flex flex-col gap-3" style={{ borderColor: session.intensity === 'hoch' ? color : 'var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="eyebrow">{session.day}</span>
        <span className="chip" style={{ background: colorSoft, color }}>{INTENSITY_LABEL[session.intensity]}</span>
      </div>
      <div className="flex items-center gap-2">
        <Footprints size={18} color={color} />
        <span className="font-bold">{session.type}</span>
      </div>
      <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><Clock size={14} /> {session.durationLabel}</span>
        {session.distanceKm > 0 && <span className="flex items-center gap-1"><Route size={14} /> ≈ {session.distanceKm} km</span>}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{session.description}</p>
      {(session.hr || session.pace) && (
        <div className="flex flex-col gap-1 pt-2 mt-1 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          {session.hr && <span className="flex items-center gap-1.5"><Heart size={12} /> {session.hr}</span>}
          {session.pace && <span className="flex items-center gap-1.5"><Gauge size={12} /> {session.pace}</span>}
        </div>
      )}
      <button className="btn btn-accent btn-sm mt-1" onClick={onStart}><Play size={13} /> Lauf starten</button>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
        <Icon size={17} color={color} />
      </div>
      <div>
        <div className="text-lg font-extrabold leading-none">{value}</div>
        <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function RunningPlan() {
  const { runLogs, addRunLog, addXp, XP_RULES, todayStr } = useApp();
  const showToast = useToast();
  const [levelKey, setLevelKey] = useState('anfaenger');
  const [days, setDays] = useState(3);
  const [loggingSession, setLoggingSession] = useState(null); // session obj or 'adhoc' or null

  const level = LEVELS.find((l) => l.key === levelKey);
  const weekPlan = useMemo(() => getRunningPlan(levelKey, days), [levelKey, days]);
  const stats = useMemo(() => (weekPlan ? planStats(weekPlan) : null), [weekPlan]);

  const hours = stats ? Math.floor(stats.totalMin / 60) : 0;
  const mins = stats ? stats.totalMin % 60 : 0;
  const durationLabel = stats ? (hours > 0 ? `${hours} h ${mins > 0 ? mins + ' min' : ''}`.trim() : `${mins} min`) : '–';

  const handleSaveRun = async (data) => {
    const priorBest5k = Math.min(...runLogs.filter((r) => r.distanceKm >= 4.9).map((r) => r.durationMin), Infinity);
    const isNewLongest = data.distanceKm > Math.max(0, ...runLogs.map((r) => r.distanceKm));

    await addRunLog({ date: todayStr(), ...data, levelKey, days });
    let xp = XP_RULES.WORKOUT_COMPLETE;
    if (data.distanceKm >= 10) xp += XP_RULES.RUN_10K;
    if (data.distanceKm >= 4.9 && data.durationMin < priorBest5k) xp += XP_RULES.PERSONAL_RECORD;
    await addXp(xp);

    showToast('Training gespeichert ✓');
    if (data.distanceKm >= 4.9 && data.durationMin < priorBest5k) showToast('Neue persönliche Bestzeit 🏆');
    else if (isNewLongest) showToast('Neuer persönlicher Rekord 🏆');

    setLoggingSession(null);
  };

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Laufplan</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Wähle deine Leistungsstufe und Trainingstage – der passende Wochenplan wird automatisch angezeigt.
        </p>
      </div>

      <div className="card flex flex-col gap-4">
        <div>
          <span className="label">Leistungsstufe</span>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                className="btn"
                onClick={() => setLevelKey(l.key)}
                style={{
                  borderColor: levelKey === l.key ? l.color : 'var(--border)',
                  background: levelKey === l.key ? l.colorSoft : 'var(--bg-elevated)',
                  color: levelKey === l.key ? l.color : 'var(--text)',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="label">Trainingstage pro Woche</span>
          <div className="flex gap-2 flex-wrap">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                className="btn"
                onClick={() => setDays(d)}
                style={{
                  borderColor: days === d ? level.color : 'var(--border)',
                  background: days === d ? level.colorSoft : 'var(--bg-elevated)',
                  color: days === d ? level.color : 'var(--text)',
                  minWidth: 44,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatTile icon={Footprints} label="Trainingstage" value={stats.trainingDaysCount} color={level.color} />
          <StatTile icon={Clock} label="Wochenumfang" value={durationLabel} color={level.color} />
          <StatTile icon={Route} label="Gesamtdistanz" value={`≈ ${stats.totalKm} km`} color={level.color} />
          <StatTile icon={Zap} label="Intensive Einheiten" value={stats.intenseCount} color={level.color} />
          <StatTile icon={BedDouble} label="Regenerationstage" value={stats.recoveryCount} color={level.color} />
        </div>
      )}

      {loggingSession && (
        <RunLogForm
          session={loggingSession === 'adhoc' ? null : loggingSession}
          onSave={handleSaveRun}
          onCancel={() => setLoggingSession(null)}
        />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weekPlan?.map((session) => (
          <DayCard key={session.day} session={session} color={level.color} colorSoft={level.colorSoft} onStart={() => setLoggingSession(session)} />
        ))}
      </div>

      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Dauer- und Distanzangaben sind Richtwerte zur Orientierung, keine medizinische oder sportwissenschaftliche Beratung. Passe Tempo und Umfang an dein persönliches Leistungsniveau an.
      </p>
    </div>
  );
}
