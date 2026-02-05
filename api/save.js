import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'POST') {
    try {
      const data = await req.json();
      // Generate a short ID (7 chars is enough for millions of collisions)
      const id = nanoid(8);
      
      // Store data
      await kv.set(`valentine:${id}`, data);
      
      // Increment global counter
      await kv.incr('valentine:stats:total_generated');
      
      return new Response(JSON.stringify({ id, success: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    } catch (error) {
        console.error(error);
      return new Response(JSON.stringify({ error: 'Failed to save data' }), { status: 500 });
    }
  }
}