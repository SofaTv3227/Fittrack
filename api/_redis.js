import { Redis } from '@upstash/redis';

// Erwartet Umgebungsvariablen aus der Vercel-Redis-Integration:
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (oder KV_REST_API_URL / KV_REST_API_TOKEN als Alias).
export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error('Redis ist nicht konfiguriert (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN fehlen).');
  }
  return new Redis({ url, token });
}

export const SUBS_KEY = 'fittrack:push:subscriptions';
