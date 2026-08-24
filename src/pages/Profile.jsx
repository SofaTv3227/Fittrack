import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { calcBMI, bmiCategory, calcTargetCalories } from '../lib/calculations';
import { Activity, Flame } from 'lucide-react';

const GOALS = ['Muskelaufbau', 'Kraft', 'Abnehmen', 'Ausdauer', 'Allgemeine Fitness'];
const EQUIPMENT = ['Gym', 'Homegym', 'Nur Körpergewicht'];
const EXPERIENCE = ['Anfänger', 'Fortgeschritten', 'Profi'];

export default function Profile() {
  const { profile, saveProfile, regeneratePlan } = useApp();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const numeric = {
      ...form,
      age: Number(form.age) || '',
      height: Number(form.height) || '',
      weight: Number(form.weight) || '',
      daysPerWeek: Number(form.daysPerWeek) || 3,
    };
    await saveProfile(numeric);
    await regeneratePlan();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const bmi = calcBMI(Number(form.weight), Number(form.height));
  const calories = calcTargetCalories({ ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) });

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Profil & Ziele</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Deine Angaben steuern Trainingsplan, Kalorien- und Makroziele.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <form className="grid sm:grid-cols-2 gap-4" onSubmit={handleSave}>
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Dein Name" />
            </div>
            <div>
              <label className="label">Alter</label>
              <input className="input" type="number" min="10" max="100" value={form.age} onChange={(e) => update('age', e.target.value)} />
            </div>
            <div>
              <label className="label">Geschlecht</label>
              <select className="input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option>männlich</option>
                <option>weiblich</option>
                <option>divers</option>
              </select>
            </div>
            <div />
            <div>
              <label className="label">Größe (cm)</label>
              <input className="input" type="number" value={form.height} onChange={(e) => update('height', e.target.value)} />
            </div>
            <div>
              <label className="label">Gewicht (kg)</label>
              <input className="input" type="number" value={form.weight} onChange={(e) => update('weight', e.target.value)} />
            </div>
            <div>
              <label className="label">Trainingserfahrung</label>
              <select className="input" value={form.experience} onChange={(e) => update('experience', e.target.value)}>
                {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Trainingstage / Woche</label>
              <input className="input" type="number" min="1" max="7" value={form.daysPerWeek} onChange={(e) => update('daysPerWeek', e.target.value)} />
            </div>
            <div>
              <label className="label">Ziel</label>
              <select className="input" value={form.goal} onChange={(e) => update('goal', e.target.value)}>
                {GOALS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Equipment</label>
              <select className="input" value={form.equipment} onChange={(e) => update('equipment', e.target.value)}>
                {EQUIPMENT.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 mt-2">
              <button type="submit" className="btn btn-accent">Speichern & Plan generieren</button>
              {saved && <span className="chip">Gespeichert ✓</span>}
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} color="var(--accent)" />
              <span className="eyebrow">BMI</span>
            </div>
            <div className="text-3xl font-extrabold">{bmi ? bmi.toFixed(1) : '–'}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{bmiCategory(bmi)}</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} color="var(--accent)" />
              <span className="eyebrow">Geschätzter Kalorienbedarf</span>
            </div>
            <div className="text-3xl font-extrabold">{calories ? `${calories}` : '–'}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>kcal / Tag (Mifflin-St-Jeor + Aktivität)</div>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Die berechneten Werte sind Richtwerte und ersetzen keine medizinische oder ernährungswissenschaftliche Beratung.
          </p>
        </div>
      </div>
    </div>
  );
}
