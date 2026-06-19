const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { query } = require('../config/database');
const { success, created, notFound, error } = require('../utils/response');
const createAlertValidation = [ body('symbol').notEmpty().withMessage('Symbol required'), body('alert_type').isIn(['price_above','price_below','yield_update','harvest_alert']), validate ];
const getAlerts = async (req, res) => { const { rows } = await query(`SELECT a.*,ct.symbol,ct.name AS token_name,ct.current_price_inr FROM price_alerts a JOIN crop_tokens ct ON ct.id=a.token_id WHERE a.user_id=$1 ORDER BY a.created_at DESC`, [req.user.sub]); return success(res, rows); };
const createAlert = async (req, res) => { const { symbol, alert_type, threshold_inr } = req.body; const tokenRes = await query('SELECT id FROM crop_tokens WHERE symbol=$1', [symbol.toUpperCase()]); if (!tokenRes.rows.length) return notFound(res, 'Token'); const { rows } = await query(`INSERT INTO price_alerts (user_id,token_id,alert_type,threshold_inr) VALUES ($1,$2,$3,$4) RETURNING *`, [req.user.sub, tokenRes.rows[0].id, alert_type, threshold_inr||null]); return created(res, rows[0]); };
const deleteAlert = async (req, res) => { const { rowCount } = await query('DELETE FROM price_alerts WHERE id=$1 AND user_id=$2', [req.params.id, req.user.sub]); if (!rowCount) return notFound(res, 'Alert'); return success(res, { deleted: req.params.id }); };
module.exports = { createAlertValidation, getAlerts, createAlert, deleteAlert };
