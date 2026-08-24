import webpush from 'web-push';
import { getRedis, SUBS_KEY } from './_redis.js';

// Wird täglich per Vercel Cron aufgerufen (siehe vercel.json). Prüft pro Abo, ob heute
// ein gewünschter Erinnerungstag ist, und verschickt dann eine echte Push-Nachricht —
// funktioniert auch, wenn die App/Website beim Empfänger gerade geschlossen ist.
export default async function handler(req, res) {
  // Vercel Cron schickt automatisch "Authorization: Bearer <CRON_SECRET>", wenn CRON_SECRET gesetzt ist.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: 'VAPID-Keys nicht konfiguriert' });
  }
  webpush.setVapidDetails('mailto:noreply@fittrack.app', vapidPublic, vapidPrivate);

  const todayWeekday = new Date().getDay(); // 0 = So, 1 = Mo, ...

  try {
    const redis = getRedis();
    const all = await redis.hgetall(SUBS_KEY);
    const entries = Object.entries(all || {});

    let sent = 0;
    let removed = 0;

    await Promise.all(entries.map(async ([endpoint, raw]) => {
      const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!record?.days?.includes(todayWeekday)) return;

      try {
        await webpush.sendNotification(
          record.subscription,
          JSON.stringify({ title: 'FitTrack', body: record.message || 'Zeit für dein Training! 💪', url: '/' })
        );
        sent++;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await redis.hdel(SUBS_KEY, endpoint);
          removed++;
        }
      }
    }));

    return res.status(200).json({ ok: true, sent, removed, checked: entries.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
