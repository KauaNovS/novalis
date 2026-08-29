import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

// Logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
    },
  },
});

// Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware de Segurança
// ============================================
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ============================================
// Middleware de Parsing
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// Request logging middleware
// ============================================
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
});

// ============================================
// Health check
// ============================================
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// API Routes (placeholder)
// ============================================
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Novalis API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      empreendimentos: 'GET /api/empreendimentos',
      unidades: 'GET /api/unidades',
      import: {
        tabelao: 'POST /api/import/tabelao',
        book: 'POST /api/import/book',
        espelho: 'POST /api/import/espelho',
        precos: 'POST /api/import/precos',
        financiamento: 'POST /api/import/financiamento',
      },
    },
  });
});

// ============================================
// Placeholder routes (TODO: implementar)
// ============================================
app.get('/api/empreendimentos', (req: Request, res: Response) => {
  res.json({
    message: 'GET /api/empreendimentos - Coming soon',
    status: 'not implemented',
  });
});

app.get('/api/unidades', (req: Request, res: Response) => {
  res.json({
    message: 'GET /api/unidades - Coming soon',
    status: 'not implemented',
  });
});

// ============================================
// Error handling
// ============================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
});

// ============================================
// Start server
// ============================================
app.listen(PORT, () => {
  logger.info(`🚀 Novalis API running on http://localhost:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1] || 'not configured'}`);
});

export default app;
