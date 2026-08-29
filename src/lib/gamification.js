// XP/Level/Streak-Logik — liest nur bestehende Trainingsdaten (logs, runLogs, bballLogs),
// verändert oder ersetzt nichts davon.

export const XP_RULES = {
  WORKOUT_COMPLETE: 100,
  PERSONAL_RECORD: 50,
  STREAK_7: 200,
  RUN_10K: 150,
};

// Level-Schwelle wächst leicht progressiv (Level 1→2 braucht 500 XP, danach steigend).
export function levelFromXp(totalXp) {
  let level = 1;
  let remaining = totalXp;
  let threshold = 500;
  while (remaining >= threshold) {
    remaining -= threshold;
    level++;
    threshold = Math.round(threshold * 1.15);
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: threshold, totalXp };
}

// Vereint alle drei Trainingsarten zu einer sortierten Liste von Datumsangaben (YYYY-MM-DD, ohne Duplikate).
export function allTrainingDates({ logs = [], runLogs = [], bballLogs = [] }) {
  const set = new Set([
    ...logs.map((l) => l.date),
    ...runLogs.map((l) => l.date),
    ...bballLogs.map((l) => l.date),
  ]);
  return [...set].sort();
}

export function calcStreak(dates) {
  const set = new Set(dates);
  let count = 0;
  const d = new Date();
  while (set.has(d.toISOString().slice(0, 10))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export function calcLongestStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...dates].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diffDays = Math.round((cur - prev) / 86400000);
    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return longest;
}

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Montag = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekStats({ logs = [], runLogs = [], bballLogs = [] }, targetSessionsPerWeek = 6) {
  const wStart = startOfWeek();
  const inWeek = (dateStr) => new Date(dateStr) >= wStart;

  const gymSessions = logs.filter((l) => inWeek(l.date));
  const runSessions = runLogs.filter((l) => inWeek(l.date));
  const bballSessions = bballLogs.filter((l) => inWeek(l.date));

  const totalSessions = gymSessions.length + runSessions.length + bballSessions.length;
  const runKm = runSessions.reduce((s, r) => s + (Number(r.distanceKm) || 0), 0);
  const totalMin =
    gymSessions.reduce((s, l) => s + (l.durationMin || 0), 0) +
    runSessions.reduce((s, r) => s + (Number(r.durationMin) || 0), 0) +
    bballSessions.reduce((s, b) => s + (Number(b.durationMin) || 0), 0);

  return {
    totalSessions,
    targetSessionsPerWeek,
    pct: Math.min(Math.round((totalSessions / targetSessionsPerWeek) * 100), 100),
    runKm: Math.round(runKm * 10) / 10,
    totalMin: Math.round(totalMin),
  };
}
