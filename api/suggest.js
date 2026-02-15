import Redis from 'ioredis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const redis = new Redis(process.env.REDIS_URL);

  try {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL is missing");
    }

    const { suggestion, name } = req.body;
    if (!suggestion) return res.status(400).json({ error: "Suggestion is required" });

    const entry = {
      name: name || "Anonymous",
      suggestion,
      timestamp: new Date().toISOString()
    };

    // Store in a list
    await redis.lpush('valentine:suggestions', JSON.stringify(entry));
    await redis.quit();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Suggestion Error:", error);
    if (redis) await redis.quit();
    return res.status(500).json({ error: 'Failed to save suggestion' });
  }
}
