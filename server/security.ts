import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { CONFIG } from './config';

// CORS configuration
export const corsMiddleware = cors({
  origin: CONFIG.CORS_ORIGIN === '*' ? true : CONFIG.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Helmet Security Headers
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://ai.google.dev"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Rate Limiters
export const globalRateLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.GLOBAL_WINDOW_MS,
  max: CONFIG.RATE_LIMIT.GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

export const authRateLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.AUTH_WINDOW_MS,
  max: CONFIG.RATE_LIMIT.AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.'
  }
});

export const aiRateLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.AI_WINDOW_MS,
  max: CONFIG.RATE_LIMIT.AI_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI request limit reached. Please wait a minute before sending another message.'
  }
});

// Audit & Request Logger Middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  (req as any).id = reqId;
  res.setHeader('X-Request-ID', reqId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] [${reqId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};

// Input Sanitization Helper
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Request Body Sanitizer Middleware
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};
