// Basketball-Einzeltraining: 3 Leistungsstufen x 6 Trainingstage-Optionen.
// Alle Übungen sind reine Einzeltraining-Drills (kein Partner/Gegner nötig).

export const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export const LEVELS = [
  { key: 'anfaenger', label: 'Anfänger', emoji: '🟢', color: '#22c55e', colorSoft: 'rgba(34,197,94,0.15)' },
  { key: 'fortgeschritten', label: 'Fortgeschritten', emoji: '🔵', color: '#3b82f6', colorSoft: 'rgba(59,130,246,0.15)' },
  { key: 'profi', label: 'Profi', emoji: '🔴', color: '#ef4444', colorSoft: 'rgba(239,68,68,0.15)' },
];

// ───────────────────────── Übungs-Pools (nur Einzeltraining) ─────────────────────────

export const EXERCISE_POOLS = {
  Ballhandling: [
    { name: 'Stationary Dribbling', unit: '3×30 Sek.' },
    { name: 'Pound Dribbles', unit: '3×30 Sek.' },
    { name: 'Crossover', unit: '3×30 Sek.' },
    { name: 'Between the Legs', unit: '3×30 Sek.' },
    { name: 'Behind the Back', unit: '3×30 Sek.' },
    { name: 'In-and-Out', unit: '3×30 Sek.' },
    { name: 'Hesitation', unit: '3×30 Sek.' },
    { name: 'Change of Pace', unit: '3×30 Sek.' },
    { name: 'Change of Direction', unit: '3×30 Sek.' },
    { name: 'Cone Dribbling', unit: '5 Durchgänge' },
    { name: 'Full-Court Speed Dribbling', unit: '5× Full Court' },
  ],
  Shooting: [
    { name: 'Form Shooting', unit: '20 Würfe' },
    { name: 'Spot Shooting', unit: '5 Spots × 5 Würfe' },
    { name: 'Self-Pass Shooting', unit: '15 Würfe' },
    { name: 'Catch-and-Shoot (Self-Pass)', unit: '15 Würfe' },
    { name: 'Pull-up', unit: '10 Würfe' },
    { name: 'Stepback', unit: '10 Würfe' },
    { name: 'Midrange', unit: '15 Würfe' },
    { name: 'Dreier', unit: '15 Würfe' },
    { name: 'Freiwürfe', unit: '10 Würfe' },
    { name: 'Shooting off the Dribble', unit: '10 Würfe' },
    { name: 'Shooting under Fatigue', unit: '10 Würfe nach Sprint' },
  ],
  Finishing: [
    { name: 'Right-Hand Layup', unit: '10 Wiederholungen' },
    { name: 'Left-Hand Layup', unit: '10 Wiederholungen' },
    { name: 'Reverse Layup', unit: '8 Wiederholungen' },
    { name: 'Eurostep', unit: '8 Wiederholungen' },
    { name: 'Floater', unit: '8 Wiederholungen' },
    { name: 'Pro Hop', unit: '8 Wiederholungen' },
    { name: 'Spin Move Finish', unit: '8 Wiederholungen' },
    { name: 'Weak-Hand Finishing', unit: '10 Wiederholungen' },
    { name: 'Contact-Finish-Simulation', unit: '8 Wiederholungen' },
  ],
  Footwork: [
    { name: 'Jump Stop', unit: '3×10' },
    { name: 'Pivoting', unit: '3×10' },
    { name: 'Jab Step', unit: '3×10' },
    { name: 'Drop Step', unit: '3×10' },
    { name: 'Triple Threat', unit: '3×10' },
    { name: 'Defensive Slides', unit: '4×20 Sek.' },
    { name: 'Closeout Simulation', unit: '4×20 Sek.' },
    { name: 'Lateral Shuffle', unit: '4×20 Sek.' },
  ],
  Athletik: [
    { name: 'Sprints', unit: '6× Full Court' },
    { name: 'Shuttle Runs', unit: '4 Durchgänge' },
    { name: 'Suicides', unit: '3 Durchgänge' },
    { name: 'Lateral Bounds', unit: '3×10' },
    { name: 'Jump Squats', unit: '3×12' },
    { name: 'Broad Jumps', unit: '3×8' },
    { name: 'Vertical Jumps', unit: '3×8' },
    { name: 'Agility Cone Drills', unit: '4 Durchgänge' },
    { name: 'Reaction Drills', unit: '4 Durchgänge' },
  ],
  'Game-Simulation': [
    { name: '10 Sekunden → Ballhandling → Pull-up', unit: '5 Wiederholungen' },
    { name: 'Baseline → Sprint → Layup', unit: '5 Wiederholungen' },
    { name: 'Cone als imaginärer Verteidiger → Crossover → Drive → Finish', unit: '5 Wiederholungen' },
    { name: 'Wing → Jab Step → Drive → Pull-up', unit: '5 Wiederholungen' },
    { name: 'Top of the Key → Crossover → Stepback → Dreier', unit: '5 Wiederholungen' },
    { name: 'Full-Court Sprint → Pull-up', unit: '5 Wiederholungen' },
    { name: '5 Spots → jeweils 5 Würfe', unit: '1 Durchgang' },
    { name: 'Freiwurf nach Sprint', unit: '5 Wiederholungen' },
    { name: '3-Punkt-Wurf nach Ballhandling', unit: '5 Wiederholungen' },
  ],
};

