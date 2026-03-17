import { Router, Request, Response } from 'express';
import { db } from '../db';

export const usersRouter = Router();

usersRouter.post('/check-user', async (req: Request, res: Response) => {
  const { clerkUserId, name, imageUrl, email } = req.body;

  if (!clerkUserId || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let user = await db.user.findUnique({ where: { clerkUserId } });

    if (!user) {
      user = await db.user.create({
        data: { clerkUserId, name, imageUrl, email },
      });
    }

    return res.json(user);
  } catch (err) {
    console.error('check-user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
