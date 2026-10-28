import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import publicRoutes from './routes/publicRoutes.js';
import { errorHandler, notFound } from './middleware/errors.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map(origin => origin.trim()).filter(Boolean);
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowed.includes(origin)) return callback(null, true);
      const error = new Error('Origin not allowed');
      error.code = 'CORS_BLOCKED';
      return callback(error);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }));
  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000, limit: 120,
    standardHeaders: 'draft-8', legacyHeaders: false,
    message: { error: 'RATE_LIMITED', message: 'Please try again later.' },
  }));
  app.use(express.json({ limit: '16kb' }));
  app.use('/api', publicRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
