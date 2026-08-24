// Lauf-Wochenpläne: 3 Leistungsstufen x 6 Trainingstage-Optionen = 18 vollständige Wochenpläne.
// Dauer/Distanz sind realistische Richtwerte (Distanz aus angenommenem Pace pro Stufe/Intensität
// geschätzt, sofern nicht explizit als km vorgegeben) — Basis für die Wochenstatistik.

export const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export const LEVELS = [
  { key: 'anfaenger', label: 'Anfänger', color: '#22c55e', colorSoft: 'rgba(34,197,94,0.15)' },
  { key: 'fortgeschritten', label: 'Fortgeschritten', color: '#3b82f6', colorSoft: 'rgba(59,130,246,0.15)' },
  { key: 'profi', label: 'Profi', color: '#ef4444', colorSoft: 'rgba(239,68,68,0.15)' },
];

const HR = {
  niedrig: 'Z1–Z2 · locker, Unterhaltung möglich',
  mittel: 'Z2–Z3 · gleichmäßig, kontrolliert',
  hoch: 'Z4–Z5 · anstrengend, forderndes Tempo',
};
const PACE = {
  niedrig: 'deutlich unter Wettkampftempo',
  mittel: 'moderates Grundlagentempo',
  hoch: 'nahe/über 10-km-Wettkampftempo',
};
const DESC = {
  Locker: 'Lockerer Dauerlauf im Wohlfühltempo, entspannte Atmung.',
  'Sehr locker': 'Sehr entspanntes Tempo, aktive Erholung im Vordergrund.',
  Regeneration: 'Ganz lockeres Traben zur aktiven Regeneration nach harten Reizen.',
  Intervalle: 'Intensive Tempowechsel zur Verbesserung von Schnelligkeit und VO2max.',
  Tempolauf: 'Gleichmäßiges, forderndes Tempo nahe der Schwelle.',
  'Langer Lauf': 'Grundlagenausdauer im ruhigen bis moderaten Tempo über längere Distanz.',
  Steigerungen: 'Lockerer Lauf mit kurzen Tempoverschärfungen am Ende.',
};

function run(type, durationLabel, durationMin, distanceKm, intensity, extraDesc) {
  return {
    isRest: false,
    type,
    durationLabel,
    durationMin,
    distanceKm,
    intensity,
    description: extraDesc || DESC[type] || '',
    hr: HR[intensity],
    pace: PACE[intensity],
  };
}
const rest = { isRest: true, type: 'Pause', durationLabel: '—', durationMin: 0, distanceKm: 0, intensity: null, description: 'Trainingsfreier Tag zur vollständigen Erholung.', hr: null, pace: null };

// Baut eine volle Mo–So-Woche aus { Wochentag: sessionOrRest }
function week(days) {
  return WEEKDAYS.map((d) => ({ day: d, ...(days[d] || rest) }));
}

// ───────────────────────── ANFÄNGER ─────────────────────────

const A2 = week({
  Montag: run('Locker', '25–30 Min', 28, 3.5, 'niedrig'),
  Donnerstag: run('Locker', '25–30 Min', 28, 3.5, 'niedrig'),
});
const A3 = week({
  Montag: run('Locker', '25–30 Min', 28, 3.5, 'niedrig'),
  Donnerstag: run('Locker', '25–30 Min', 28, 3.5, 'niedrig'),
  Samstag: run('Langer Lauf', '35–40 Min', 38, 4.7, 'mittel'),
});
const A4 = week({
  Montag: run('Locker', '25–30 Min', 28, 3.5, 'niedrig'),
  Donnerstag: run('Locker', '25 Min', 25, 3.1, 'niedrig'),
  Samstag: run('Intervalle', '5x2 Min schnell / 2 Min locker', 30, 4.5, 'hoch', '5×2 Min schneller Lauf mit 2 Min lockerer Trabpause, inkl. Ein-/Auslaufen.'),
  Sonntag: run('Langer Lauf', '35–40 Min', 38, 4.7, 'mittel'),
});
const A5 = week({
  Montag: run('Locker', '30 Min', 30, 3.8, 'niedrig'),
  Dienstag: run('Regeneration', '20 Min', 20, 2.3, 'niedrig'),
  Donnerstag: run('Locker', '30 Min', 30, 3.8, 'niedrig'),
  Samstag: run('Intervalle', '5x2 Min schnell / 2 Min locker', 30, 4.5, 'hoch', '5×2 Min schneller Lauf mit 2 Min lockerer Trabpause, inkl. Ein-/Auslaufen.'),
  Sonntag: run('Langer Lauf', '40–45 Min', 43, 5.3, 'mittel'),
});
const A6 = week({
  Montag: run('Locker', '30 Min', 30, 3.8, 'niedrig'),
  Dienstag: run('Sehr locker', '20 Min', 20, 2.4, 'niedrig'),
  Mittwoch: run('Locker', '25–30 Min', 28, 3.5, 'niedrig'),
  Freitag: run('Locker', '20 Min', 20, 2.5, 'niedrig'),
  Samstag: run('Intervalle', '5x2 Min schnell / 2 Min locker', 30, 4.5, 'hoch', '5×2 Min schneller Lauf mit 2 Min lockerer Trabpause, inkl. Ein-/Auslaufen.'),
  Sonntag: run('Langer Lauf', '40–45 Min', 43, 5.3, 'mittel'),
});
const A7 = week({
  Montag: run('Locker', '25–30 Min', 28, 3.5, 'niedrig'),
  Dienstag: run('Locker', '20 Min', 20, 2.5, 'niedrig'),
  Mittwoch: run('Locker', '25–30 Min', 28, 3.5, 'niedrig'),
  Donnerstag: run('Sehr locker', '20 Min', 20, 2.4, 'niedrig'),
  Freitag: run('Locker', '25 Min', 25, 3.1, 'niedrig'),
  Samstag: run('Intervalle', '5x2 Min schnell / 2 Min locker', 30, 4.5, 'hoch', '5×2 Min schneller Lauf mit 2 Min lockerer Trabpause, inkl. Ein-/Auslaufen.'),
  Sonntag: run('Langer Lauf', '40 Min', 40, 4.9, 'mittel'),
});

