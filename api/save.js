import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
};

export default async function handler(req) {
  if (req.method === 'POST') {
    try {
      if (!process.env.KV_REST_API_URL) {
        console.error("KV_REST_API_URL is missing. Did you connect the database and Redeploy?");
        throw new Error("Database configuration missing");
      }

      const data = await req.json();
      const id = generateId(8);
      
      // Store data
      await kv.set(`valentine:${id}`, data);
      
      // Increment global counter
      await kv.incr('valentine:stats:total_generated');
      
      return new Response(JSON.stringify({ id, success: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    } catch (error) {
      console.error("API Error:", error);
      return new Response(JSON.stringify({ error: 'Failed to save data', details: error.message }), { status: 500 });
    }
  }
}