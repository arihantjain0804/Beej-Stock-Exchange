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
const server = http.createServer(app);
const PORT   = process.env.PORT || 3001;

// ── Security & Parsing ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
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