const CATEGORY_ICON = {
  Ballhandling: '🏀', Shooting: '🎯', Finishing: '🏃', Footwork: '👟', Athletik: '⚡', 'Game-Simulation': '🕹️', Regeneration: '💤',
};

// Deterministische Auswahl aus einem Pool (kein Zufall — gleiche Eingabe = gleiches Ergebnis).
function pick(pool, count, offset = 0) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(pool[(offset + i) % pool.length]);
  return out;
}

// Stellt automatisch eine Trainingseinheit aus den Übungs-Pools zusammen, passend zu Thema/Dauer.
export function composeSession(themes, durationMin, seedOffset = 0) {
  if (themes.includes('Regeneration')) {
    return [
      { name: 'Leichtes Auslaufen / Mobility', category: 'Regeneration', unit: '10 Min' },
      { name: 'Dehnen & Foam Rolling', category: 'Regeneration', unit: '15 Min' },
      { name: 'Freiwürfe (locker, ohne Zeitdruck)', category: 'Shooting', unit: '20 Würfe' },
    ];
  }

  const exercises = [];
  const warmupMin = durationMin >= 50 ? 10 : 5;
  exercises.push({ name: 'Aufwärmen (Dribbling + Dehnen)', category: 'Ballhandling', unit: `${warmupMin} Min` });

  // Anzahl Übungen grob proportional zur Dauer (nach Abzug Warm-up), verteilt auf die Themen.
  const workMin = Math.max(durationMin - warmupMin, 15);
  const perTheme = Math.max(Math.round(workMin / (themes.length * 12)), 1);

  themes.forEach((theme, i) => {
    const pool = EXERCISE_POOLS[theme];
    if (!pool) return;
    pick(pool, perTheme + 1, seedOffset + i * 3).forEach((item) => {
      exercises.push({ name: item.name, category: theme, unit: item.unit });
    });
  });

  if (themes.includes('Shooting') || themes.includes('Finishing') || themes.includes('Game-Simulation')) {
    exercises.push({ name: 'Freiwürfe', category: 'Shooting', unit: durationMin >= 90 ? '15 Würfe' : '10 Würfe' });
  }

  return exercises;
}

function d(day, title, durationLabel, durationMin, intensity, themes, fixedExercises) {
  return { day, title, durationLabel, durationMin, intensity, themes, exercises: fixedExercises || null };
}

