// Gemeinsame Datenschicht für Fitness-Tracker.
// Jeder Adapter normalisiert Provider-Daten in ein einheitliches internes Format:
//   Activity:  { id, provider, type, date, durationMin, distanceKm, pace, kcal, avgHr }
//   Sleep:     { id, provider, date, totalMin, deep, light, rem, score }
//   DailyStat: { id, provider, date, steps, restingHr, stress, bodyBattery }
//
// Reale Anbindung nutzt OAuth 2.0 / PKCE (Garmin, Fitbit, Polar, Strava) bzw.
// Datei-Import (HealthKit-Export, Health Connect, .fit/.gpx/.tcx/.csv).
// Ohne hinterlegte API-Keys laufen alle Adapter im Demo-Modus mit generierten Daten,
// die OAuth-Struktur (connect/disconnect/authUrl) ist aber bereits vorbereitet.

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

function genDemoData(provider, capabilities) {
  const rnd = seededRandom(provider.length * 97 + 13);
  const activities = [];
  const sleep = [];
  const daily = [];

  for (let i = 0; i < 30; i++) {
    const date = dateStr(i);
    if (capabilities.includes('activities') && rnd() > 0.55) {
      const types = ['Laufen', 'Radfahren', 'Krafttraining'];
      const type = types[Math.floor(rnd() * types.length)];
      const durationMin = Math.round(20 + rnd() * 50);
      const isCardio = type !== 'Krafttraining';
      activities.push({
        id: `${provider}-act-${i}`,
        provider,
        type,
        date,
        durationMin,
        distanceKm: isCardio ? Math.round((durationMin / 6 + rnd() * 3) * 10) / 10 : null,
        pace: isCardio ? `${(4 + rnd() * 2).toFixed(1)} min/km` : null,
        kcal: Math.round(durationMin * (isCardio ? 9 : 6) + rnd() * 50),
        avgHr: Math.round(115 + rnd() * 45),
      });
    }
    if (capabilities.includes('sleep')) {
      const totalMin = Math.round(360 + rnd() * 120);
      const deep = Math.round(totalMin * (0.15 + rnd() * 0.1));
      const rem = Math.round(totalMin * (0.18 + rnd() * 0.08));
      const light = totalMin - deep - rem;
      sleep.push({
        id: `${provider}-sleep-${i}`,
        provider,
        date,
        totalMin,
        deep,
        light,
        rem,
        score: Math.round(55 + rnd() * 40),
      });
    }
    if (capabilities.includes('daily')) {
      daily.push({
        id: `${provider}-daily-${i}`,
        provider,
        date,
        steps: capabilities.includes('steps') ? Math.round(3000 + rnd() * 10000) : null,
        restingHr: capabilities.includes('hr') ? Math.round(52 + rnd() * 20) : null,
        stress: capabilities.includes('stress') ? Math.round(15 + rnd() * 60) : null,
        bodyBattery: capabilities.includes('bodyBattery') ? Math.round(20 + rnd() * 80) : null,
      });
    }
  }
  return { activities, sleep, daily };
}

// Adapter-Registry — jeder Eintrag beschreibt Fähigkeiten + Auth-Methode.
// `capabilities` steuert, welche Felder das Gerät liefert (Rest wird ausgegraut statt 0 angezeigt).
export const PROVIDERS = [
  {
    id: 'garmin',
    name: 'Garmin',
    authType: 'oauth2-pkce',
    authUrlBase: 'https://connect.garmin.com/oauth2Confirm',
    capabilities: ['activities', 'sleep', 'daily', 'steps', 'hr', 'stress', 'bodyBattery'],
    description: 'Garmin Connect Developer API',
  },
  {
    id: 'apple',
    name: 'Apple Watch / iPhone',
    authType: 'file-import',
    importHint: 'export.zip / export.xml aus der Health-App',
    capabilities: ['activities', 'sleep', 'daily', 'steps', 'hr'],
    description: 'Apple HealthKit (Export-Import)',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    authType: 'oauth2',
    authUrlBase: 'https://www.fitbit.com/oauth2/authorize',
    capabilities: ['activities', 'sleep', 'daily', 'steps', 'hr'],
    description: 'Fitbit Web API',
  },
  {
    id: 'polar',
    name: 'Polar',
    authType: 'oauth2',
    authUrlBase: 'https://flow.polar.com/oauth2/authorization',
    capabilities: ['activities', 'sleep', 'daily', 'hr'],
    description: 'Polar AccessLink API',
  },
  {
    id: 'samsung',
    name: 'Samsung Health / Wear OS',
    authType: 'health-connect',
    capabilities: ['activities', 'sleep', 'daily', 'steps', 'hr'],
    description: 'Health Connect',
  },
  {
    id: 'strava',
    name: 'Strava',
    authType: 'oauth2',
    authUrlBase: 'https://www.strava.com/oauth/authorize',
    capabilities: ['activities', 'daily', 'hr'],
    description: 'Strava API (Lauf- & Raddaten)',
  },
  {
    id: 'manual',
    name: 'Manueller Import',
    authType: 'file-import',
    importHint: '.fit, .gpx, .tcx, .csv',
    capabilities: ['activities'],
    description: 'Datei-Upload als Fallback',
  },
];

