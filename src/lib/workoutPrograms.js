// Trainingsplan-Generator: etablierte Programme als Vorlagen

const ex = (name, muscle, sets, reps, rest) => ({ name, muscle, sets, reps, rest });

const PPL_PUSH = [
  ex('Bankdrücken', 'Brust', 4, '6-10', '2-3 min'),
  ex('Schulterdrücken', 'Schultern', 3, '8-12', '2 min'),
  ex('Schrägbankdrücken Kurzhantel', 'Brust', 3, '8-12', '2 min'),
  ex('Seitheben', 'Schultern', 3, '12-15', '60-90 s'),
  ex('Trizepsdrücken am Kabel', 'Arme', 3, '10-15', '60-90 s'),
  ex('Dips', 'Brust', 3, '8-12', '90 s'),
];
const PPL_PULL = [
  ex('Klimmzüge', 'Rücken', 4, '6-10', '2-3 min'),
  ex('Rudern vorgebeugt', 'Rücken', 4, '8-12', '2 min'),
  ex('Latzug', 'Rücken', 3, '10-12', '90 s'),
  ex('Face Pulls', 'Schultern', 3, '12-15', '60 s'),
  ex('Bizepscurls', 'Arme', 3, '10-15', '60-90 s'),
  ex('Hammercurls', 'Arme', 3, '10-12', '60 s'),
];
const PPL_LEGS = [
  ex('Kniebeugen', 'Beine', 4, '6-10', '2-3 min'),
  ex('Rumänisches Kreuzheben', 'Beine', 3, '8-12', '2 min'),
  ex('Beinpresse', 'Beine', 3, '10-12', '90 s'),
  ex('Beinstrecker', 'Beine', 3, '12-15', '60-90 s'),
  ex('Beinbeuger', 'Beine', 3, '12-15', '60-90 s'),
  ex('Wadenheben', 'Beine', 4, '15-20', '60 s'),
];

const UPPER = [
  ex('Bankdrücken', 'Brust', 4, '6-10', '2-3 min'),
  ex('Rudern vorgebeugt', 'Rücken', 4, '6-10', '2-3 min'),
  ex('Schulterdrücken', 'Schultern', 3, '8-12', '2 min'),
  ex('Klimmzüge', 'Rücken', 3, '8-12', '2 min'),
  ex('Bizepscurls', 'Arme', 3, '10-15', '60-90 s'),
  ex('Trizepsdrücken', 'Arme', 3, '10-15', '60-90 s'),
];
const LOWER = [
  ex('Kniebeugen', 'Beine', 4, '6-10', '2-3 min'),
  ex('Rumänisches Kreuzheben', 'Beine', 4, '6-10', '2-3 min'),
  ex('Beinpresse', 'Beine', 3, '10-12', '90 s'),
  ex('Wadenheben', 'Beine', 4, '15-20', '60 s'),
  ex('Ausfallschritte', 'Beine', 3, '10-12 je Seite', '90 s'),
  ex('Plank', 'Core', 3, '30-60 s', '45 s'),
];

const FULLBODY = [
  ex('Kniebeugen', 'Beine', 3, '8-12', '2 min'),
  ex('Bankdrücken', 'Brust', 3, '8-12', '2 min'),
  ex('Rudern vorgebeugt', 'Rücken', 3, '8-12', '2 min'),
  ex('Schulterdrücken', 'Schultern', 3, '10-12', '90 s'),
  ex('Beinbeuger', 'Beine', 2, '12-15', '60-90 s'),
  ex('Plank', 'Core', 3, '30-60 s', '45 s'),
];

const STRONGLIFTS_A = [
  ex('Kniebeugen', 'Beine', 5, '5', '3 min'),
  ex('Bankdrücken', 'Brust', 5, '5', '3 min'),
  ex('Rudern vorgebeugt', 'Rücken', 5, '5', '3 min'),
];
const STRONGLIFTS_B = [
  ex('Kniebeugen', 'Beine', 5, '5', '3 min'),
  ex('Schulterdrücken', 'Schultern', 5, '5', '3 min'),
  ex('Kreuzheben', 'Beine', 1, '5', '3-5 min'),
];

