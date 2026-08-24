import { useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Dumbbell, Footprints, CircleDot } from 'lucide-react';
import Plan from './Plan';
import RunningPlan from './RunningPlan';
import BasketballPlan from './BasketballPlan';

const TABS = [
  { key: 'gym', label: 'Gym', emoji: '🏋️', icon: Dumbbell, color: 'var(--accent)', colorSoft: 'var(--accent-soft)' },
  { key: 'laufen', label: 'Laufen', emoji: '🏃', icon: Footprints, color: 'var(--blue)', colorSoft: 'rgba(59,130,246,0.15)' },
  { key: 'basketball', label: 'Basketball', emoji: '🏀', icon: CircleDot, color: 'var(--red)', colorSoft: 'rgba(239,68,68,0.15)' },
];
const VALID_KEYS = TABS.map((t) => t.key);
const STORAGE_KEY = 'fittrack-training-tab';

export default function Training() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const isValid = VALID_KEYS.includes(tab);

  useEffect(() => {
    if (isValid) localStorage.setItem(STORAGE_KEY, tab);
  }, [tab, isValid]);

  // Kein gültiges Tab in der URL → letzten genutzten Bereich (oder Gym) laden, ohne vollen Reload.
  if (!isValid) {
    const last = localStorage.getItem(STORAGE_KEY);
    return <Navigate to={`/training/${VALID_KEYS.includes(last) ? last : 'gym'}`} replace />;
  }

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Training</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Deine Trainingsbereiche</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => navigate(`/training/${t.key}`)}
              className="btn shrink-0"
              style={{
                borderColor: active ? t.color : 'var(--border)',
                background: active ? t.colorSoft : 'var(--bg-elevated)',
                color: active ? t.color : 'var(--text)',
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={16} />
              <span>{t.emoji} {t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Alle drei Bereiche bleiben gemountet, damit Auswahl/Zustand beim Tab-Wechsel erhalten bleibt. */}
      <div style={{ display: tab === 'gym' ? 'block' : 'none' }}>
        <Plan />
      </div>
      <div style={{ display: tab === 'laufen' ? 'block' : 'none' }}>
        <RunningPlan />
      </div>
      <div style={{ display: tab === 'basketball' ? 'block' : 'none' }}>
        <BasketballPlan />
      </div>
    </div>
  );
}
