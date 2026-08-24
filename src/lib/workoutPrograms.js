// Trainingsplan-Generator: etablierte Programme als Vorlagen

const ex = (name, muscle, sets, reps, rest) => ({ name, muscle, sets, reps, rest });

const STRONGLIFTS_A = [
  ex('Kniebeugen', 'Beine', 2, '5', '3 min'),
  ex('Bankdrücken', 'Brust', 2, '5', '3 min'),
  ex('Rudern vorgebeugt', 'Rücken', 2, '5', '3 min'),
];
const STRONGLIFTS_B = [
  ex('Kniebeugen', 'Beine', 2, '5', '3 min'),
  ex('Schulterdrücken', 'Schultern', 2, '5', '3 min'),
  ex('Kreuzheben', 'Beine', 2, '5', '3-5 min'),
];

const WENDLER_531 = (lift, accessories) => [
  ex(lift, lift.includes('Kniebeuge') ? 'Beine' : lift.includes('Bankdrücken') ? 'Brust' : lift.includes('Kreuzheben') ? 'Beine' : 'Schultern', 2, '5/5/5+', '3 min'),
  ...accessories,
];

const PHUL_UPPER_POWER = [
  ex('Bankdrücken', 'Brust', 2, '3-5', '3 min'),
  ex('Rudern vorgebeugt', 'Rücken', 2, '3-5', '3 min'),
  ex('Schulterdrücken', 'Schultern', 2, '5-8', '2 min'),
  ex('Klimmzüge', 'Rücken', 2, '5-8', '2 min'),
];
const PHUL_LOWER_POWER = [
  ex('Kniebeugen', 'Beine', 2, '3-5', '3 min'),
  ex('Kreuzheben', 'Beine', 2, '3-5', '3 min'),
  ex('Beinpresse', 'Beine', 2, '8-10', '2 min'),
  ex('Wadenheben', 'Beine', 2, '10-12', '90 s'),
];
const PHUL_UPPER_HYP = [
  ex('Schrägbankdrücken', 'Brust', 2, '8-12', '90 s'),
  ex('Latzug', 'Rücken', 2, '8-12', '90 s'),
  ex('Seitheben', 'Schultern', 2, '12-15', '60 s'),
  ex('Bizepscurls', 'Arme', 2, '10-12', '60 s'),
  ex('Trizepsdrücken', 'Arme', 2, '10-12', '60 s'),
];
const PHUL_LOWER_HYP = [
  ex('Ausfallschritte', 'Beine', 2, '10-12', '90 s'),
  ex('Beinstrecker', 'Beine', 2, '12-15', '60 s'),
  ex('Beinbeuger', 'Beine', 2, '12-15', '60 s'),
  ex('Wadenheben', 'Beine', 2, '15-20', '60 s'),
];

const BRO_SPLIT = {
  Brust: [ex('Bankdrücken', 'Brust', 2, '8-12', '90 s'), ex('Schrägbankdrücken', 'Brust', 2, '8-12', '90 s'), ex('Fliegende', 'Brust', 2, '12-15', '60 s'), ex('Dips', 'Brust', 2, '10-12', '90 s')],
  Rücken: [ex('Klimmzüge', 'Rücken', 2, '8-12', '90 s'), ex('Rudern vorgebeugt', 'Rücken', 2, '8-12', '90 s'), ex('Latzug', 'Rücken', 2, '10-12', '90 s'), ex('Kreuzheben', 'Rücken', 2, '6-8', '2 min')],
  Beine: [ex('Kniebeugen', 'Beine', 2, '8-12', '2 min'), ex('Beinpresse', 'Beine', 2, '10-12', '90 s'), ex('Beinstrecker', 'Beine', 2, '12-15', '60 s'), ex('Wadenheben', 'Beine', 2, '15-20', '60 s')],
  Schultern: [ex('Schulterdrücken', 'Schultern', 2, '8-12', '90 s'), ex('Seitheben', 'Schultern', 2, '12-15', '60 s'), ex('Face Pulls', 'Schultern', 2, '15', '60 s')],
  Arme: [ex('Bizepscurls', 'Arme', 2, '10-12', '60 s'), ex('Trizepsdrücken', 'Arme', 2, '10-12', '60 s'), ex('Hammercurls', 'Arme', 2, '10-12', '60 s'), ex('French Press', 'Arme', 2, '10-12', '60 s')],
};

// ── Feste Pläne (Beginner/Fortgeschritten, Gym-Equipment) ──

