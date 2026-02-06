import Redis from 'ioredis';

export default async function handler(req, res) {
  const redis = new Redis(process.env.REDIS_URL);

  try {
    if (!process.env.REDIS_URL) {
       // Fallback for dev/no-env
       return res.status(200).json({ count: 124 }); 
    }

    const count = await redis.get('valentine:stats:total_generated');
    await redis.quit();

    return res.status(200).json({ count: count || 0 });
  } catch {
    if (redis) await redis.quit();
    return res.status(500).json({ count: 0 });
  }
}