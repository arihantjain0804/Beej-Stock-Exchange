const { Pool } = require('pg');
const logger = require('../utils/logger');
const pool = new Pool({ host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT) || 5432, database: process.env.DB_NAME || 'bse_db', user: process.env.DB_USER || 'bse_user', password: process.env.DB_PASSWORD, min: parseInt(process.env.DB_POOL_MIN) || 2, max: parseInt(process.env.DB_POOL_MAX) || 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
pool.on('error', (err) => logger.error('PostgreSQL pool error', { error: err.message }));
const query = async (text, params) => { try { const result = await pool.query(text, params); return result; } catch (err) { logger.error('DB query error', { error: err.message }); throw err; } };
const withTransaction = async (fn) => { const client = await pool.connect(); try { await client.query('BEGIN'); const result = await fn({ query: (text, params) => client.query(text, params) }); await client.query('COMMIT'); return result; } catch (err) { await client.query('ROLLBACK'); throw err; } finally { client.release(); } };
const testConnection = async () => { const result = await pool.query('SELECT NOW() AS now'); logger.info('PostgreSQL connected', { time: result.rows[0].now }); };
module.exports = { pool, query, withTransaction, testConnection };
