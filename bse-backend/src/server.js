require('dotenv').config();

const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const helmet     = require('helmet');
const compression = require('compression');
const logger     = require('./utils/logger');
const { testConnection } = require('./config/database');
const redis      = require('./config/redis');
const routes     = require('./routes/index');
const { errorHandler } = require('./middleware/errorHandler');
const { createPriceServer } = require('./websocket/priceServer');

const app    = express();

// Render (like most PaaS) sits behind a single reverse proxy and adds an
// X-Forwarded-For header. Without this, express-rate-limit throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every rate-limited request, since it
// can't safely trust that header to identify the real client IP.
// '1' = trust exactly one hop, matching Render's proxy setup.
app.set('trust proxy', 1);

const server = http.createServer(app);
const PORT   = process.env.PORT || 3001;

// ── Security & Parsing ───────────────────────────────────────
app.use(helmet());
// Allow the deployed frontend (from FRONTEND_URL) plus local dev servers.
// Using a function (not a fixed string) lets us permit multiple origins
// safely, which a single origin: '<url>' can't do.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow tools with no origin header (curl, server-to-server, some mobile clients)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (dev) ─────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// ── API Routes ───────────────────────────────────────────────
app.use('/api', routes);

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` } });
});

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ── Boot ─────────────────────────────────────────────────────
async function boot() {
  try {
    await testConnection();
    logger.info('Database ready');

    // Redis is optional for dev without Redis running
    try {
      await redis.connect();
    } catch (e) {
      logger.warn('Redis unavailable — caching and pub/sub disabled', { error: e.message });
    }

    createPriceServer(server);

    server.listen(PORT, () => {
      logger.info(`🌾 BSE Backend running on port ${PORT}`, {
        env: process.env.NODE_ENV || 'development',
        ws: `ws://localhost:${PORT}/ws`,
      });
    });
  } catch (err) {
    logger.error('Boot failed', { error: err.message });
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException',  (err) => logger.error('Uncaught exception',  { error: err.message, stack: err.stack }));
process.on('unhandledRejection', (err) => logger.error('Unhandled rejection', { error: err?.message }));

boot();