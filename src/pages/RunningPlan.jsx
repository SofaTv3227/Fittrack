import { useMemo, useState } from 'react';
import { LEVELS, getRunningPlan, planStats } from '../lib/runningPlans';
import { Footprints, Clock, Route, Zap, BedDouble, Heart, Gauge } from 'lucide-react';

const DAY_OPTIONS = [2, 3, 4, 5, 6, 7];

const INTENSITY_LABEL = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' };

function DayCard({ session, color, colorSoft }) {
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
  const [levelKey, setLevelKey] = useState('anfaenger');
  const [days, setDays] = useState(3);

  const level = LEVELS.find((l) => l.key === levelKey);
  const weekPlan = useMemo(() => getRunningPlan(levelKey, days), [levelKey, days]);
  const stats = useMemo(() => (weekPlan ? planStats(weekPlan) : null), [weekPlan]);

  const hours = stats ? Math.floor(stats.totalMin / 60) : 0;
  const mins = stats ? stats.totalMin % 60 : 0;
  const durationLabel = stats ? (hours > 0 ? `${hours} h ${mins > 0 ? mins + ' min' : ''}`.trim() : `${mins} min`) : '–';

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weekPlan?.map((session) => (
          <DayCard key={session.day} session={session} color={level.color} colorSoft={level.colorSoft} />
        ))}
      </div>

      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Dauer- und Distanzangaben sind Richtwerte zur Orientierung, keine medizinische oder sportwissenschaftliche Beratung. Passe Tempo und Umfang an dein persönliches Leistungsniveau an.
      </p>
    </div>
  );
}