export function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id);
}

// Baut die (mock) Autorisierungs-URL für OAuth-Provider (PKCE-Grundgerüst vorbereitet).
export function buildAuthUrl(provider, clientId = 'demo-client-id') {
  if (provider.authType !== 'oauth2' && provider.authType !== 'oauth2-pkce') return null;
  const redirectUri = `${window.location.origin}/devices/callback/${provider.id}`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'activity sleep heart_rate',
  });
  if (provider.authType === 'oauth2-pkce') {
    params.set('code_challenge_method', 'S256');
    params.set('code_challenge', 'demo-pkce-challenge');
  }
  return `${provider.authUrlBase}?${params.toString()}`;
}

// Demo-Sync: liefert normalisierte Daten ohne echte API-Anbindung.
export async function syncProvider(providerId) {
  const provider = getProvider(providerId);
  if (!provider) throw new Error('Unbekannter Provider');
  await new Promise((r) => setTimeout(r, 400));
  return genDemoData(providerId, provider.capabilities);
}

// CSV-Zeile splitten, respektiert Anführungszeichen (Garmin-Export nutzt "1,234" mit Komma).
function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Sucht per Alias-Liste (normalisierte Header-Namen) den ersten passenden Wert.
function pick(obj, aliases) {
  for (const alias of aliases) {
    if (obj[alias] !== undefined && obj[alias] !== '') return obj[alias];
  }
  return undefined;
}

// "1:02:15" oder "12:34" → Minuten (Garmin "Time"-Spalte)
function parseDurationToMinutes(str) {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.some(Number.isNaN)) return Number(str) || 0;
  if (parts.length === 3) return Math.round(parts[0] * 60 + parts[1] + parts[2] / 60);
  if (parts.length === 2) return Math.round(parts[0] + parts[1] / 60);
  return Math.round(parts[0]);
}

// Garmin liefert Datumsangaben z.B. "2026-08-20 09:15:22" oder "Aug 20, 2026, 9:15 AM"
function parseGarminDate(str) {
  if (!str) return dateStr(0);
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const match = str.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : dateStr(0);
}

// Parser für manuellen Datei-Import: erkennt sowohl ein einfaches generisches CSV-Format
// (date,type,duration,distance,kcal,hr) als auch den echten Garmin-Connect-Aktivitäten-Export
// (Spalten wie "Activity Type","Date","Distance","Calories","Time","Avg HR").
export function parseCsvActivities(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const [headerLine, ...rowLines] = lines;
  const headers = splitCsvLine(headerLine).map(normalizeKey);

  return rowLines.map((line, i) => {
    const values = splitCsvLine(line);
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = values[idx] ?? ''));

    const type = pick(obj, ['activitytype', 'type']) || 'Training';
    const dateRaw = pick(obj, ['date', 'activitydate']);
    const durationRaw = pick(obj, ['time', 'movingtime', 'duration', 'durationmin']);
    const distanceRaw = pick(obj, ['distance', 'distancekm']);
    const kcalRaw = pick(obj, ['calories', 'kcal']);
    const hrRaw = pick(obj, ['avghr', 'hr']);
    const paceRaw = pick(obj, ['avgpace', 'pace']);

    return {
      id: `manual-${Date.now()}-${i}`,
      provider: 'manual',
      type,
      date: parseGarminDate(dateRaw),
      durationMin: parseDurationToMinutes(durationRaw),
      distanceKm: distanceRaw ? Number(distanceRaw.replace(',', '')) : null,
      pace: paceRaw || null,
      kcal: Math.round(Number((kcalRaw || '0').replace(/,/g, ''))) || 0,
      avgHr: hrRaw ? Number(hrRaw) : null,
    };
  });
}
