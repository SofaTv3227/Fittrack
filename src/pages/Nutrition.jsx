import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { scaleFood, gramsForUnit } from '../lib/foodDatabase';
import FoodAutocomplete from '../components/FoodAutocomplete';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { ChevronLeft, ChevronRight, Plus, Trash2, Copy, Star, Droplet, Settings2 } from 'lucide-react';

const SECTIONS = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snacks'];
const UNITS = ['g', 'ml', 'Stück', 'Portion'];
const SUGGESTIONS = {
  Muskelaufbau: ['Hähnchenbrust mit Reis & Brokkoli', 'Skyr mit Haferflocken & Banane', 'Rindfleisch mit Süßkartoffel'],
  Kraft: ['Rührei mit Vollkornbrot & Avocado', 'Lachs mit Quinoa & Gemüse', 'Magerquark mit Nüssen'],
  Abnehmen: ['Salat mit Hähnchenbrust', 'Gemüsepfanne mit Tofu', 'Griechischer Joghurt mit Beeren'],
  Ausdauer: ['Vollkornnudeln mit Tomatensauce', 'Haferflocken mit Banane & Honig', 'Reis mit Gemüse & Ei'],
  'Allgemeine Fitness': ['Gemischter Salat mit Ei', 'Vollkornbrot mit Käse', 'Obst-Joghurt-Bowl'],
};