const GANZKOERPER_I = [
  ex('Beinpresse', 'Beine', 2, '8-12', '2 min'),
  ex('Latzug', 'Rücken', 2, '8-12', '1-2 min'),
  ex('Brustpresse', 'Brust', 2, '8-12', '1-2 min'),
  ex('Beinbeuger', 'Beine', 2, '8-12', '1-2 min'),
  ex('Seitheben am Kabelzug', 'Schultern', 2, '12-15', '1-2 min'),
  ex('Trizeps-Pulldown', 'Arme', 2, '8-12', '1 min'),
  ex('Hyperextension', 'Rücken', 2, '12-15', '1 min'),
  ex('Beinheben im Liegen', 'Core', 2, '15-20', '1 min'),
];
const GANZKOERPER_II = [
  ex('Goblet Squats', 'Beine', 2, '8-12', '2 min'),
  ex('KH-Schrägbankdrücken', 'Brust', 2, '8-12', '1-2 min'),
  ex('Rudern breit', 'Rücken', 2, '8-12', '1 min'),
  ex('Beinstrecker', 'Beine', 2, '8-12', '1-2 min'),
  ex('Schulterpresse', 'Schultern', 2, '8-12', '2 min'),
  ex('Bizepsmaschine', 'Arme', 2, '8-12', '1-2 min'),
  ex('Reverse Butterfly', 'Rücken', 2, '12-15', '1 min'),
  ex('Negative Crunches', 'Core', 2, '12-15', '1 min'),
];

const PPL_ESN_PUSH = [
  ex('LH-Schrägbankdrücken', 'Brust', 2, '8-12', '2 min'),
  ex('Brustpresse', 'Brust', 2, '8-12', '2 min'),
  ex('Butterfly', 'Brust', 2, '10-12', '1 min'),
  ex('KH-Schulterdrücken', 'Schultern', 2, '8-12', '2 min'),
  ex('Seitheben am Kabelzug', 'Schultern', 2, '10-12', '1 min'),
  ex('Trizeps Pushdown', 'Arme', 2, '8-12', '1 min'),
  ex('Einarmige Kickbacks am Kabelturm', 'Arme', 2, '8-12 je Seite', '1 min'),
];
const PPL_ESN_PULL = [
  ex('Latzug', 'Rücken', 2, '8-12', '2 min'),
  ex('T-Bar Rudern', 'Rücken', 2, '8-12', '2 min'),
  ex('Kabelrudern eng', 'Rücken', 2, '8-12', '1 min'),
  ex('Hyperextension', 'Rücken', 2, '12-15', '1 min'),
  ex('Reverse Butterfly', 'Rücken', 2, '12-15', '1 min'),
  ex('KH-Bizepscurls', 'Arme', 2, '8-12', '1 min'),
  ex('Bizepsmaschine', 'Arme', 2, '8-12', '1 min'),
];
const PPL_ESN_LEGS = [
  ex('Squats', 'Beine', 2, '8-10', '2-3 min'),
  ex('Beinpresse', 'Beine', 2, '8-10', '2 min'),
  ex('Beinbeuger', 'Beine', 2, '10-12', '1 min'),
  ex('Beinstrecker', 'Beine', 2, '10-12', '1 min'),
  ex('Wadenheben stehend', 'Beine', 2, '15-20', '1 min'),
  ex('Crunches', 'Core', 2, '15-20', '1 min'),
  ex('Leg Raises', 'Core', 2, '12-15', '1 min'),
];

