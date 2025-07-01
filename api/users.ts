
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { User } from '../types';

const redis = new Redis({
  url: process.env.KV_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { action, username, pin } = req.body;

    if (!action || !username || !pin) {
      return res.status(400).json({ message: 'Action, username, and PIN are required.' });
    }
     if (typeof username !== 'string' || typeof pin !== 'string') {
      return res.status(400).json({ message: 'Invalid input types.' });
    }

    const userKey = `user:${username.toLowerCase()}`;
    
    if (action === 'register') {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: 'PIN must be exactly 4 digits.' });
      }
      const existingUser = await redis.get<User>(userKey);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
      }

      const saltRounds = 10;
      const hashedPin = await bcrypt.hash(pin, saltRounds);
      
      const newUser: User = { username, pin: hashedPin };
      await redis.set(userKey, JSON.stringify(newUser));
      return res.status(201).json({ success: true, user: { username } });
    }

    if (action === 'login') {
      const existingUser = await redis.get<User>(userKey);
      if (!existingUser) {
        return res.status(401).json({ message: 'Invalid username or PIN.' });
      }

      const pinMatches = await bcrypt.compare(pin, existingUser.pin);
      if (!pinMatches) {
        return res.status(401).json({ message: 'Invalid username or PIN.' });
      }
      
      return res.status(200).json({ success: true, user: { username } });
    }

    return res.status(400).json({ message: 'Invalid action specified.' });

  } catch (error) {
    console.error('API Error in /api/users:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}