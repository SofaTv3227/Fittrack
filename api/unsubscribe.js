import { getRedis, SUBS_KEY } from './_redis.js';

// Entfernt ein Push-Abo. Body: { endpoint }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: 'endpoint fehlt' });

  try {
    const redis = getRedis();
    await redis.hdel(SUBS_KEY, endpoint);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
