import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from './app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

declare global {
  var prisma: InstanceType<typeof PrismaClient> | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = globalThis.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

const app = express();

app.use(express.json());

// API routes
app.post('/api/check-user', async (req, res) => {
  const { clerkUserId, name, imageUrl, email } = req.body;

  if (!clerkUserId || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let user = await db.user.findUnique({
      where: { clerkUserId },
    });

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

// Serve frontend
app.use(express.static('build'));

app.get('{*path}', (req, res) =>
  res.sendFile('index.html', { root: path.join(__dirname, 'build') }),
);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`),
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: unknown, promise) => {
  console.log(
    `\x1b[31mError: ${err instanceof Error ? err.message : err}\x1b[0m`,
  );
  // Close server and exit process
  server.close(() => process.exit(1));
});

module.exports = app;
