import Redis from 'ioredis';

export default async function handler(req, res) {
  const { password } = req.query;

  // Simple password check - in a real app, use a more secure method or environment variable
  if (password !== process.env.SUGGESTIONS_PASSWORD && password !== "love2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const redis = new Redis(process.env.REDIS_URL);

  try {
    const suggestions = await redis.lrange('valentine:suggestions', 0, -1);
    await redis.quit();

    const parsed = suggestions.map(s => JSON.parse(s));
    return res.status(200).json({ suggestions: parsed });
  } catch (error) {
    console.error("View Error:", error);
    if (redis) await redis.quit();
    return res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
}
