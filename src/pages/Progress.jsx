import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dumbbell, Footprints, CircleDot, Trophy, Calendar as CalendarIcon } from 'lucide-react';

function sessionVolume(session) {
  return session.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0), 0);
}
function maxWeightInSession(session) {
  return Math.max(0, ...session.exercises.flatMap((ex) => ex.sets.map((s) => Number(s.weight) || 0)));
}

const TYPE_COLOR = { gym: 'var(--accent)', lauf: 'var(--blue)', basketball: 'var(--red)' };
const TYPE_LABEL = { gym: '🏋️', lauf: '🏃', basketball: '🏀' };

function MonthCalendar({ entries }) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Montag = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = useMemo(() => {
    const map = {};
    entries.forEach((e) => { (map[e.date] ||= []).push(e); });
    return map;
  }, [entries]);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button className="btn btn-sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>←</button>
        <span className="font-bold">{cursor.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
        <button className="btn btn-sm" onClick={() => setCursor(new Date(year, month + 1, 1))}>→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const ds = dateStr(d);
          const dayEntries = byDate[ds] || [];
          return (
            <button
              key={i}
              onClick={() => setSelected(ds)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs"
              style={{ background: selected === ds ? 'var(--accent-soft)' : 'var(--bg-elevated)', border: selected === ds ? '1px solid var(--accent)' : '1px solid transparent' }}
            >
              <span>{d}</span>
              <div className="flex gap-0.5">
                {dayEntries.slice(0, 3).map((e, j) => <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLOR[e.type] }} />)}
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{selected}</div>
          {(byDate[selected] || []).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Kein Training an diesem Tag.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {byDate[selected].map((e, i) => (
                <div key={i} className="text-sm flex items-center gap-2">
                  <span>{TYPE_LABEL[e.type]}</span> <span className="font-medium">{e.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Progress() {
  const { logs, runLogs, bballLogs } = useApp();

  const gymData = useMemo(
    () => [...logs].sort((a, b) => (a.date > b.date ? 1 : -1)).map((l) => ({ date: l.date.slice(5), Volumen: sessionVolume(l), MaxGewicht: maxWeightInSession(l) })),
    [logs]
  );
  const gymStats = useMemo(() => {
    const totalVolume = logs.reduce((s, l) => s + sessionVolume(l), 0);
    const maxWeight = Math.max(0, ...logs.map(maxWeightInSession));
    const totalSets = logs.reduce((s, l) => s + l.exercises.reduce((s2, e) => s2 + e.sets.length, 0), 0);
    return { totalVolume, maxWeight, totalSets, sessions: logs.length };
  }, [logs]);

  const runData = useMemo(
    () => [...runLogs].sort((a, b) => (a.date > b.date ? 1 : -1)).map((r) => ({ date: r.date.slice(5), km: Number(r.distanceKm) || 0 })),
    [runLogs]
  );
  const runStats = useMemo(() => {
    const totalKm = runLogs.reduce((s, r) => s + (Number(r.distanceKm) || 0), 0);
    const longest = Math.max(0, ...runLogs.map((r) => Number(r.distanceKm) || 0));
    const best5k = runLogs.filter((r) => Number(r.distanceKm) >= 4.9).sort((a, b) => a.durationMin - b.durationMin)[0];
    return { totalKm: Math.round(totalKm * 10) / 10, longest, best5k, count: runLogs.length };
  }, [runLogs]);

  const bballData = useMemo(
    () => [...bballLogs].sort((a, b) => (a.date > b.date ? 1 : -1)).map((b) => ({
      date: b.date.slice(5), Trefferquote: b.attempts > 0 ? Math.round((b.makes / b.attempts) * 100) : 0,
    })),
    [bballLogs]
  );
  const bballStats = useMemo(() => {
    const ft = bballLogs.reduce((a, b) => ({ makes: a.makes + (Number(b.ftMakes) || 0), att: a.att + (Number(b.ftAttempts) || 0) }), { makes: 0, att: 0 });
    return { sessions: bballLogs.length, ftPct: ft.att > 0 ? Math.round((ft.makes / ft.att) * 100) : null };
  }, [bballLogs]);

  const calendarEntries = useMemo(() => [
    ...logs.map((l) => ({ date: l.date, type: 'gym', label: l.type || 'Gym-Training' })),
    ...runLogs.map((r) => ({ date: r.date, type: 'lauf', label: `Lauf ${r.distanceKm} km` })),
    ...bballLogs.map((b) => ({ date: b.date, type: 'basketball', label: b.title || 'Basketball' })),
  ], [logs, runLogs, bballLogs]);

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Fortschritt</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Deine Entwicklung über alle Trainingsarten.</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Dumbbell size={16} color="var(--accent)" /><h3 className="font-bold">Gym</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
          <div><div className="eyebrow">Volumen gesamt</div><div className="text-lg font-extrabold">{Math.round(gymStats.totalVolume).toLocaleString('de-DE')} kg</div></div>
          <div><div className="eyebrow">Stärkstes Gewicht</div><div className="text-lg font-extrabold">{gymStats.maxWeight} kg</div></div>
          <div><div className="eyebrow">Sätze gesamt</div><div className="text-lg font-extrabold">{gymStats.totalSets}</div></div>
          <div><div className="eyebrow">Einheiten</div><div className="text-lg font-extrabold">{gymStats.sessions}</div></div>
        </div>
        {gymData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={gymData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="Volumen" stroke="var(--accent)" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Gym-Einheiten geloggt (Logbuch).</p>}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Footprints size={16} color="var(--blue)" /><h3 className="font-bold">Laufen</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
          <div><div className="eyebrow">Kilometer gesamt</div><div className="text-lg font-extrabold">{runStats.totalKm} km</div></div>
          <div><div className="eyebrow">Längster Lauf</div><div className="text-lg font-extrabold">{runStats.longest} km</div></div>
          <div><div className="eyebrow">Beste 5-km-Zeit</div><div className="text-lg font-extrabold">{runStats.best5k ? `${runStats.best5k.durationMin} min` : '–'}</div></div>
          <div><div className="eyebrow">Läufe</div><div className="text-lg font-extrabold">{runStats.count}</div></div>
        </div>
        {runData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={runData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="km" fill="var(--blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Läufe geloggt.</p>}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4"><CircleDot size={16} color="var(--red)" /><h3 className="font-bold">Basketball</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
          <div><div className="eyebrow">Trainings</div><div className="text-lg font-extrabold">{bballStats.sessions}</div></div>
          <div><div className="eyebrow">Freiwurfquote</div><div className="text-lg font-extrabold">{bballStats.ftPct != null ? `${bballStats.ftPct}%` : '–'}</div></div>
        </div>
        {bballData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bballData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="Trefferquote" stroke="var(--red)" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Noch keine Basketball-Einheiten geloggt.</p>}
      </div>

      <div className="flex items-center gap-2 mt-2"><CalendarIcon size={16} color="var(--accent)" /><h3 className="font-bold">Trainingskalender</h3></div>
      <MonthCalendar entries={calendarEntries} />
    </div>
  );
}