const OKUK_OBERKOERPER_I = [
  ex('Latzug', 'Rücken', 2, '8-12', '2 min'),
  ex('LH-Schrägbankdrücken', 'Brust', 2, '8-12', '2 min'),
  ex('Seitheben am Kabelzug', 'Schultern', 2, '12-15', '1 min'),
  ex('LH-Rudern', 'Rücken', 2, '8-12', '2 min'),
  ex('Butterfly', 'Brust', 2, '12-15', '1-2 min'),
  ex('Reverse Butterfly', 'Rücken', 2, '12-15', '1-2 min'),
  ex('KH-Bizepscurls', 'Arme', 2, '8-12', '1 min'),
  ex('Trizeps-Pushdown', 'Arme', 2, '8-12', '1 min'),
];
const OKUK_UNTERKOERPER_I = [
  ex('Squats', 'Beine', 2, '8-12', '2 min'),
  ex('Beinpresse', 'Beine', 2, '12-15', '2 min'),
  ex('Beinbeuger sitzend', 'Beine', 2, '8-12', '1 min'),
  ex('Beinstrecker', 'Beine', 2, '8-12', '1 min'),
  ex('Adduktoren', 'Beine', 2, '12-15', '1-2 min'),
  ex('Wadenheben-Maschine sitzend', 'Beine', 2, '8-12', '1-2 min'),
  ex('Negativ-Crunches', 'Core', 2, '12-15', '1 min'),
];
const OKUK_OBERKOERPER_II = [
  ex('T-Bar Rudern', 'Rücken', 2, '8-10', '2-3 min'),
  ex('KH-Bankdrücken', 'Brust', 2, '6-10', '2 min'),
  ex('Latzug eng', 'Rücken', 2, '8-12', '1-2 min'),
  ex('Butterfly am Kabelturm', 'Brust', 2, '12-15', '1-2 min'),
  ex('Schulterpresse', 'Schultern', 2, '8-12', '1-2 min'),
  ex('Face Pulls', 'Schultern', 2, '12-15', '1 min'),
  ex('Bizepscurl-Maschine', 'Arme', 2, '8-12', '1 min'),
  ex('SZ-Skullcrushers', 'Arme', 2, '8-12', '1 min'),
];
const OKUK_UNTERKOERPER_II = [
  ex('KH-Rumänisches Kreuzheben', 'Beine', 2, '12-15', '2-3 min'),
  ex('Hackenschmidt-Maschine', 'Beine', 2, '8-12', '2 min'),
  ex('Multipresse-Hip Thrusts', 'Beine', 2, '8-12', '2 min'),
  ex('Multipresse-Split Squats', 'Beine', 2, '10-12', '1-2 min'),
  ex('Wadenheben', 'Beine', 2, '15-20', '1 min'),
  ex('Beinheben im Liegen', 'Core', 2, '12-15', '1 min'),
  ex('Crunches', 'Core', 2, '12-15', '1 min'),
];

// ── Bodyweight (kein Equipment nötig) ──

const BODYWEIGHT_I = [
  ex('Klimmzüge', 'Rücken', 3, '8-12', '1 min'),
  ex('Bank Dips', 'Arme', 3, '8-12', '1 min'),
  ex('Burpees', 'Cardio', 3, '8-12', '1 min'),
  ex('Bird Dogs', 'Core', 3, '8-12', '1 min'),
  ex('Box Jumps', 'Beine', 3, '12-15', '1 min'),
  ex('Crunches', 'Core', 3, '8-12', '1 min'),
  ex('Step Ups mit Knie heben', 'Beine', 3, '12-15', '1 min'),
  ex('Inch Worms', 'Core', 3, '15-20', '1 min'),
];
const BODYWEIGHT_II = [
  ex('Horizontales Rudern', 'Rücken', 3, '12-15', '1 min'),
  ex('Box Jumps', 'Beine', 3, '12-15', '1 min'),
  ex('Hand Release Push Ups', 'Brust', 3, '12-15', '1 min'),
  ex('Burpees', 'Cardio', 3, '12-15', '1 min'),
  ex('Jump Lunges', 'Beine', 3, '12-15', '1 min'),
  ex('Swiss Ball Pikes', 'Core', 3, '12-15', '1 min'),
  ex('Single Arm Planks', 'Core', 3, '1 min', '1 min'),
];
const BODYWEIGHT_III = [
  ex('Squat Jumps', 'Beine', 3, '8-12', '1 min'),
  ex('Liegestütze mit Beinen erhöht', 'Brust', 3, '8-12', '1 min'),
  ex('Klimmzüge', 'Rücken', 3, '8-12', '1 min'),
  ex('Glute Bridges', 'Beine', 3, '12-15', '1 min'),
  ex('Dead Bugs', 'Core', 3, '12-15', '1 min'),
  ex('Mountain Climbers', 'Cardio', 3, '12-15', '1 min'),
  ex('Reverse Lunge Knee Up', 'Beine', 3, '12-15', '1 min'),
  ex('Side Planks', 'Core', 3, '1 min', '1 min'),
];

// ── Ausdauer (7-Wochen-Laufplan, RPE-basiert) ──

const einheit = (name, rpe, teile) => ex(`${name} (RPE ${rpe})`, 'Cardio', 1, teile.join(', '), '—');