// ─────────────────────── FORTGESCHRITTEN ───────────────────────

const F2 = week({
  Mittwoch: run('Locker', '40 Min', 40, 6.7, 'niedrig'),
  Sonntag: run('Langer Lauf', '60 Min', 60, 9.5, 'mittel'),
});
const F3 = week({
  Dienstag: run('Locker', '40 Min', 40, 6.7, 'niedrig'),
  Donnerstag: run('Intervalle', '6x3 Min zügig / 2 Min locker', 45, 7.5, 'hoch', '6×3 Min zügiges Tempo mit 2 Min lockerer Trabpause, inkl. Ein-/Auslaufen.'),
  Sonntag: run('Langer Lauf', '60–70 Min', 65, 10.5, 'mittel'),
});
const F4 = week({
  Montag: run('Locker', '40 Min', 40, 6.7, 'niedrig'),
  Mittwoch: run('Intervalle', '6x800 m schnell / 2–3 Min Trab', 55, 9.8, 'hoch', '6×800 m schnelles Tempo mit 2–3 Min Trabpause, inkl. Ein-/Auslaufen.'),
  Freitag: run('Locker', '30–40 Min', 35, 5.8, 'niedrig'),
  Sonntag: run('Langer Lauf', '70 Min', 70, 11.5, 'mittel'),
});
const F5 = week({
  Montag: run('Locker', '40 Min', 40, 6.7, 'niedrig'),
  Dienstag: run('Regeneration', '30 Min', 30, 4.5, 'niedrig'),
  Donnerstag: run('Intervalle', '6x800 m Intervalle', 55, 9.8, 'hoch', '6×800 m im Intervalltempo mit Trabpause, inkl. Ein-/Auslaufen.'),
  Samstag: run('Locker', '40 Min', 40, 6.7, 'niedrig'),
  Sonntag: run('Langer Lauf', '70–80 Min', 75, 12.5, 'mittel'),
});
const F6 = week({
  Montag: run('Locker', '45 Min', 45, 7.5, 'niedrig'),
  Dienstag: run('Intervalle', '6x800 m Intervalle', 55, 9.8, 'hoch', '6×800 m im Intervalltempo mit Trabpause, inkl. Ein-/Auslaufen.'),
  Mittwoch: run('Regeneration', '30 Min', 30, 4.5, 'niedrig'),
  Donnerstag: run('Locker', '40 Min', 40, 6.7, 'niedrig'),
  Samstag: run('Tempolauf', '45 Min', 45, 9.5, 'hoch'),
  Sonntag: run('Langer Lauf', '75–90 Min', 82, 13.5, 'mittel'),
});
const F7 = week({
  Montag: run('Locker', '40 Min', 40, 6.7, 'niedrig'),
  Dienstag: run('Intervalle', '6x800 m Intervalle', 55, 9.8, 'hoch', '6×800 m im Intervalltempo mit Trabpause, inkl. Ein-/Auslaufen.'),
  Mittwoch: run('Regeneration', '30 Min', 30, 4.5, 'niedrig'),
  Donnerstag: run('Locker', '45 Min', 45, 7.5, 'niedrig'),
  Freitag: run('Sehr locker', '30 Min', 30, 4.8, 'niedrig'),
  Samstag: run('Tempolauf', '45 Min', 45, 9.5, 'hoch'),
  Sonntag: run('Langer Lauf', '80–90 Min', 85, 14, 'mittel'),
});

