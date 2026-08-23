import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { todayQuote } from '../lib/quotes';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import { Quote, Dumbbell, Moon, Flame, TrendingUp, Calendar } from 'lucide-react';

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sumMeals(meals) {
  return meals.reduce((acc, m) => ({
    kcal: acc.kcal + (m.kcal || 0), protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0), fat: acc.fat + (m.fat || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

function sessionVolume(session) {
  return session.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0), 0);
}

export default function Dashboard() {
  const { profile, plan, logs, meals, deviceData, settings, targetCalories, targetMacros, todayStr } = useApp();

  const today = todayStr();
  const quote = useMemo(() => todayQuote(), []);

  const weekStats = useMemo(() => {
    const wStart = startOfWeek(new Date());
    const weekLogs = logs.filter((l) => new Date(l.date) >= wStart);
    const totalVolume = weekLogs.reduce((s, l) => s + sessionVolume(l), 0);
    const burnedFromLogs = weekLogs.length * 250; // grobe Schätzung falls kein Tracker
    const trackerBurned = deviceData.filter((d) => d.type_ === 'activity' && new Date(d.date) >= wStart).reduce((s, a) => s + (a.kcal || 0), 0);
    return { sessions: weekLogs.length, totalVolume, burned: trackerBurned || burnedFromLogs };
  }, [logs, deviceData]);

  const streak = useMemo(() => {
    const dates = new Set(logs.map((l) => l.date));
    let count = 0;
    let d = new Date();
    while (dates.has(d.toISOString().slice(0, 10))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [logs]);

  const nextWorkout = plan?.days?.[logs.length % (plan?.days?.length || 1)];

  const lastSleep = useMemo(() => {
    const rows = deviceData.filter((d) => d.type_ === 'sleep').sort((a, b) => (a.date > b.date ? -1 : 1));
    return rows[0];
  }, [deviceData]);

  const todayTotals = useMemo(() => sumMeals(meals.filter((m) => m.date === today)), [meals, today]);
  const burnedToday = useMemo(() => deviceData.filter((d) => d.type_ === 'activity' && d.date === today).reduce((s, a) => s + (a.kcal || 0), 0), [deviceData, today]);

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Hallo{profile.name ? `, ${profile.name}` : ''} 👋</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Hier ist dein Überblick für heute.</p>
      </div>

      <div className="card flex items-start gap-3" style={{ background: 'linear-gradient(120deg, var(--accent-soft), var(--bg-card))' }}>
        <Quote size={22} color="var(--accent)" className="shrink-0 mt-0.5" />
        <p className="text-sm italic leading-relaxed">{quote}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2"><Dumbbell size={16} color="var(--accent)" /><span className="eyebrow">Nächstes Training</span></div>
          {nextWorkout ? (
            <>
              <div className="text-lg font-bold">{nextWorkout.name}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{nextWorkout.exercises.length} Übungen</div>
              <Link to="/plan" className="text-xs mt-2 inline-block" style={{ color: 'var(--accent)' }}>Plan ansehen →</Link>
            </>
          ) : <Link to="/profil" className="text-sm" style={{ color: 'var(--accent)' }}>Profil ausfüllen →</Link>}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} color="var(--accent)" /><span className="eyebrow">Wochenstatistik</span></div>
          <div className="text-lg font-bold">{weekStats.sessions} Einheiten</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{weekStats.totalVolume.toLocaleString('de-DE')} kg Volumen</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>~{Math.round(weekStats.burned)} kcal verbrannt</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2"><Moon size={16} color="var(--blue)" /><span className="eyebrow">Schlaf letzte Nacht</span></div>
          {lastSleep ? (
            <>
              <div className="text-lg font-bold">{Math.round((lastSleep.totalMin / 60) * 10) / 10} h</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Score: {lastSleep.score}/100</div>
            </>
          ) : <Link to="/geraete" className="text-sm" style={{ color: 'var(--accent)' }}>Gerät verbinden →</Link>}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2"><Flame size={16} color="var(--accent-2)" /><span className="eyebrow">Streak</span></div>
          <div className="text-lg font-bold">{streak} Tage in Folge</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Weiter so!</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card flex flex-col items-center">
          <span className="eyebrow mb-2">Kalorien heute</span>
          <CalorieRing target={targetCalories || 0} eaten={todayTotals.kcal} burned={burnedToday} addBurned={settings.addBurnedCalories} />
          <Link to="/ernaehrung" className="text-xs mt-2" style={{ color: 'var(--accent)' }}>Ernährung öffnen →</Link>
        </div>
        <div className="card flex flex-col gap-4 justify-center">
          <span className="eyebrow">Makro-Fortschritt</span>
          <MacroBar label="Protein" current={todayTotals.protein} target={targetMacros.protein} color="var(--blue)" />
          <MacroBar label="Kohlenhydrate" current={todayTotals.carbs} target={targetMacros.carbs} color="var(--accent)" />
          <MacroBar label="Fett" current={todayTotals.fat} target={targetMacros.fat} color="var(--yellow)" />
        </div>
      </div>

      <div className="card flex items-center gap-3">
        <Calendar size={16} color="var(--text-muted)" />
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Alle Daten werden lokal in deinem Browser gespeichert – kein Login, keine Cloud-Übertragung.
        </span>
      </div>
    </div>
  );
}
