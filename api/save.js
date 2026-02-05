import Redis from 'ioredis';

// Use standard Node.js runtime instead of Edge for REDIS_URL compatibility
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const redis = new Redis(process.env.REDIS_URL);

  const generateId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  try {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL is missing in environment variables");
    }

    const data = req.body;
    const id = generateId(8);
    
    // Store data (valid for 30 days)
    await redis.set(`valentine:${id}`, JSON.stringify(data), 'EX', 60 * 60 * 24 * 30);
    
    // Increment global counter
    await redis.incr('valentine:stats:total_generated');
    
    await redis.quit();

    return res.status(200).json({ id, success: true });
  } catch (error) {
    console.error("API Error:", error);
    if (redis) await redis.quit();
    return res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
}