import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());

// Serve frontend
app.use(express.static('build'));

app.get('{*path}', (_req, res) =>
  res.sendFile('index.html', { root: path.join(__dirname, 'build') }),
);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`),
);

process.on('unhandledRejection', (err: unknown) => {
  console.error(`Unhandled rejection: ${err instanceof Error ? err.message : err}`);
  server.close(() => process.exit(1));
});

module.exports = app;
