import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import chatRouter from './api/chat';

dotenv.config();

const app = express();
const port = Number(process.env.AI_SERVER_PORT || 8787);
const distPath = path.resolve(process.cwd(), 'dist');
const hasBuiltFrontend = fs.existsSync(distPath);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    provider: 'gemini',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.use('/api', chatRouter);

if (hasBuiltFrontend) {
  app.use(express.static(distPath));
}

app.use((req, res) => {
  if (hasBuiltFrontend && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }

  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
});

app.listen(port, () => {
  console.log(`[AI Server] Listening on http://localhost:${port}`);
});
