// Reine Berechnungs-Helfer für die Trainingsplan-Ansicht — lesen nur bestehende Plan-Daten,
// verändern nichts. Keine Migration, keine Default-Werte für vorhandene Felder.

// Parst Pausenangaben wie "2 min", "90 s", "1-2 min", "60-90 s" zu Sekunden (Mittelwert bei Range).
function parseRestSeconds(restStr) {
  if (!restStr) return 60;
  const str = String(restStr).toLowerCase();
  const nums = str.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  if (!nums.length) return 60;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const isSeconds = /\bs\b|sek/.test(str) && !/min/.test(str);
  return isSeconds ? avg : avg * 60;
}

// Grobe Zeitschätzung pro Übung: Sätze x (Pause + ~45s Ausführungszeit je Satz).
function estimateExerciseSeconds(exObj) {
  const sets = Number(exObj.sets) || 1;
  const restSec = parseRestSeconds(exObj.rest);
  return sets * (restSec + 45);
}

export function estimateDayMinutes(day) {
  const totalSec = (day.exercises || []).reduce((s, ex) => s + estimateExerciseSeconds(ex), 0);
  return Math.round(totalSec / 60);
}

export function dayMuscleGroups(day) {
  return [...new Set((day.exercises || []).map((e) => e.muscle).filter(Boolean))];
}

export function planStats(plan) {
  if (!plan) return null;
  const days = plan.days || [];
  const allExercises = days.flatMap((d) => d.exercises || []);
  const totalSets = allExercises.reduce((s, e) => s + (Number(e.sets) || 0), 0);
  const totalMinutes = days.reduce((s, d) => s + estimateDayMinutes(d), 0);
  const muscleGroups = new Set(allExercises.map((e) => e.muscle).filter(Boolean));
  return {
    dayCount: days.length,
    exerciseCount: allExercises.length,
    totalSets,
    totalMinutes,
    muscleGroupCount: muscleGroups.size,
  };
}

export function formatMinutes(min) {
  if (!min) return '0 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} Std. ${m} min` : `${h} Std.`;
}
