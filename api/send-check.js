import webpush from 'web-push';
import { getRedis, SUBS_KEY } from './_redis.js';

// Wird regelmäßig (alle paar Minuten, per externem Cron-Dienst) aufgerufen.
// Prüft pro Abo in dessen eigener Zeitzone, ob heute ein gewünschter Tag ist und die
// gewünschte Uhrzeit erreicht wurde, und schickt dann höchstens einmal pro Tag eine Push-Nachricht —
// funktioniert auch, wenn die App/Website beim Empfänger gerade geschlossen ist.

// Liefert Datum/Uhrzeit/Wochentag "vor Ort" in der gespeicherten Zeitzone des Nutzers.
function localNow(timezone) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || 'UTC',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
  const weekday = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return { dateStr, hour: Number(parts.hour), minute: Number(parts.minute), weekday };
}

export default async function handler(req, res) {
  // Optionaler Schutz: falls CRON_SECRET gesetzt ist, muss er per Query oder Bearer-Header mitgeschickt werden
  // (externe Cron-Dienste wie cron-job.org schicken i.d.R. keinen Vercel-Cron-Header, daher zusätzlich Query erlaubt).
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = req.headers.authorization === `Bearer ${cronSecret}` ? cronSecret : req.query?.secret;
  if (cronSecret && providedSecret !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: 'VAPID-Keys nicht konfiguriert' });
  }
  webpush.setVapidDetails('mailto:noreply@fittrack.app', vapidPublic, vapidPrivate);

  try {
    const redis = getRedis();
    const all = await redis.hgetall(SUBS_KEY);
    const entries = Object.entries(all || {});

    let sent = 0;
    let removed = 0;
    let skipped = 0;

    await Promise.all(entries.map(async ([endpoint, raw]) => {
      const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const { dateStr, hour, minute, weekday } = localNow(record.timezone);

      if (!record?.days?.includes(weekday)) { skipped++; return; }
      if (record.lastSentDate === dateStr) { skipped++; return; } // heute schon verschickt

      const [targetHour, targetMinute] = (record.time || '18:00').split(':').map(Number);
      const nowMinutes = hour * 60 + minute;
      const targetMinutes = targetHour * 60 + targetMinute;
      if (nowMinutes < targetMinutes) { skipped++; return; } // Zielzeit heute noch nicht erreicht

      try {
        await webpush.sendNotification(
          record.subscription,
          JSON.stringify({ title: 'FitTrack', body: record.message || 'Zeit für dein Training! 💪', url: '/' })
        );
        await redis.hset(SUBS_KEY, { [endpoint]: JSON.stringify({ ...record, lastSentDate: dateStr }) });
        sent++;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await redis.hdel(SUBS_KEY, endpoint);
          removed++;
        }
      }
    }));

    return res.status(200).json({ ok: true, sent, removed, skipped, checked: entries.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
