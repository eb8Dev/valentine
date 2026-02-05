import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) return new Response('Missing ID', { status: 400 });

  try {
    const data = await kv.get(`valentine:${id}`);
    
    if (!data) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
  }
}