const WENDLER_531 = (lift, accessories) => [
  ex(lift, lift.includes('Kniebeuge') ? 'Beine' : lift.includes('Bankdrücken') ? 'Brust' : lift.includes('Kreuzheben') ? 'Beine' : 'Schultern', 3, '5/5/5+', '3 min'),
  ...accessories,
];

const PHUL_UPPER_POWER = [
  ex('Bankdrücken', 'Brust', 4, '3-5', '3 min'),
  ex('Rudern vorgebeugt', 'Rücken', 4, '3-5', '3 min'),
  ex('Schulterdrücken', 'Schultern', 3, '5-8', '2 min'),
  ex('Klimmzüge', 'Rücken', 3, '5-8', '2 min'),
];
const PHUL_LOWER_POWER = [
  ex('Kniebeugen', 'Beine', 4, '3-5', '3 min'),
  ex('Kreuzheben', 'Beine', 4, '3-5', '3 min'),
  ex('Beinpresse', 'Beine', 3, '8-10', '2 min'),
  ex('Wadenheben', 'Beine', 4, '10-12', '90 s'),
];
const PHUL_UPPER_HYP = [
  ex('Schrägbankdrücken', 'Brust', 4, '8-12', '90 s'),
  ex('Latzug', 'Rücken', 4, '8-12', '90 s'),
  ex('Seitheben', 'Schultern', 3, '12-15', '60 s'),
  ex('Bizepscurls', 'Arme', 3, '10-12', '60 s'),
  ex('Trizepsdrücken', 'Arme', 3, '10-12', '60 s'),
];
const PHUL_LOWER_HYP = [
  ex('Ausfallschritte', 'Beine', 3, '10-12', '90 s'),
  ex('Beinstrecker', 'Beine', 3, '12-15', '60 s'),
  ex('Beinbeuger', 'Beine', 3, '12-15', '60 s'),
  ex('Wadenheben', 'Beine', 4, '15-20', '60 s'),
];

const BRO_SPLIT = {
  Brust: [ex('Bankdrücken', 'Brust', 4, '8-12', '90 s'), ex('Schrägbankdrücken', 'Brust', 4, '8-12', '90 s'), ex('Fliegende', 'Brust', 3, '12-15', '60 s'), ex('Dips', 'Brust', 3, '10-12', '90 s')],
  Rücken: [ex('Klimmzüge', 'Rücken', 4, '8-12', '90 s'), ex('Rudern vorgebeugt', 'Rücken', 4, '8-12', '90 s'), ex('Latzug', 'Rücken', 3, '10-12', '90 s'), ex('Kreuzheben', 'Rücken', 3, '6-8', '2 min')],
  Beine: [ex('Kniebeugen', 'Beine', 4, '8-12', '2 min'), ex('Beinpresse', 'Beine', 4, '10-12', '90 s'), ex('Beinstrecker', 'Beine', 3, '12-15', '60 s'), ex('Wadenheben', 'Beine', 4, '15-20', '60 s')],
  Schultern: [ex('Schulterdrücken', 'Schultern', 4, '8-12', '90 s'), ex('Seitheben', 'Schultern', 4, '12-15', '60 s'), ex('Face Pulls', 'Schultern', 3, '15', '60 s')],
  Arme: [ex('Bizepscurls', 'Arme', 4, '10-12', '60 s'), ex('Trizepsdrücken', 'Arme', 4, '10-12', '60 s'), ex('Hammercurls', 'Arme', 3, '10-12', '60 s'), ex('French Press', 'Arme', 3, '10-12', '60 s')],
};

const C25K = [
  ex('Woche 1-2: Gehen/Laufen Intervalle', 'Cardio', 1, '8x (60s laufen / 90s gehen)', '—'),
  ex('Woche 3-4: Intervalle steigern', 'Cardio', 1, '5x (3 min laufen / 3 min gehen)', '—'),
  ex('Woche 5-6: Längere Laufblöcke', 'Cardio', 1, '3x (8 min laufen / 5 min gehen)', '—'),
  ex('Woche 7-8: Durchgehend laufen', 'Cardio', 1, '25 min durchgehend', '—'),
  ex('Woche 9: Ziel 5K', 'Cardio', 1, '30 min / 5 km', '—'),
];

