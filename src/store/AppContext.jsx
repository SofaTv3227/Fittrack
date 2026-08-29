import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { db, TABLES } from '../lib/db';
import { generateProgram } from '../lib/workoutPrograms';
import { calcTargetCalories, calcMacroTargets } from '../lib/calculations';
import { levelFromXp, allTrainingDates, calcStreak, calcLongestStreak, XP_RULES } from '../lib/gamification';

const AppContext = createContext(null);

const defaultProfile = {
  id: TABLES.PROFILE_ID,
  name: '', age: '', gender: 'männlich', height: '', weight: '',
  experience: 'Anfänger', daysPerWeek: 3, goal: 'Allgemeine Fitness', equipment: 'Gym',
};

const defaultSettings = {
  id: TABLES.SETTINGS_ID,
  calorieOverride: null, macroOverride: null,
  addBurnedCalories: false, waterGoalMl: 2500,
};

function todayStr(d = new Date()) { return d.toISOString().slice(0, 10); }

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState(defaultProfile);
  const [settings, setSettingsState] = useState(defaultSettings);
  const [plan, setPlanState] = useState(null);
  const [logs, setLogs] = useState([]);
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [meals, setMeals] = useState([]);
  const [water, setWater] = useState([]);
  const [devices, setDevices] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [bballLogs, setBballLogs] = useState([]);
  const [runLogs, setRunLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [gamification, setGamificationState] = useState({ id: TABLES.GAMIFICATION_ID, xp: 0 });

  useEffect(() => {
    (async () => {
      const [p, s, pl, l, f, r, m, w, d, dd, bl, rl, gl, gam] = await Promise.all([
        db.profile.get(TABLES.PROFILE_ID),
        db.settings.get(TABLES.SETTINGS_ID),
        db.plan.get(TABLES.PLAN_ID),
        db.logs.toArray(),
        db.foods.toArray(),
        db.recipes.toArray(),
        db.meals.toArray(),
        db.water.toArray(),
        db.devices.toArray(),
        db.deviceData.toArray(),
        db.bballLogs.toArray(),
        db.runLogs.toArray(),
        db.goals.toArray(),
        db.gamification.get(TABLES.GAMIFICATION_ID),
      ]);
      if (p) setProfileState(p);
      if (s) setSettingsState(s);
      if (pl) setPlanState(pl);
      setLogs(l); setFoods(f); setRecipes(r); setMeals(m); setWater(w);
      setDevices(d); setDeviceData(dd); setBballLogs(bl);
      setRunLogs(rl); setGoals(gl);
      if (gam) setGamificationState(gam);
      setReady(true);
    })();
  }, []);

  const saveProfile = useCallback(async (next) => {
    const merged = { ...profile, ...next, id: TABLES.PROFILE_ID };
    setProfileState(merged);
    await db.profile.put(merged);
  }, [profile]);

  const saveSettings = useCallback(async (next) => {
    const merged = { ...settings, ...next, id: TABLES.SETTINGS_ID };
    setSettingsState(merged);
    await db.settings.put(merged);
  }, [settings]);

  const regeneratePlan = useCallback(async () => {
    const program = generateProgram(profile);
    const record = { id: TABLES.PLAN_ID, ...program };
    setPlanState(record);
    await db.plan.put(record);
    return record;
  }, [profile]);

  const savePlan = useCallback(async (next) => {
    const record = { ...next, id: TABLES.PLAN_ID };
    setPlanState(record);
    await db.plan.put(record);
  }, []);

  // Logbook
  const addLog = useCallback(async (log) => {
    const id = await db.logs.add(log);
    const rec = { ...log, id };
    setLogs((prev) => [...prev, rec]);
    return rec;
  }, []);
  const updateLog = useCallback(async (id, next) => {
    await db.logs.update(id, next);
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...next } : l)));
  }, []);
  const deleteLog = useCallback(async (id) => {
    await db.logs.delete(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Foods
  const addFood = useCallback(async (food) => {
    const id = await db.foods.add(food);
    const rec = { ...food, id };
    setFoods((prev) => [...prev, rec]);
    return rec;
  }, []);

  // Recipes
  const addRecipe = useCallback(async (recipe) => {
    const id = await db.recipes.add(recipe);
    const rec = { ...recipe, id };
    setRecipes((prev) => [...prev, rec]);
    return rec;
  }, []);
  const deleteRecipe = useCallback(async (id) => {
    await db.recipes.delete(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Meals
  const addMeal = useCallback(async (meal) => {
    const id = await db.meals.add(meal);
    const rec = { ...meal, id };
    setMeals((prev) => [...prev, rec]);
    return rec;
  }, []);
  const updateMeal = useCallback(async (id, next) => {
    await db.meals.update(id, next);
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...next } : m)));
  }, []);
  const deleteMeal = useCallback(async (id) => {
    await db.meals.delete(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Water
  const setWaterForDate = useCallback(async (date, ml) => {
    await db.water.put({ date, ml });
    setWater((prev) => {
      const exists = prev.find((w) => w.date === date);
      if (exists) return prev.map((w) => (w.date === date ? { date, ml } : w));
      return [...prev, { date, ml }];
    });
  }, []);

  // Devices
  const setDeviceState = useCallback(async (id, next) => {
    const existing = devices.find((d) => d.id === id) || { id };
    const merged = { ...existing, ...next };
    await db.devices.put(merged);
    setDevices((prev) => {
      const idx = prev.findIndex((d) => d.id === id);
      if (idx === -1) return [...prev, merged];
      const copy = [...prev]; copy[idx] = merged; return copy;
    });
    return merged;
  }, [devices]);

  const saveDeviceData = useCallback(async (providerId, { activities = [], sleep = [], daily = [] }, append = false) => {
    if (!append) await db.deviceData.where('provider').equals(providerId).delete();
    const rows = [
      ...activities.map((a) => ({ ...a, type_: 'activity' })),
      ...sleep.map((s) => ({ ...s, type_: 'sleep' })),
      ...daily.map((d) => ({ ...d, type_: 'daily' })),
    ];
    await db.deviceData.bulkAdd(rows);
    const fresh = await db.deviceData.toArray();
    setDeviceData(fresh);
  }, []);

  // Basketball-Einzeltraining: abgeschlossene Sessions bleiben unabhängig von Plan-Auswahl erhalten.
  const addBballLog = useCallback(async (log) => {
    const id = await db.bballLogs.add(log);
    const rec = { ...log, id };
    setBballLogs((prev) => [...prev, rec]);
    return rec;
  }, []);
  const deleteBballLog = useCallback(async (id) => {
    await db.bballLogs.delete(id);
    setBballLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Laufprotokolle (echte absolvierte Läufe, unabhängig vom Wochenplan-Vorschlag)
  const addRunLog = useCallback(async (log) => {
    const id = await db.runLogs.add(log);
    const rec = { ...log, id };
    setRunLogs((prev) => [...prev, rec]);
    return rec;
  }, []);
  const deleteRunLog = useCallback(async (id) => {
    await db.runLogs.delete(id);
    setRunLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Ziele
  const addGoal = useCallback(async (goal) => {
    const id = await db.goals.add(goal);
    const rec = { ...goal, id };
    setGoals((prev) => [...prev, rec]);
    return rec;
  }, []);
  const updateGoal = useCallback(async (id, next) => {
    await db.goals.update(id, next);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...next } : g)));
  }, []);
  const deleteGoal = useCallback(async (id) => {
    await db.goals.delete(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // Gamification (XP)
  const addXp = useCallback(async (amount) => {
    setGamificationState((prev) => {
      const merged = { id: TABLES.GAMIFICATION_ID, xp: (prev.xp || 0) + amount };
      db.gamification.put(merged);
      return merged;
    });
  }, []);

  const trainingDates = useMemo(
    () => allTrainingDates({ logs, runLogs, bballLogs }),
    [logs, runLogs, bballLogs]
  );
  const streak = useMemo(() => calcStreak(trainingDates), [trainingDates]);
  const longestStreak = useMemo(() => calcLongestStreak(trainingDates), [trainingDates]);
  const levelInfo = useMemo(() => levelFromXp(gamification.xp || 0), [gamification]);

  const targetCalories = useMemo(
    () => settings.calorieOverride ?? calcTargetCalories(profile),
    [profile, settings]
  );
  const targetMacros = useMemo(
    () => settings.macroOverride ?? calcMacroTargets(profile, targetCalories),
    [profile, settings, targetCalories]
  );

  const value = {
    ready, profile, settings, plan, logs, foods, recipes, meals, water, devices, deviceData, bballLogs,
    runLogs, goals, gamification, streak, longestStreak, levelInfo, trainingDates, XP_RULES,
    saveProfile, saveSettings, regeneratePlan, savePlan,
    addLog, updateLog, deleteLog,
    addFood, addRecipe, deleteRecipe,
    addMeal, updateMeal, deleteMeal,
    setWaterForDate, setDeviceState, saveDeviceData,
    addBballLog, deleteBballLog,
    addRunLog, deleteRunLog,
    addGoal, updateGoal, deleteGoal, addXp,
    targetCalories, targetMacros, todayStr,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