// Exakte, vom Nutzer vorgegebene Übungslisten für die ausführlich beschriebenen 2-Tage-Pläne.
const A2_MO = [
  { name: 'Aufwärmen', category: 'Athletik', unit: '5 Min' },
  { name: 'Dribbling rechte/linke Hand', category: 'Ballhandling', unit: '10 Min' },
  { name: 'Crossover-Grundlagen', category: 'Ballhandling', unit: '10 Min' },
  { name: 'Layups rechts/links', category: 'Finishing', unit: '10 Min' },
  { name: 'Einfache Finishes', category: 'Finishing', unit: '5 Min' },
  { name: 'Freiwürfe', category: 'Shooting', unit: '5 Min' },
];
const A2_DO = [
  { name: 'Aufwärmen', category: 'Athletik', unit: '5 Min' },
  { name: 'Form Shooting', category: 'Shooting', unit: '10 Min' },
  { name: 'Würfe aus kurzer/mittlerer Distanz', category: 'Shooting', unit: '15 Min' },
  { name: 'Würfe nach eigenem Dribbling', category: 'Shooting', unit: '10 Min' },
  { name: 'Freiwürfe', category: 'Shooting', unit: '5 Min' },
];
const F2_DI = [
  { name: 'Warm-up', category: 'Athletik', unit: '10 Min' },
  { name: 'Advanced Ballhandling', category: 'Ballhandling', unit: '15 Min' },
  { name: 'Change of Pace', category: 'Ballhandling', unit: '15 Min' },
  { name: 'Finishing', category: 'Finishing', unit: '15 Min' },
  { name: 'Freiwürfe', category: 'Shooting', unit: '5 Min' },
];
const F2_SA = [
  { name: 'Warm-up', category: 'Athletik', unit: '10 Min' },
  { name: 'Form Shooting', category: 'Shooting', unit: '15 Min' },
  { name: 'Catch-and-Shoot durch Self-Pass', category: 'Shooting', unit: '20 Min' },
  { name: 'Pull-ups', category: 'Shooting', unit: '20 Min' },
  { name: 'Freiwürfe', category: 'Shooting', unit: '10 Min' },
];
const P2_MI = [
  { name: 'Warm-up', category: 'Athletik', unit: '10 Min' },
  { name: 'Advanced Ballhandling', category: 'Ballhandling', unit: '20 Min' },
  { name: 'Change of Direction', category: 'Ballhandling', unit: '20 Min' },
  { name: 'Finishing', category: 'Finishing', unit: '20 Min' },
  { name: 'Pull-ups', category: 'Shooting', unit: '15 Min' },
  { name: 'Freiwürfe', category: 'Shooting', unit: '5 Min' },
];
const P2_SA = [
  { name: 'Form Shooting', category: 'Shooting', unit: '15 Min' },
  { name: 'Self-Pass Catch-and-Shoot', category: 'Shooting', unit: '20 Min' },
  { name: 'Pull-ups', category: 'Shooting', unit: '20 Min' },
  { name: 'Stepbacks', category: 'Shooting', unit: '20 Min' },
  { name: 'Dreier', category: 'Shooting', unit: '20 Min' },
  { name: 'Shooting under Fatigue', category: 'Shooting', unit: '15 Min' },
  { name: 'Freiwürfe', category: 'Shooting', unit: '10 Min' },
];

// ───────────────────────── ANFÄNGER ─────────────────────────

