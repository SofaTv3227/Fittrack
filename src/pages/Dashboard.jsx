import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { todayQuote } from '../lib/quotes';
import { weekStats as calcWeekStats } from '../lib/gamification';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import { Quote, Dumbbell, Flame, Calendar, ChevronRight, Trophy } from 'lucide-react';

function sumMeals(meals) {
  return meals.reduce((acc, m) => ({
    kcal: acc.kcal + (m.kcal || 0), protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0), fat: acc.fat + (m.fat || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export default function Dashboard() {
  const { profile, plan, logs, runLogs, bballLogs, meals, deviceData, settings, targetCalories, targetMacros, todayStr, streak, longestStreak, levelInfo } = useApp();

  const today = todayStr();
  const quote = useMemo(() => todayQuote(), []);
  const dateLabel = useMemo(() => new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }), []);

  const week = useMemo(() => calcWeekStats({ logs, runLogs, bballLogs }, 6), [logs, runLogs, bballLogs]);

  const nextWorkout = plan?.days?.[logs.length % (plan?.days?.length || 1)];

  const todayTotals = useMemo(() => sumMeals(meals.filter((m) => m.date === today)), [meals, today]);
  const burnedToday = useMemo(() => deviceData.filter((d) => d.type_ === 'activity' && d.date === today).reduce((s, a) => s + (a.kcal || 0), 0), [deviceData, today]);

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">{greeting()}{profile.name ? `, ${profile.name}` : ''} 👋</h1>
        <p className="text-sm mt-1 capitalize" style={{ color: 'var(--text-muted)' }}>{dateLabel}</p>
      </div>

      <div className="card flex items-start gap-3" style={{ background: 'linear-gradient(120deg, var(--accent-soft), var(--bg-card))' }}>
        <Quote size={22} color="var(--accent)" className="shrink-0 mt-0.5" />
        <p className="text-sm italic leading-relaxed">{quote}</p>
      </div>

      {/* Heute */}
      <div className="card">
        <span className="eyebrow mb-3 block">Heute</span>
        {nextWorkout ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-soft)' }}>
                <Dumbbell size={20} color="var(--accent)" />
              </div>
              <div>
                <div className="font-bold text-lg">{plan.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{nextWorkout.name} · {nextWorkout.exercises.length} Übungen</div>
              </div>
            </div>
            <Link to="/training/gym" className="btn btn-accent">Training starten <ChevronRight size={15} /></Link>
          </div>
        ) : (
          <Link to="/profil" className="text-sm" style={{ color: 'var(--accent)' }}>Profil ausfüllen, um einen Trainingsplan zu erhalten →</Link>
        )}
      </div>

      {/* Wochenfortschritt + Streak */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <span className="eyebrow mb-2 block">Diese Woche</span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-extrabold">{week.totalSessions}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ {week.targetSessionsPerWeek} Trainings</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${week.pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Laufkilometer</div><div className="font-bold">{week.runKm} km</div></div>
            <div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Trainingszeit</div><div className="font-bold">{week.totalMin} min</div></div>
            <div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Streak</div><div className="font-bold">{streak} 🔥</div></div>
          </div>
        </div>

        <div className="card flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1"><Flame size={18} color="var(--accent-2)" /><span className="eyebrow">Streak</span></div>
          <div className="text-3xl font-extrabold">{streak} Tage</div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {streak > 0 ? 'Trainiere heute, um deinen Streak zu behalten.' : 'Starte heute deinen neuen Streak!'}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Längster Streak: <b style={{ color: 'var(--text)' }}>{longestStreak}</b></span>
            <span className="flex items-center gap-1"><Trophy size={13} color="var(--accent-2)" /> Level {levelInfo.level}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min((levelInfo.xpIntoLevel / levelInfo.xpForNextLevel) * 100, 100)}%`, background: 'var(--accent-2)' }} />
          </div>
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
