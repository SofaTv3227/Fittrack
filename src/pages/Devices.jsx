import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { PROVIDERS, buildAuthUrl, syncProvider, parseCsvActivities } from '../lib/trackerAdapters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link2, RefreshCw, Upload, CheckCircle2, Circle } from 'lucide-react';

function fieldLabel(cap) {
  return { activities: 'Aktivitäten', sleep: 'Schlaf', daily: 'Tagesdaten', steps: 'Schritte', hr: 'Ruhepuls', stress: 'Stress', bodyBattery: 'Body Battery' }[cap] || cap;
}

export default function Devices() {
  const { devices, setDeviceState, saveDeviceData, deviceData } = useApp();
  const [syncing, setSyncing] = useState(null);
  const [range, setRange] = useState(7);

  const statusFor = (id) => devices.find((d) => d.id === id) || { connected: false, lastSync: null };

  const connect = async (provider) => {
    if (provider.authType === 'oauth2' || provider.authType === 'oauth2-pkce') {
      buildAuthUrl(provider); // OAuth-Struktur vorbereitet; im Demo-Modus direkt "verbunden"
    }
    await setDeviceState(provider.id, { connected: true });
    await handleSync(provider.id);
  };

  const disconnect = async (id) => setDeviceState(id, { connected: false });

  const handleSync = async (id) => {
    setSyncing(id);
    const data = await syncProvider(id);
    await saveDeviceData(id, data);
    await setDeviceState(id, { connected: true, lastSync: new Date().toISOString() });
    setSyncing(null);
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const activities = parseCsvActivities(text);
    await saveDeviceData('manual', { activities }, true);
    await setDeviceState('manual', { connected: true, lastSync: new Date().toISOString() });
    e.target.value = '';
  };

  const sleepHistory = useMemo(() => {
    const rows = deviceData.filter((d) => d.type_ === 'sleep').sort((a, b) => (a.date > b.date ? 1 : -1));
    return rows.slice(-range).map((r) => ({ date: r.date.slice(5), Stunden: Math.round((r.totalMin / 60) * 10) / 10 }));
  }, [deviceData, range]);

  const hrHistory = useMemo(() => {
    const rows = deviceData.filter((d) => d.type_ === 'daily' && d.restingHr != null).sort((a, b) => (a.date > b.date ? 1 : -1));
    return rows.slice(-range).map((r) => ({ date: r.date.slice(5), Ruhepuls: r.restingHr }));
  }, [deviceData, range]);

  return (
    <div className="animate-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Verbundene Geräte</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Alle Quellen werden in ein einheitliches internes Format normalisiert. Ohne echte API-Keys laufen die Adapter im Demo-Modus.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {PROVIDERS.map((provider) => {
          const status = statusFor(provider.id);
          return (
            <div key={provider.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    {status.connected ? <CheckCircle2 size={16} color="var(--green)" /> : <Circle size={16} color="var(--text-muted)" />}
                    <span className="font-bold">{provider.name}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{provider.description}</p>
                </div>
                <span className="chip">{status.connected ? 'Verbunden' : 'Getrennt'}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {provider.capabilities.map((c) => <span key={c} className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{fieldLabel(c)}</span>)}
              </div>

              <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Letzter Sync: {status.lastSync ? new Date(status.lastSync).toLocaleString('de-DE') : '–'}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!status.connected && provider.authType !== 'file-import' && (
                  <button className="btn btn-accent btn-sm" onClick={() => connect(provider)}><Link2 size={14} /> Verbinden (OAuth)</button>
                )}
                {!status.connected && provider.authType === 'file-import' && provider.id !== 'manual' && (
                  <button className="btn btn-accent btn-sm" onClick={() => connect(provider)}><Upload size={14} /> Demo verbinden</button>
                )}
                {provider.id === 'manual' && (
                  <label className="btn btn-sm cursor-pointer">
                    <Upload size={14} /> {provider.importHint}
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
                  </label>
                )}
                {status.connected && (
                  <>
                    <button className="btn btn-sm" onClick={() => handleSync(provider.id)} disabled={syncing === provider.id}>
                      <RefreshCw size={14} className={syncing === provider.id ? 'animate-spin' : ''} /> Jetzt synchronisieren
                    </button>
                    <button className="btn btn-ghost btn-sm btn-danger" onClick={() => disconnect(provider.id)}>Trennen</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Zeitraum:</span>
        {[7, 30].map((r) => (
          <button key={r} className="btn btn-sm" style={{ borderColor: range === r ? 'var(--accent)' : 'var(--border)' }} onClick={() => setRange(r)}>{r} Tage</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-bold mb-3">Schlaf – Verlauf</h3>
          {sleepHistory.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sleepHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="Stunden" stroke="var(--accent)" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>Kein Gerät mit Schlafdaten verbunden.</p>}
        </div>
        <div className="card">
          <h3 className="font-bold mb-3">Ruhepuls – Verlauf</h3>
          {hrHistory.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={hrHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="Ruhepuls" stroke="var(--blue)" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>Kein Gerät mit Ruhepuls-Daten verbunden.</p>}
        </div>
      </div>
    </div>
  );
}
