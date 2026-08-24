import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { isPushSupported, getExistingSubscription, subscribeToPush, saveSubscription, unsubscribeFromPush } from '../lib/push';

const WEEKDAYS = [
  { value: 1, label: 'Mo' }, { value: 2, label: 'Di' }, { value: 3, label: 'Mi' }, { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' }, { value: 6, label: 'Sa' }, { value: 0, label: 'So' },
];

export default function NotificationSettings() {
  const supported = isPushSupported();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [time, setTime] = useState('18:00');
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 0]);
  const [message, setMessage] = useState('Zeit für dein Training! 💪');

  useEffect(() => {
    if (!supported) return;
    getExistingSubscription().then((sub) => setEnabled(!!sub));
  }, [supported]);

  const toggleDay = (v) => setDays((prev) => (prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]));

  const handleEnable = async () => {
    setBusy(true);
    setError('');
    try {
      const sub = await subscribeToPush();
      await saveSubscription(sub, { time, days, message });
      setEnabled(true);
    } catch (e) {
      setError(e.message || 'Konnte Benachrichtigungen nicht aktivieren.');
    }
    setBusy(false);
  };

  const handleUpdate = async () => {
    setBusy(true);
    setError('');
    try {
      const sub = await getExistingSubscription();
      if (sub) await saveSubscription(sub, { time, days, message });
    } catch (e) {
      setError(e.message || 'Konnte Einstellungen nicht speichern.');
    }
    setBusy(false);
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      await unsubscribeFromPush();
      setEnabled(false);
    } catch {
      /* still mark as disabled locally */
      setEnabled(false);
    }
    setBusy(false);
  };

  if (!supported) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-1"><BellOff size={16} color="var(--text-muted)" /><span className="eyebrow">Push-Benachrichtigungen</span></div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dein Browser unterstützt keine Push-Benachrichtigungen.</p>
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Bell size={16} color="var(--accent)" />
        <span className="eyebrow">Push-Benachrichtigungen</span>
        {enabled && <span className="chip ml-auto">Aktiv</span>}
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Echte Benachrichtigungen, die auch ankommen, wenn FitTrack gerade nicht geöffnet ist.
      </p>

      <div>
        <label className="label">Uhrzeit</label>
        <input className="input w-32" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <div>
        <label className="label">An diesen Tagen</label>
        <div className="flex gap-1.5 flex-wrap">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              className="btn btn-sm"
              onClick={() => toggleDay(d.value)}
              style={{
                borderColor: days.includes(d.value) ? 'var(--accent)' : 'var(--border)',
                background: days.includes(d.value) ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                color: days.includes(d.value) ? 'var(--accent)' : 'var(--text)',
                minWidth: 42,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Nachricht</label>
        <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={120} />
      </div>

      {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}

      <div className="flex gap-2">
        {!enabled ? (
          <button className="btn btn-accent" onClick={handleEnable} disabled={busy}>Benachrichtigungen aktivieren</button>
        ) : (
          <>
            <button className="btn" onClick={handleUpdate} disabled={busy}>Speichern</button>
            <button className="btn btn-ghost btn-danger" onClick={handleDisable} disabled={busy}>Deaktivieren</button>
          </>
        )}
      </div>
    </div>
  );
}
