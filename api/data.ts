
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CustodyData } from '../types';

const redis = new Redis({
  url: process.env.KV_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Username is required.' });
  }

  const dataKey = `data:${username.toLowerCase()}`;

  try {
    if (req.method === 'GET') {
      const data = await redis.get<CustodyData>(dataKey);
      return res.status(200).json(data || {});
    }

    if (req.method === 'POST') {
      const data: CustodyData = req.body;
      await redis.set(dataKey, JSON.stringify(data));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    console.error('API Error in /api/data:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}