// ───────────────────────── PROFI ─────────────────────────

const P2 = week({
  Mittwoch: run('Locker', '50 Min', 50, 9.5, 'niedrig'),
  Sonntag: run('Langer Lauf', '90 Min', 90, 17, 'mittel'),
});
const P3 = week({
  Dienstag: run('Locker', '50 Min', 50, 9.5, 'niedrig'),
  Donnerstag: run('Intervalle', '6x1 km Intervalle / 2–3 Min Trab', 65, 11.5, 'hoch', '6×1 km im Intervalltempo mit 2–3 Min Trabpause, inkl. Ein-/Auslaufen.'),
  Sonntag: run('Langer Lauf', '90–110 Min', 100, 19, 'mittel'),
});
const P4 = week({
  Montag: run('Locker', '50 Min', 50, 9.5, 'niedrig'),
  Mittwoch: run('Intervalle', '6x1 km Intervalle', 65, 11.5, 'hoch', '6×1 km im Intervalltempo mit Trabpause, inkl. Ein-/Auslaufen.'),
  Freitag: run('Locker', '45 Min', 45, 8.5, 'niedrig'),
  Sonntag: run('Langer Lauf', '100–120 Min', 110, 21, 'mittel'),
});
const P5 = week({
  Montag: run('Locker', '50 Min', 50, 9.5, 'niedrig'),
  Dienstag: run('Regeneration', '40 Min', 40, 7, 'niedrig'),
  Donnerstag: run('Tempolauf', '8–12 km', 50, 10, 'hoch'),
  Samstag: run('Locker', '45 Min', 45, 8.5, 'niedrig'),
  Sonntag: run('Langer Lauf', '100–120 Min', 110, 21, 'mittel'),
});
const P6 = week({
  Montag: run('Locker', '50 Min', 50, 9.5, 'niedrig'),
  Dienstag: run('Intervalle', '6x1 km Intervalle', 65, 11.5, 'hoch', '6×1 km im Intervalltempo mit Trabpause, inkl. Ein-/Auslaufen.'),
  Mittwoch: run('Regeneration', '40 Min', 40, 7, 'niedrig'),
  Donnerstag: run('Tempolauf', '10–12 km', 55, 11, 'hoch'),
  Samstag: run('Locker', '45 Min', 45, 8.5, 'niedrig'),
  Sonntag: run('Langer Lauf', '100–130 Min', 115, 22, 'mittel'),
});
const P7 = week({
  Montag: run('Locker', '50 Min', 50, 9.5, 'niedrig'),
  Dienstag: run('Intervalle', '6x1 km Intervalle', 65, 11.5, 'hoch', '6×1 km im Intervalltempo mit Trabpause, inkl. Ein-/Auslaufen.'),
  Mittwoch: run('Regeneration', '40 Min', 40, 7, 'niedrig'),
  Donnerstag: run('Tempolauf', '10–12 km', 55, 11, 'hoch'),
  Freitag: run('Sehr locker', '35–45 Min', 40, 7, 'niedrig'),
  Samstag: run('Steigerungen', '30–40 Min + kurze Steigerungen', 35, 6.5, 'mittel', 'Lockerer Dauerlauf mit 4–6 kurzen, schnellen Steigerungen am Ende zur Aktivierung.'),
  Sonntag: run('Langer Lauf', '100–130 Min', 115, 22, 'mittel'),
});

export const RUNNING_PLANS = {
  anfaenger: { 2: A2, 3: A3, 4: A4, 5: A5, 6: A6, 7: A7 },
  fortgeschritten: { 2: F2, 3: F3, 4: F4, 5: F5, 6: F6, 7: F7 },
  profi: { 2: P2, 3: P3, 4: P4, 5: P5, 6: P6, 7: P7 },
};

export function getRunningPlan(levelKey, daysCount) {
  return RUNNING_PLANS[levelKey]?.[daysCount] || null;
}

export function planStats(weekPlan) {
  const trainingDays = weekPlan.filter((d) => !d.isRest);
  const restDays = weekPlan.filter((d) => d.isRest);
  const recoveryRunDays = trainingDays.filter((d) => d.type === 'Regeneration');
  const intenseDays = trainingDays.filter((d) => d.intensity === 'hoch');
  const totalMin = trainingDays.reduce((s, d) => s + d.durationMin, 0);
  const totalKm = trainingDays.reduce((s, d) => s + d.distanceKm, 0);
  return {
    trainingDaysCount: trainingDays.length,
    totalMin,
    totalKm: Math.round(totalKm * 10) / 10,
    intenseCount: intenseDays.length,
    recoveryCount: restDays.length + recoveryRunDays.length,
  };
}
