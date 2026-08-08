import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { CONFIG } from './server/config';
import {
  helmetMiddleware,
  corsMiddleware,
  globalRateLimiter,
  requestLogger,
  sanitizeRequestBody
} from './server/security';
import { apiRouter } from './server/routes/api';
import { errorHandler, notFoundHandler } from './server/middleware/errorHandler';

async function startServer() {
  const app = express();

  // Disable x-powered-by banner
  app.disable('x-powered-by');

  // Trust proxy for rate limiting behind reverse proxies (Nginx/Render/Railway/Vercel)
  app.set('trust proxy', 1);

  // Apply Security & Request Processing Middlewares
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(sanitizeRequestBody);

  // Liveness check for Kubernetes / Docker / Cloud hostings
  app.get('/healthz', (req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  // Apply Rate Limiter & API Routes
  app.use('/api', globalRateLimiter, apiRouter);

  // Serve Vite in Dev or Dist in Production
  if (CONFIG.NODE_ENV !== 'production' && process.env.VITE_DEV !== 'false') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1d', etag: true }));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error and 404 Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`🚀 PeerLink Server running on http://0.0.0.0:${CONFIG.PORT} (${CONFIG.NODE_ENV} mode)`);
  });

  // Graceful Shutdown Handling
  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      console.log('HTTP server closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
