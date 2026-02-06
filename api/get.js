import Redis from 'ioredis';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send('Missing ID');

  const redis = new Redis(process.env.REDIS_URL);

  try {
    if (!process.env.REDIS_URL) {
        throw new Error("REDIS_URL missing");
    }

    const data = await redis.get(`valentine:${id}`);
    await redis.quit();
    
    if (!data) {
        return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(JSON.parse(data));
  } catch {
    if (redis) await redis.quit();
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}