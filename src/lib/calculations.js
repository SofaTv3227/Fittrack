// BMI, Mifflin-St-Jeor calorie needs, macro targets

export function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function bmiCategory(bmi) {
  if (bmi == null) return '–';
  if (bmi < 18.5) return 'Untergewicht';
  if (bmi < 25) return 'Normalgewicht';
  if (bmi < 30) return 'Übergewicht';
  return 'Adipositas';
}

// Mifflin-St-Jeor BMR
export function calcBMR({ weight, height, age, gender }) {
  if (!weight || !height || !age) return null;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'weiblich' ? base - 161 : base + 5;
}

// Activity factor from training days/week
export function activityFactor(daysPerWeek) {
  if (daysPerWeek <= 1) return 1.2;
  if (daysPerWeek <= 3) return 1.375;
  if (daysPerWeek <= 5) return 1.55;
  if (daysPerWeek <= 6) return 1.725;
  return 1.9;
}

export function calcTDEE(profile) {
  const bmr = calcBMR(profile);
  if (!bmr) return null;
  return bmr * activityFactor(profile.daysPerWeek || 3);
}

// Goal-based calorie adjustment
export function calcTargetCalories(profile) {
  const tdee = calcTDEE(profile);
  if (!tdee) return null;
  switch (profile.goal) {
    case 'Abnehmen': return Math.round(tdee - 500);
    case 'Muskelaufbau': return Math.round(tdee + 300);
    case 'Kraft': return Math.round(tdee + 200);
    case 'Ausdauer': return Math.round(tdee + 100);
    default: return Math.round(tdee);
  }
}

// Macro targets in grams, based on goal + bodyweight
export function calcMacroTargets(profile, calories) {
  const kcal = calories ?? calcTargetCalories(profile);
  const weight = profile.weight || 70;
  if (!kcal) return { protein: 0, carbs: 0, fat: 0 };

  let proteinPerKg;
  switch (profile.goal) {
    case 'Muskelaufbau': proteinPerKg = 2.0; break;
    case 'Kraft': proteinPerKg = 1.9; break;
    case 'Abnehmen': proteinPerKg = 2.2; break;
    case 'Ausdauer': proteinPerKg = 1.6; break;
    default: proteinPerKg = 1.8;
  }

  const protein = Math.round(weight * proteinPerKg);
  const fatKcal = kcal * 0.28;
  const fat = Math.round(fatKcal / 9);
  const proteinKcal = protein * 4;
  const carbsKcal = Math.max(kcal - proteinKcal - fatKcal, 0);
  const carbs = Math.round(carbsKcal / 4);

  return { protein, carbs, fat };
}