export function generateProgram(profile) {
  const days = profile.daysPerWeek || 3;
  const goal = profile.goal;
  const exp = profile.experience;

  if (goal === 'Ausdauer') {
    return { key: 'c25k', name: 'Couch-to-5K / Laufplan', days: [{ name: 'Lauftraining', exercises: C25K }] };
  }

  if (exp === 'Anfänger' && goal !== 'Abnehmen') {
    if (days <= 3) {
      return { key: 'fullbody', name: 'Ganzkörper (Full Body)', days: [
        { name: 'Ganzkörper A', exercises: FULLBODY },
        { name: 'Ganzkörper B', exercises: FULLBODY },
        { name: 'Ganzkörper C', exercises: FULLBODY },
      ] };
    }
    return { key: 'stronglifts', name: 'StrongLifts 5x5', days: [
      { name: 'Workout A', exercises: STRONGLIFTS_A },
      { name: 'Workout B', exercises: STRONGLIFTS_B },
    ] };
  }

  if (goal === 'Abnehmen') {
    return { key: 'fullbody', name: 'Ganzkörper (Full Body) – Fettabbau', days: [
      { name: 'Ganzkörper A', exercises: FULLBODY },
      { name: 'Ganzkörper B', exercises: FULLBODY },
      { name: 'Ganzkörper C', exercises: FULLBODY },
    ] };
  }

  if (goal === 'Kraft') {
    if (exp === 'Profi') {
      return { key: '531', name: '5/3/1 (Wendler)', days: [
        { name: 'Tag 1: Kniebeugen', exercises: WENDLER_531('Kniebeugen', [ex('Beinstrecker', 'Beine', 3, '10-12', '90 s'), ex('Plank', 'Core', 3, '45 s', '45 s')]) },
        { name: 'Tag 2: Bankdrücken', exercises: WENDLER_531('Bankdrücken', [ex('Rudern vorgebeugt', 'Rücken', 3, '10', '90 s'), ex('Trizepsdrücken', 'Arme', 3, '12', '60 s')]) },
        { name: 'Tag 3: Kreuzheben', exercises: WENDLER_531('Kreuzheben', [ex('Klimmzüge', 'Rücken', 3, '8-10', '90 s'), ex('Bizepscurls', 'Arme', 3, '12', '60 s')]) },
        { name: 'Tag 4: Schulterdrücken', exercises: WENDLER_531('Schulterdrücken', [ex('Seitheben', 'Schultern', 3, '12-15', '60 s'), ex('Face Pulls', 'Schultern', 3, '15', '60 s')]) },
      ] };
    }
    return { key: 'phul', name: 'PHUL (Power + Hypertrophie)', days: [
      { name: 'Upper Power', exercises: PHUL_UPPER_POWER },
      { name: 'Lower Power', exercises: PHUL_LOWER_POWER },
      { name: 'Upper Hypertrophie', exercises: PHUL_UPPER_HYP },
      { name: 'Lower Hypertrophie', exercises: PHUL_LOWER_HYP },
    ] };
  }

  // Muskelaufbau / Allgemeine Fitness
  if (days >= 5) {
    return { key: 'bro', name: 'Bro Split', days: Object.entries(BRO_SPLIT).map(([name, exercises]) => ({ name, exercises })) };
  }
  if (days === 4) {
    return { key: 'upperlower', name: 'Upper/Lower Split', days: [
      { name: 'Upper Body A', exercises: UPPER },
      { name: 'Lower Body A', exercises: LOWER },
      { name: 'Upper Body B', exercises: UPPER },
      { name: 'Lower Body B', exercises: LOWER },
    ] };
  }
  if (days >= 3) {
    return { key: 'ppl', name: 'Push/Pull/Legs (PPL)', days: [
      { name: 'Push', exercises: PPL_PUSH },
      { name: 'Pull', exercises: PPL_PULL },
      { name: 'Legs', exercises: PPL_LEGS },
    ] };
  }
  return { key: 'fullbody', name: 'Ganzkörper (Full Body)', days: [
    { name: 'Ganzkörper A', exercises: FULLBODY },
    { name: 'Ganzkörper B', exercises: FULLBODY },
  ] };
}

export const MUSCLE_GROUPS = ['Brust', 'Rücken', 'Beine', 'Schultern', 'Arme', 'Core', 'Cardio'];