const anfaenger = {
  2: [
    d('Montag', 'Ballhandling + Finishing', '45 Min', 45, 'mittel', ['Ballhandling', 'Finishing'], A2_MO),
    d('Donnerstag', 'Shooting', '45 Min', 45, 'mittel', ['Shooting'], A2_DO),
  ],
  3: [
    d('Montag', 'Ballhandling', '45 Min', 45, 'mittel', ['Ballhandling']),
    d('Dienstag', 'Shooting', '45 Min', 45, 'mittel', ['Shooting']),
    d('Samstag', 'Finishing + Shooting', '60 Min', 60, 'hoch', ['Finishing', 'Shooting']),
  ],
  4: [
    d('Montag', 'Ballhandling', '45 Min', 45, 'mittel', ['Ballhandling']),
    d('Dienstag', 'Shooting', '50 Min', 50, 'mittel', ['Shooting']),
    d('Donnerstag', 'Footwork + Finishing', '45 Min', 45, 'mittel', ['Footwork', 'Finishing']),
    d('Samstag', 'Shooting + Freiwürfe', '60 Min', 60, 'hoch', ['Shooting']),
  ],
  5: [
    d('Montag', 'Ballhandling', '45 Min', 45, 'mittel', ['Ballhandling']),
    d('Dienstag', 'Shooting', '50 Min', 50, 'mittel', ['Shooting']),
    d('Mittwoch', 'Athletik + Footwork', '30 Min', 30, 'niedrig', ['Athletik', 'Footwork']),
    d('Freitag', 'Finishing', '50 Min', 50, 'mittel', ['Finishing']),
    d('Sonntag', 'Shooting + Freiwürfe', '60 Min', 60, 'hoch', ['Shooting']),
  ],
  6: [
    d('Montag', 'Ballhandling', '45 Min', 45, 'mittel', ['Ballhandling']),
    d('Dienstag', 'Shooting', '50 Min', 50, 'mittel', ['Shooting']),
    d('Mittwoch', 'Athletik + Footwork', '30 Min', 30, 'niedrig', ['Athletik', 'Footwork']),
    d('Donnerstag', 'Finishing', '50 Min', 50, 'mittel', ['Finishing']),
    d('Freitag', 'Ballhandling + Shooting', '45 Min', 45, 'mittel', ['Ballhandling', 'Shooting']),
    d('Samstag', 'Game-Simulation', '60 Min', 60, 'hoch', ['Game-Simulation']),
    d('Sonntag', 'Regeneration', '—', 0, null, ['Regeneration']),
  ],
  7: [
    d('Montag', 'Ballhandling', '45 Min', 45, 'mittel', ['Ballhandling']),
    d('Dienstag', 'Shooting', '50 Min', 50, 'mittel', ['Shooting']),
    d('Mittwoch', 'Athletik', '30 Min', 30, 'niedrig', ['Athletik']),
    d('Donnerstag', 'Finishing', '50 Min', 50, 'mittel', ['Finishing']),
    d('Freitag', 'Ballhandling + Shooting', '45 Min', 45, 'mittel', ['Ballhandling', 'Shooting']),
    d('Samstag', 'Game-Simulation', '60 Min', 60, 'hoch', ['Game-Simulation']),
    d('Sonntag', 'Recovery Shooting', '30 Min', 30, 'niedrig', ['Shooting']),
  ],
};

// ─────────────────────── FORTGESCHRITTEN ───────────────────────

