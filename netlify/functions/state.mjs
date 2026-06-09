import { getStore } from '@netlify/blobs';

const STORE_NAME = 'league-state';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SHHCPLstaff1111';
const EMPTY_STATE = { players: [], games: [] };

export default async function handler(req) {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });

  if (req.method === 'GET') {
    const data = await store.get('state', { type: 'json' });
    return Response.json(data || EMPTY_STATE);
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    if (!body.password || body.password !== ADMIN_PASSWORD) {
      return new Response('Unauthorized', { status: 401 });
    }

    const incoming = body.state;
    if (!incoming || typeof incoming !== 'object') {
      return new Response('Missing state', { status: 400 });
    }

    await store.setJSON('state', {
      players: Array.isArray(incoming.players) ? incoming.players : [],
      games: Array.isArray(incoming.games) ? incoming.games : [],
    });

    return Response.json({ ok: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

export const config = {
  path: '/api/state',
};
