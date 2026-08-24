import { getRedis, SUBS_KEY } from './_redis.js';

// Speichert (oder aktualisiert) ein Push-Abo. Body: { subscription, time, days, message, timezone }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscription, time, days, message, timezone } = req.body || {};
  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'subscription.endpoint fehlt' });
  }

  try {
    const redis = getRedis();
    // lastSentDate bewusst nicht zurücksetzen, falls für diesen Endpoint schon ein Eintrag existiert,
    // damit ein erneutes Speichern der Einstellungen nicht am selben Tag zu einer Doppel-Benachrichtigung führt.
    const existingRaw = await redis.hget(SUBS_KEY, subscription.endpoint);
    const existing = existingRaw ? (typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw) : null;
    const record = {
      subscription,
      time: time || '18:00',
      days: Array.isArray(days) && days.length ? days : [1, 2, 3, 4, 5, 6, 0],
      message: message || 'Zeit für dein Training! 💪',
      timezone: timezone || 'Europe/Berlin',
      lastSentDate: existing?.lastSentDate || null,
      updatedAt: new Date().toISOString(),
    };
    // Ein Hash-Feld pro Subscription-Endpoint, damit ein erneutes Abo den alten Eintrag ersetzt statt dupliziert.
    await redis.hset(SUBS_KEY, { [subscription.endpoint]: JSON.stringify(record) });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