const fortgeschritten = {
  2: [
    d('Dienstag', 'Ballhandling + Finishing', '60 Min', 60, 'hoch', ['Ballhandling', 'Finishing'], F2_DI),
    d('Samstag', 'Shooting', '75 Min', 75, 'hoch', ['Shooting'], F2_SA),
  ],
  3: [
    d('Dienstag', 'Ballhandling + Finishing', '60 Min', 60, 'hoch', ['Ballhandling', 'Finishing']),
    d('Donnerstag', 'Shooting', '60 Min', 60, 'hoch', ['Shooting']),
    d('Samstag', 'Game-Simulation', '75 Min', 75, 'hoch', ['Game-Simulation']),
  ],
  4: [
    d('Montag', 'Ballhandling + Finishing', '60 Min', 60, 'hoch', ['Ballhandling', 'Finishing']),
    d('Mittwoch', 'Shooting', '70 Min', 70, 'hoch', ['Shooting']),
    d('Freitag', 'Athletik + Footwork', '50 Min', 50, 'mittel', ['Athletik', 'Footwork']),
    d('Sonntag', 'Game-Simulation', '90 Min', 90, 'hoch', ['Game-Simulation']),
  ],
  5: [
    d('Montag', 'Ballhandling', '60 Min', 60, 'hoch', ['Ballhandling']),
    d('Dienstag', 'Shooting', '70 Min', 70, 'hoch', ['Shooting']),
    d('Donnerstag', 'Athletik + Explosivität', '50 Min', 50, 'mittel', ['Athletik']),
    d('Freitag', 'Finishing + Pull-ups', '60 Min', 60, 'hoch', ['Finishing', 'Shooting']),
    d('Sonntag', 'Game-Shooting', '90 Min', 90, 'hoch', ['Shooting', 'Game-Simulation']),
  ],
  6: [
    d('Montag', 'Ballhandling', '60 Min', 60, 'hoch', ['Ballhandling']),
    d('Dienstag', 'Shooting', '75 Min', 75, 'hoch', ['Shooting']),
    d('Mittwoch', 'Athletik + Agility', '50 Min', 50, 'mittel', ['Athletik', 'Footwork']),
    d('Donnerstag', 'Finishing', '60 Min', 60, 'hoch', ['Finishing']),
    d('Freitag', 'Pull-ups + 3er', '70 Min', 70, 'hoch', ['Shooting']),
    d('Samstag', 'Game-Simulation', '90 Min', 90, 'hoch', ['Game-Simulation']),
    d('Sonntag', 'Regeneration', '—', 0, null, ['Regeneration']),
  ],
  7: [
    d('Montag', 'Ballhandling', '60 Min', 60, 'hoch', ['Ballhandling']),
    d('Dienstag', 'Shooting', '75 Min', 75, 'hoch', ['Shooting']),
    d('Mittwoch', 'Athletik + Agility', '50 Min', 50, 'mittel', ['Athletik', 'Footwork']),
    d('Donnerstag', 'Finishing', '60 Min', 60, 'hoch', ['Finishing']),
    d('Freitag', 'Pull-ups + 3er', '70 Min', 70, 'hoch', ['Shooting']),
    d('Samstag', 'Game-Simulation', '90 Min', 90, 'hoch', ['Game-Simulation']),
    d('Sonntag', 'Recovery Shooting', '40 Min', 40, 'niedrig', ['Shooting']),
  ],
};

// ───────────────────────── PROFI ─────────────────────────

const profi = {
  2: [
    d('Mittwoch', 'Elite Skills', '90 Min', 90, 'hoch', ['Ballhandling', 'Finishing'], P2_MI),
    d('Samstag', 'Elite Shooting', '120 Min', 120, 'hoch', ['Shooting'], P2_SA),
  ],
  3: [
    d('Dienstag', 'Ballhandling + Finishing', '90 Min', 90, 'hoch', ['Ballhandling', 'Finishing']),
    d('Donnerstag', 'Shooting', '90 Min', 90, 'hoch', ['Shooting']),
    d('Samstag', 'Game-Speed Training', '120 Min', 120, 'hoch', ['Game-Simulation']),
  ],
  4: [
    d('Montag', 'Ballhandling + Finishing', '90 Min', 90, 'hoch', ['Ballhandling', 'Finishing']),
    d('Mittwoch', 'Shooting', '90 Min', 90, 'hoch', ['Shooting']),
    d('Freitag', 'Athletik + Agility', '75 Min', 75, 'mittel', ['Athletik', 'Footwork']),
    d('Sonntag', 'Game-Speed Training', '120 Min', 120, 'hoch', ['Game-Simulation']),
  ],
  5: [
    d('Montag', 'Ballhandling', '90 Min', 90, 'hoch', ['Ballhandling']),
    d('Dienstag', 'Shooting + Pull-ups', '90 Min', 90, 'hoch', ['Shooting']),
    d('Donnerstag', 'Athletik + Explosivität', '75 Min', 75, 'mittel', ['Athletik']),
    d('Freitag', 'Finishing + Footwork', '90 Min', 90, 'hoch', ['Finishing', 'Footwork']),
    d('Sonntag', 'Game-Speed Shooting', '120 Min', 120, 'hoch', ['Shooting', 'Game-Simulation']),
  ],
  6: [
    d('Montag', 'Advanced Ballhandling', '90 Min', 90, 'hoch', ['Ballhandling']),
    d('Dienstag', 'Elite Shooting', '100 Min', 100, 'hoch', ['Shooting']),
    d('Mittwoch', 'Athletik + Explosivität', '75 Min', 75, 'mittel', ['Athletik']),
    d('Donnerstag', 'Finishing + Footwork', '90 Min', 90, 'hoch', ['Finishing', 'Footwork']),
    d('Freitag', 'Pull-ups + Stepbacks + 3er', '100 Min', 100, 'hoch', ['Shooting']),
    d('Samstag', 'Game-Speed Training', '120 Min', 120, 'hoch', ['Game-Simulation']),
    d('Sonntag', 'Regeneration', '—', 0, null, ['Regeneration']),
  ],
  7: [
    d('Montag', 'Advanced Ballhandling', '90 Min', 90, 'hoch', ['Ballhandling']),
    d('Dienstag', 'Elite Shooting', '100 Min', 100, 'hoch', ['Shooting']),
    d('Mittwoch', 'Athletik + Explosivität', '75 Min', 75, 'mittel', ['Athletik']),
    d('Donnerstag', 'Finishing + Footwork', '90 Min', 90, 'hoch', ['Finishing', 'Footwork']),
    d('Freitag', 'Pull-ups + Stepbacks + 3er', '100 Min', 100, 'hoch', ['Shooting']),
    d('Samstag', 'Game-Speed Training', '120 Min', 120, 'hoch', ['Game-Simulation']),
    d('Sonntag', 'Recovery Shooting + Mobility', '45–60 Min', 52, 'niedrig', ['Shooting', 'Regeneration']),
  ],
};

