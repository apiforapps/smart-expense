import { Router, Request, Response } from 'express';
import { db } from '../db';

export const transactionsRouter = Router();

transactionsRouter.get('/balance', async (req: Request, res: Response) => {
  const { clerkUserId } = req.query;

  if (!clerkUserId || typeof clerkUserId !== 'string') {
    return res.status(400).json({ error: 'Missing clerkUserId parameter' });
  }

  try {
    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = await db.transaction.findMany({
      where: { userId: clerkUserId },
      select: { amount: true },
    });

    let income = 0;
    let expenses = 0;

    for (const { amount } of transactions) {
      if (amount > 0) {
        income += amount;
      } else {
        expenses += amount;
      }
    }

    const balance = income + expenses;

    return res.json({
      balance: Math.round(balance * 100) / 100,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(Math.abs(expenses) * 100) / 100,
    });
  } catch (err) {
    console.error('get-balance error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

transactionsRouter.post('/', async (req: Request, res: Response) => {
  const { clerkUserId, amount, description } = req.body;

  if (!clerkUserId || amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return res.status(400).json({ error: 'Amount must be a number' });
  }

  try {
    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transaction = await db.transaction.create({
      data: {
        userId: clerkUserId,
        amount: numericAmount,
        description: description ?? null,
      },
    });

    return res.status(201).json(transaction);
  } catch (err) {
    console.error('create-transaction error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
