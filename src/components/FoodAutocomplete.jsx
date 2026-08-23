import { useState, useRef, useEffect } from 'react';
import { searchFoods } from '../lib/foodDatabase';

export default function FoodAutocomplete({ value, onChange, onSelect, customFoods = [], placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = searchFoods(value, customFoods);

  return (
    <div className="relative" ref={ref}>
      <input
        className="input"
        placeholder={placeholder || 'Lebensmittel suchen…'}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-xl overflow-hidden max-h-56 overflow-y-auto"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow)' }}>
          {results.map((f) => (
            <button
              key={f.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--accent-soft)] transition-colors flex justify-between"
              onClick={() => { onSelect(f); setOpen(false); }}
            >
              <span>{f.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{f.per100.kcal} kcal/100g</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