export const BASKETBALL_PLANS = { anfaenger, fortgeschritten, profi };

// Baut die vollständige Mo–So-Woche: gegebene Trainingstage + Ruhetage füllen den Rest.
export function getWeekPlan(levelKey, daysCount) {
  const trainingDays = BASKETBALL_PLANS[levelKey]?.[daysCount];
  if (!trainingDays) return null;
  const byDay = Object.fromEntries(trainingDays.map((t) => [t.day, t]));
  return WEEKDAYS.map((day) => byDay[day] || { day, title: 'Pause', durationLabel: '—', durationMin: 0, intensity: null, themes: [], exercises: null, isRest: true });
}

// Liefert die konkrete Übungsliste eines Tages (fest vorgegeben oder automatisch zusammengestellt).
export function sessionExercises(dayMeta) {
  if (dayMeta.isRest) return [];
  if (dayMeta.exercises) return dayMeta.exercises;
  const seed = dayMeta.day.length + dayMeta.title.length;
  return composeSession(dayMeta.themes, dayMeta.durationMin, seed);
}

export function categoryIcon(cat) {
  return CATEGORY_ICON[cat] || '🏀';
}

export function weekPlanStats(weekPlan) {
  const training = weekPlan.filter((d) => !d.isRest && d.title !== 'Regeneration');
  const recoveryDays = weekPlan.filter((d) => d.isRest || d.title === 'Regeneration');
  let shooting = 0, ballhandling = 0, finishing = 0, athletik = 0, shots = 0, freeThrows = 0;
  training.forEach((day) => {
    const exs = sessionExercises(day);
    exs.forEach((e) => {
      if (e.category === 'Shooting') { shooting++; if (e.name.toLowerCase().includes('freiwürfe') || e.name.toLowerCase().includes('freiwurf')) freeThrows += parseInt(e.unit) || 10; else shots += parseInt(e.unit) || 10; }
      if (e.category === 'Ballhandling') ballhandling++;
      if (e.category === 'Finishing') finishing++;
      if (e.category === 'Athletik') athletik++;
    });
  });
  const totalMin = training.reduce((s, d) => s + d.durationMin, 0);
  return {
    trainingDaysCount: training.length,
    totalMin,
    shots,
    freeThrows,
    ballhandlingCount: ballhandling,
    finishingCount: finishing,
    athletikCount: athletik,
    shootingCount: shooting,
    recoveryCount: recoveryDays.length,
  };
}