function sumMeals(meals) {
  return meals.reduce((acc, m) => ({
    kcal: acc.kcal + (m.kcal || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

function emptyEntry(section) {
  return { name: '', qty: 100, unit: 'g', kcal: '', protein: '', carbs: '', fat: '', section, favorite: false, selectedFood: null };
}

export default function Nutrition() {
  const { meals, foods, addMeal, updateMeal, deleteMeal, addFood, recipes, addRecipe, deleteRecipe, water, setWaterForDate, targetCalories, targetMacros, settings, saveSettings, deviceData, todayStr, profile } = useApp();
  const [date, setDate] = useState(todayStr());
  const [drafts, setDrafts] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '' });
  const [recipeName, setRecipeName] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeDraft, setRecipeDraft] = useState({ name: '', qty: 100 });
  const [recipeTargetSection, setRecipeTargetSection] = useState('Frühstück');

  const dayMeals = useMemo(() => meals.filter((m) => m.date === date), [meals, date]);
  const totals = useMemo(() => sumMeals(dayMeals), [dayMeals]);
  const favorites = useMemo(() => meals.filter((m) => m.favorite), [meals]);

  const yesterday = useMemo(() => {
    const d = new Date(date); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10);
  }, [date]);
  const yesterdayMeals = useMemo(() => meals.filter((m) => m.date === yesterday), [meals, yesterday]);

  const burnedToday = useMemo(() => {
    return deviceData.filter((d) => d.type_ === 'activity' && d.date === date).reduce((s, a) => s + (a.kcal || 0), 0);
  }, [deviceData, date]);

  const shiftDate = (delta) => {
    const d = new Date(date); d.setDate(d.getDate() + delta); setDate(d.toISOString().slice(0, 10));
  };

  const getDraft = (section) => drafts[section] || emptyEntry(section);
  const setDraft = (section, next) => setDrafts((d) => ({ ...d, [section]: next }));

  const handleSelectFood = (section, food) => {
    const draft = getDraft(section);
    const scaled = scaleFood(food, draft.qty || 100, draft.unit || 'g');
    setDraft(section, { ...draft, name: food.name, selectedFood: food, ...scaled });
  };

  const handleQtyChange = (section, qty) => {
    const draft = getDraft(section);
    if (draft.selectedFood) {
      const scaled = scaleFood(draft.selectedFood, qty, draft.unit);
      setDraft(section, { ...draft, qty, ...scaled });
    } else {
      setDraft(section, { ...draft, qty });
    }
  };

  const handleUnitChange = (section, unit) => {
    const draft = getDraft(section);
    if (draft.selectedFood) {
      const scaled = scaleFood(draft.selectedFood, draft.qty, unit);
      setDraft(section, { ...draft, unit, ...scaled });
    } else {
      setDraft(section, { ...draft, unit });
    }
  };

  const submitEntry = async (section) => {
    const draft = getDraft(section);
    if (!draft.name.trim()) return;
    await addMeal({
      date, section, name: draft.name,
      qty: Number(draft.qty) || 0, unit: draft.unit,
      kcal: Number(draft.kcal) || 0, protein: Number(draft.protein) || 0,
      carbs: Number(draft.carbs) || 0, fat: Number(draft.fat) || 0,
      favorite: false,
    });
    setDraft(section, emptyEntry(section));
  };

  const duplicateEntry = (m) => addMeal({ ...m, id: undefined, date });
  const toggleFavorite = (m) => updateMeal(m.id, { favorite: !m.favorite });
  const takeoverYesterday = async () => {
    for (const m of yesterdayMeals) {
      await addMeal({ ...m, id: undefined, date });
    }
  };
  const addFavoriteToDay = (m, section) => addMeal({ ...m, id: undefined, date, section });

  const saveCustomFood = async () => {
    if (!customFood.name.trim() || !customFood.kcal) return;
    await addFood({
      name: customFood.name, unit: 'g',
      per100: { kcal: Number(customFood.kcal) || 0, protein: Number(customFood.protein) || 0, carbs: Number(customFood.carbs) || 0, fat: Number(customFood.fat) || 0 },
    });
    setCustomFood({ name: '', kcal: '', protein: '', carbs: '', fat: '' });
  };

  const addRecipeIngredient = (food) => {
    const scaled = scaleFood(food, recipeDraft.qty);
    setRecipeIngredients((prev) => [...prev, { name: food.name, qty: recipeDraft.qty, unit: 'g', ...scaled }]);
    setRecipeDraft({ name: '', qty: 100 });
  };
  const removeRecipeIngredient = (idx) => setRecipeIngredients((prev) => prev.filter((_, i) => i !== idx));
  const recipeTotals = useMemo(() => recipeIngredients.reduce((acc, i) => ({
    kcal: acc.kcal + i.kcal, protein: acc.protein + i.protein, carbs: acc.carbs + i.carbs, fat: acc.fat + i.fat,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 }), [recipeIngredients]);
  const saveRecipe = async () => {
    if (!recipeName.trim() || !recipeIngredients.length) return;
    await addRecipe({ name: recipeName, ingredients: recipeIngredients, totals: recipeTotals });
    setRecipeName(''); setRecipeIngredients([]);
  };
  const addRecipeToDay = (r) => addMeal({
    date, section: recipeTargetSection, name: r.name, qty: 1, unit: 'Portion',
    kcal: r.totals.kcal, protein: r.totals.protein, carbs: r.totals.carbs, fat: r.totals.fat, favorite: false,
  });

  const macroDistribution = useMemo(() => {
    const total = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
    if (!total) return [];
    return [
      { name: 'Protein', value: Math.round((totals.protein * 4 / total) * 100), color: 'var(--blue)' },
      { name: 'Kohlenhydrate', value: Math.round((totals.carbs * 4 / total) * 100), color: 'var(--accent)' },
      { name: 'Fett', value: Math.round((totals.fat * 9 / total) * 100), color: 'var(--yellow)' },
    ];
  }, [totals]);

  const weekData = useMemo(() => {
    const rows = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(date); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const t = sumMeals(meals.filter((m) => m.date === ds));
      rows.push({ date: ds.slice(5), kcal: t.kcal });
    }
    return rows;
  }, [meals, date]);

  const waterToday = water.find((w) => w.date === date)?.ml || 0;
  const waterGoal = settings.waterGoalMl || 2500;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Ernährung</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Mahlzeiten, Kalorien & Makros im Blick.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={() => shiftDate(-1)}><ChevronLeft size={15} /></button>
          <input className="input w-40" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn-sm" onClick={() => shiftDate(1)}><ChevronRight size={15} /></button>
          <button className="btn btn-sm" onClick={() => setShowSettings((s) => !s)}><Settings2 size={15} /></button>
        </div>
      </div>

      {showSettings && (
        <div className="card grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Kalorienziel überschreiben</label>
            <input className="input" type="number" placeholder={targetCalories} value={settings.calorieOverride ?? ''}
              onChange={(e) => saveSettings({ calorieOverride: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div>
            <label className="label">Wasserziel (ml)</label>
            <input className="input" type="number" value={settings.waterGoalMl} onChange={(e) => saveSettings({ waterGoalMl: Number(e.target.value) })} />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.addBurnedCalories} onChange={(e) => saveSettings({ addBurnedCalories: e.target.checked })} />
              Verbrannte Kalorien aus Tracker addieren
            </label>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card flex flex-col items-center justify-center">
          <span className="eyebrow mb-2">Kalorien heute</span>
          <CalorieRing target={targetCalories || 0} eaten={totals.kcal} burned={burnedToday} addBurned={settings.addBurnedCalories} />
          <span className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {Math.round(totals.kcal)} / {targetCalories} kcal gegessen{settings.addBurnedCalories && burnedToday > 0 ? ` · +${burnedToday} kcal verbrannt` : ''}
          </span>
        </div>

        <div className="card flex flex-col gap-4 justify-center">
          <MacroBar label="Protein" current={totals.protein} target={targetMacros.protein} color="var(--blue)" />
          <MacroBar label="Kohlenhydrate" current={totals.carbs} target={targetMacros.carbs} color="var(--accent)" />
          <MacroBar label="Fett" current={totals.fat} target={targetMacros.fat} color="var(--yellow)" />
        </div>

        <div className="card flex flex-col items-center">
          <span className="eyebrow mb-2">Makro-Verteilung heute</span>
          {macroDistribution.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={macroDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65}>
                  {macroDistribution.map((m, i) => <Cell key={i} fill={m.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm py-8" style={{ color: 'var(--text-muted)' }}>Noch keine Einträge</p>}
          <div className="flex gap-3 text-[11px] flex-wrap justify-center">
            {macroDistribution.map((m) => (
              <span key={m.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: m.color }} />{m.name} {m.value}%</span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Alle Kalorien- und Makrowerte sind Richtwerte, keine medizinische oder ernährungswissenschaftliche Beratung.
      </p>

      <div className="flex flex-wrap gap-2">
        {yesterdayMeals.length > 0 && (
          <button className="btn btn-sm" onClick={takeoverYesterday}>Von gestern übernehmen</button>
        )}
      </div>

      {SECTIONS.map((section) => {
        const entries = dayMeals.filter((m) => m.section === section);
        const draft = getDraft(section);
        const sectionFood = { per100: { kcal: draft.kcal, protein: draft.protein, carbs: draft.carbs, fat: draft.fat } };
        return (
          <div key={section} className="card">
            <h3 className="font-bold mb-3">{section}</h3>
            <div className="flex flex-col gap-2 mb-3">
              {entries.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--bg-elevated)' }}>
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {m.qty}{m.unit} · {Math.round(m.kcal)} kcal · P{Math.round(m.protein)} K{Math.round(m.carbs)} F{Math.round(m.fat)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="btn btn-ghost btn-sm" title="Favorit" onClick={() => toggleFavorite(m)}>
                      <Star size={14} fill={m.favorite ? 'var(--accent-2)' : 'none'} color="var(--accent-2)" />
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Duplizieren" onClick={() => duplicateEntry(m)}><Copy size={14} /></button>
                    <button className="btn btn-ghost btn-danger btn-sm" onClick={() => deleteMeal(m.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2">
              <span className="label col-span-2 sm:col-span-1">Lebensmittel</span>
              <span className="label hidden sm:block">Menge</span>
              <span className="label hidden sm:block">Einheit</span>
              <span className="label hidden sm:block">kcal</span>
              <span className="label hidden sm:block">Protein</span>
              <span className="label hidden sm:block">Carbs</span>
              <span className="label hidden sm:block">Fett</span>
              <span className="hidden sm:block" />

              <div className="col-span-2 sm:col-span-1">
                <FoodAutocomplete
                  value={draft.name}
                  onChange={(v) => setDraft(section, { ...draft, name: v, selectedFood: null })}
                  onSelect={(f) => handleSelectFood(section, f)}
                  customFoods={foods}
                />
              </div>
              <input className="input" type="number" placeholder="Menge" value={draft.qty} onChange={(e) => handleQtyChange(section, e.target.value)} />
              <select className="input" value={draft.unit} onChange={(e) => handleUnitChange(section, e.target.value)}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
              <input className="input" type="number" placeholder="kcal" value={draft.kcal} onChange={(e) => setDraft(section, { ...draft, kcal: e.target.value })} />
              <input className="input" type="number" placeholder="g" value={draft.protein} onChange={(e) => setDraft(section, { ...draft, protein: e.target.value })} />
              <input className="input" type="number" placeholder="g" value={draft.carbs} onChange={(e) => setDraft(section, { ...draft, carbs: e.target.value })} />
              <input className="input" type="number" placeholder="g" value={draft.fat} onChange={(e) => setDraft(section, { ...draft, fat: e.target.value })} />
              <button className="btn btn-accent btn-sm" onClick={() => submitEntry(section)}><Plus size={14} /></button>
              {draft.selectedFood && draft.unit !== 'g' && draft.unit !== 'ml' && (
                <span className="col-span-2 sm:col-span-8 text-[11px] -mt-1" style={{ color: 'var(--text-muted)' }}>
                  ≈ {gramsForUnit(draft.selectedFood, draft.unit) * (Number(draft.qty) || 0)} g
                  {draft.selectedFood.servings?.[draft.unit] ? '' : ' (Schätzwert)'}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {favorites.length > 0 && (
        <div className="card">
          <h3 className="font-bold mb-3">Favoriten</h3>
          <div className="flex flex-wrap gap-2">
            {favorites.slice(0, 10).map((m) => (
              <div key={m.id} className="chip cursor-pointer" onClick={() => addFavoriteToDay(m, m.section)}>
                {m.name} ({Math.round(m.kcal)} kcal) · zu {m.section}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold mb-3">Eigenes Lebensmittel anlegen</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input className="input col-span-2" placeholder="Name" value={customFood.name} onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })} />
            <input className="input" type="number" placeholder="kcal/100g" value={customFood.kcal} onChange={(e) => setCustomFood({ ...customFood, kcal: e.target.value })} />
            <input className="input" type="number" placeholder="Protein/100g" value={customFood.protein} onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })} />
            <input className="input" type="number" placeholder="Kohlenh./100g" value={customFood.carbs} onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })} />
            <input className="input" type="number" placeholder="Fett/100g" value={customFood.fat} onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })} />
          </div>
          <button className="btn btn-accent btn-sm" onClick={saveCustomFood}><Plus size={14} /> Lebensmittel speichern</button>
          {foods.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {foods.slice(-8).map((f) => <span key={f.id} className="chip">{f.name}</span>)}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold mb-3">Eigenes Rezept / Kombi-Mahlzeit</h3>
          <input className="input mb-2" placeholder="Rezeptname" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} />
          <div className="flex flex-col gap-1 mb-2 max-h-28 overflow-y-auto">
            {recipeIngredients.map((ing, i) => (
              <div key={i} className="flex justify-between items-center text-xs rounded-md px-2 py-1" style={{ background: 'var(--bg-elevated)' }}>
                <span>{ing.name} · {ing.qty}g · {ing.kcal} kcal</span>
                <button className="btn btn-ghost btn-sm" onClick={() => removeRecipeIngredient(i)}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[2fr_1fr] gap-2 mb-2">
            <FoodAutocomplete value={recipeDraft.name} onChange={(v) => setRecipeDraft({ ...recipeDraft, name: v })} onSelect={addRecipeIngredient} customFoods={foods} placeholder="Zutat hinzufügen…" />
            <input className="input" type="number" placeholder="g" value={recipeDraft.qty} onChange={(e) => setRecipeDraft({ ...recipeDraft, qty: e.target.value })} />
          </div>
          <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            Summe: {Math.round(recipeTotals.kcal)} kcal · P{Math.round(recipeTotals.protein)} K{Math.round(recipeTotals.carbs)} F{Math.round(recipeTotals.fat)}
          </div>
          <button className="btn btn-accent btn-sm" onClick={saveRecipe}><Plus size={14} /> Rezept speichern</button>

          {recipes.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Hinzufügen zu:</span>
                <select className="input w-36" value={recipeTargetSection} onChange={(e) => setRecipeTargetSection(e.target.value)}>
                  {SECTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {recipes.map((r) => (
                  <span key={r.id} className="chip cursor-pointer" onClick={() => addRecipeToDay(r)}>
                    {r.name} ({Math.round(r.totals.kcal)} kcal)
                    <Trash2 size={11} className="ml-1" onClick={(e) => { e.stopPropagation(); deleteRecipe(r.id); }} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Droplet size={16} color="var(--blue)" />
          <h3 className="font-bold">Wasseraufnahme</h3>
          <span className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>{waterToday} / {waterGoal} ml</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-elevated)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min((waterToday / waterGoal) * 100, 100)}%`, background: 'var(--blue)' }} />
        </div>
        <div className="flex gap-2">
          {[250, 500, 750].map((ml) => (
            <button key={ml} className="btn btn-sm" onClick={() => setWaterForDate(date, waterToday + ml)}>+{ml} ml</button>
          ))}
          <button className="btn btn-sm btn-ghost" onClick={() => setWaterForDate(date, 0)}>Zurücksetzen</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold mb-3">Woche im Überblick</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="kcal" name="Kalorien" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            {targetCalories && <ReferenceLine y={targetCalories} stroke="var(--blue)" strokeDasharray="4 4" label={{ value: 'Ziel', fill: 'var(--text-muted)', fontSize: 11 }} />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="font-bold mb-3">Mahlzeitenvorschläge für dein Ziel ({profile.goal})</h3>
        <div className="flex flex-wrap gap-2">
          {(SUGGESTIONS[profile.goal] || SUGGESTIONS['Allgemeine Fitness']).map((s, i) => <span key={i} className="chip">{s}</span>)}
        </div>
      </div>
    </div>
  );
}