const AUSDAUER_WOCHEN = [
  { name: 'Woche 1 - Basis', exercises: [
    einheit('Einheit 1', '5', ['Laufband 5min', 'Ergometer 5min', 'Laufband 5min', 'Ergometer 5min']),
    einheit('Einheit 2', '4', ['Ergometer 12min', 'Laufband 15min', 'Ergometer 12min']),
    einheit('Einheit 3', '5', ['Laufband 6min', 'Ergometer 6min', 'Laufband 6min', 'Ergometer 6min']),
  ] },
  { name: 'Woche 2 - Basis', exercises: [
    einheit('Einheit 1', '5', ['Laufband 6min', 'Ergometer 6min', 'Laufband 6min', 'Ergometer 6min']),
    einheit('Einheit 2', '4', ['Ergometer 12min', 'Laufband 18min', 'Ergometer 12min']),
    einheit('Einheit 3', '5', ['Laufband 7min', 'Ergometer 7min', 'Laufband 7min', 'Ergometer 7min']),
  ] },
  { name: 'Woche 3 - Aufbau', exercises: [
    einheit('Einheit 1', '5', ['Laufband 7min', 'Ergometer 7min', 'Laufband 7min', 'Ergometer 7min']),
    einheit('Einheit 2', '4', ['Ergometer 12min', 'Laufband 22min', 'Ergometer 12min']),
    einheit('Einheit 3', '4-7', ['Ergometer 12min (6x 30s RPE7 / 90s RPE4)', 'Laufband 12min (6x 30s RPE7 / 90s RPE4)']),
  ] },
  { name: 'Woche 4 - Aufbau', exercises: [
    einheit('Einheit 1', '5', ['Laufband 8min', 'Ergometer 8min', 'Laufband 8min', 'Ergometer 8min']),
    einheit('Einheit 2', '4', ['Ergometer 15min', 'Laufband 25min', 'Ergometer 15min']),
    einheit('Einheit 3', '4-7', ['Ergometer 12min (6x 45s RPE7 / 75s RPE4)', 'Laufband 12min (6x 45s RPE7 / 75s RPE4)']),
  ] },
  { name: 'Woche 5 - Intensivierung', exercises: [
    einheit('Einheit 1', '5', ['Laufband 9min', 'Ergometer 9min', 'Laufband 9min', 'Ergometer 9min']),
    einheit('Einheit 2', '3-7', ['Ergometer 15min (10min RPE4, 5min RPE6-7)', 'Laufband 30min (20min RPE4, 10min RPE6-7)', 'Ergometer 15min (5min RPE6, 10min RPE3-4)']),
    einheit('Einheit 3', '4-7', ['Ergometer 10min (5x 60s RPE7-8 / 60s RPE4)', 'Laufband 10min (5x 60s RPE7-8 / 60s RPE4)']),
  ] },
  { name: 'Woche 6 - Intensivierung', exercises: [
    einheit('Einheit 1', '5', ['Laufband 10min', 'Ergometer 10min', 'Laufband 10min', 'Ergometer 10min']),
    einheit('Einheit 2', '3-7', ['Ergometer 15min (8min RPE4, 7min RPE6-7)', 'Laufband 30min (15min RPE4, 15min RPE6-7)', 'Ergometer 15min (7min RPE5-6, 8min RPE3-4)']),
    einheit('Einheit 3', '2-8', ['Ergometer 12min (6x 60s RPE8 / 60s RPE2-3)', 'Laufband 12min (6x 60s RPE8 / 60s RPE2-3)']),
  ] },
  { name: 'Woche 7 - Deload', exercises: [
    einheit('Einheit 1', '3-4', ['Ergometer 30min']),
    einheit('Einheit 2', '4', ['Laufband 20min']),
    einheit('Einheit 3', '4', ['Ergometer 10min', 'Laufband 10min', 'Ergometer 10min']),
  ] },
];

// Wiederholt eine feste Tages-Vorlage, bis die gewünschte Anzahl Trainingstage erreicht ist.
function repeatTemplate(template, count) {
  return Array.from({ length: count }, (_, i) => template[i % template.length]);
}

const GANZKOERPER_DAYS = [
  { name: 'GK I', exercises: GANZKOERPER_I },
  { name: 'GK II', exercises: GANZKOERPER_II },
];
const PPL_ESN_DAYS = [
  { name: 'Push', exercises: PPL_ESN_PUSH },
  { name: 'Pull', exercises: PPL_ESN_PULL },
  { name: 'Legs', exercises: PPL_ESN_LEGS },
];
const OKUK_DAYS = [
  { name: 'Oberkörper I', exercises: OKUK_OBERKOERPER_I },
  { name: 'Unterkörper I', exercises: OKUK_UNTERKOERPER_I },
  { name: 'Oberkörper II', exercises: OKUK_OBERKOERPER_II },
  { name: 'Unterkörper II', exercises: OKUK_UNTERKOERPER_II },
];
const BODYWEIGHT_DAYS = [
  { name: 'Bodyweight I', exercises: BODYWEIGHT_I },
  { name: 'Bodyweight II', exercises: BODYWEIGHT_II },
  { name: 'Bodyweight III', exercises: BODYWEIGHT_III },
];

export function generateProgram(profile) {
  const days = profile.daysPerWeek || 3;
  const goal = profile.goal;
  const exp = profile.experience;
  const equipment = profile.equipment;

  // Ausdauer-Ziel: fester 7-Wochen-Laufplan, unabhängig vom Equipment
  if (goal === 'Ausdauer') {
    return { key: 'ausdauer', name: 'Ausdauer Trainingsplan (7 Wochen)', days: AUSDAUER_WOCHEN };
  }

  // Nur Körpergewicht: fester Bodyweight-Plan, egal welches Ziel
  if (equipment === 'Nur Körpergewicht') {
    return { key: 'bodyweight', name: 'Bodyweight Trainingsplan', days: repeatTemplate(BODYWEIGHT_DAYS, Math.min(Math.max(days, 3), 6)) };
  }

  if (exp === 'Anfänger' && goal !== 'Abnehmen') {
    if (days <= 3) {
      return { key: 'ganzkoerper', name: 'Ganzkörper Trainingsplan', days: repeatTemplate(GANZKOERPER_DAYS, Math.max(days, 2)) };
    }
    return { key: 'stronglifts', name: 'StrongLifts 5x5', days: [
      { name: 'Workout A', exercises: STRONGLIFTS_A },
      { name: 'Workout B', exercises: STRONGLIFTS_B },
    ] };
  }

  if (goal === 'Abnehmen') {
    return { key: 'ganzkoerper', name: 'Ganzkörper Trainingsplan – Fettabbau', days: repeatTemplate(GANZKOERPER_DAYS, Math.max(days, 3)) };
  }

  if (goal === 'Kraft') {
    if (exp === 'Profi') {
      return { key: '531', name: '5/3/1 (Wendler)', days: [
        { name: 'Tag 1: Kniebeugen', exercises: WENDLER_531('Kniebeugen', [ex('Beinstrecker', 'Beine', 2, '10-12', '90 s'), ex('Plank', 'Core', 2, '45 s', '45 s')]) },
        { name: 'Tag 2: Bankdrücken', exercises: WENDLER_531('Bankdrücken', [ex('Rudern vorgebeugt', 'Rücken', 2, '10', '90 s'), ex('Trizepsdrücken', 'Arme', 2, '12', '60 s')]) },
        { name: 'Tag 3: Kreuzheben', exercises: WENDLER_531('Kreuzheben', [ex('Klimmzüge', 'Rücken', 2, '8-10', '90 s'), ex('Bizepscurls', 'Arme', 2, '12', '60 s')]) },
        { name: 'Tag 4: Schulterdrücken', exercises: WENDLER_531('Schulterdrücken', [ex('Seitheben', 'Schultern', 2, '12-15', '60 s'), ex('Face Pulls', 'Schultern', 2, '15', '60 s')]) },
      ] };
    }
    return { key: 'phul', name: 'PHUL (Power + Hypertrophie)', days: [
      { name: 'Upper Power', exercises: PHUL_UPPER_POWER },
      { name: 'Lower Power', exercises: PHUL_LOWER_POWER },
      { name: 'Upper Hypertrophie', exercises: PHUL_UPPER_HYP },
      { name: 'Lower Hypertrophie', exercises: PHUL_LOWER_HYP },
    ] };
  }

  // Muskelaufbau / Allgemeine Fitness (Gym/Homegym)
  if (days >= 5) {
    return { key: 'bro', name: 'Bro Split', days: Object.entries(BRO_SPLIT).map(([name, exercises]) => ({ name, exercises })) };
  }
  if (days === 4) {
    return { key: 'okuk', name: 'Oberkörper-Unterkörper-Split', days: OKUK_DAYS };
  }
  if (days >= 3) {
    return { key: 'ppl', name: 'Push-Pull-Legs-Split', days: PPL_ESN_DAYS };
  }
  return { key: 'ganzkoerper', name: 'Ganzkörper Trainingsplan', days: repeatTemplate(GANZKOERPER_DAYS, 2) };
}

export const MUSCLE_GROUPS = ['Brust', 'Rücken', 'Beine', 'Schultern', 'Arme', 'Core', 'Cardio'];
