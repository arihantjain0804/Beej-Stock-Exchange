const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { query, withTransaction } = require('../config/database');
const { success, created, notFound, error } = require('../utils/response');
const { matchOrder } = require('../services/matchingEngine');
const logger = require('../utils/logger');

const placeOrderValidation = [
  body('symbol').notEmpty(),
  body('side').isIn(['buy', 'sell']),
  body('type').isIn(['market', 'limit']),
  body('quantity').isInt({ min: 1 }),
  validate,
];

const placeOrder = async (req, res) => {
  const userId = req.user.sub;
  const { symbol, side, type, quantity, price_inr } = req.body;

  return withTransaction(async (tx) => {
    // ── Fetch token ────────────────────────────────────────────────────────
    const tokenRes = await tx.query(
      'SELECT id, current_price_inr, status FROM crop_tokens WHERE symbol=$1',
      [symbol.toUpperCase()]
    );
    if (!tokenRes.rows.length) return notFound(res, 'Token');
    const token = tokenRes.rows[0];
    if (token.status !== 'active') return error(res, 'Token not tradeable', 400, 'NOT_TRADEABLE');

    const fillPrice = type === 'market'
      ? parseFloat(token.current_price_inr)
      : parseFloat(price_inr);
    const totalCost = fillPrice * quantity;

    // ── Pre-checks ─────────────────────────────────────────────────────────
    if (side === 'buy') {
      const userRes = await tx.query(
        'SELECT wallet_balance FROM users WHERE id=$1 FOR UPDATE',
        [userId]
      );
      const balance = parseFloat(userRes.rows[0].wallet_balance);
      if (balance < totalCost) {
        return error(
          res,
          `Insufficient balance. Need ₹${totalCost.toFixed(2)}, have ₹${balance.toFixed(2)}`,
          400,
          'INSUFFICIENT_FUNDS'
        );
      }
      // Reserve funds immediately for both market and limit buy orders
      await tx.query(
        'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2',
        [totalCost, userId]
      );
    }

    if (side === 'sell') {
      const holdingRes = await tx.query(
        'SELECT quantity FROM portfolio_holdings WHERE user_id=$1 AND token_id=$2',
        [userId, token.id]
      );
      const held = holdingRes.rows[0]?.quantity || 0;
      if (held < quantity) {
        return error(
          res,
          `Insufficient tokens. Hold ${held}, selling ${quantity}`,
          400,
          'INSUFFICIENT_TOKENS'
        );
      }
      // Reserve tokens immediately for both market and limit sell orders
      await tx.query(
        `UPDATE portfolio_holdings
         SET quantity = quantity - $1, updated_at = NOW()
         WHERE user_id = $2 AND token_id = $3`,
        [quantity, userId, token.id]
      );
    }

    // ── Insert order ───────────────────────────────────────────────────────
    const initialStatus  = type === 'market' ? 'filled' : 'open';
    const initialFilled  = type === 'market' ? quantity : 0;
    const initialAvgFill = type === 'market' ? fillPrice : null;

    const orderRes = await tx.query(
      `INSERT INTO orders
         (user_id, token_id, side, type, quantity, filled_qty, price_inr, avg_fill_price, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [userId, token.id, side, type, quantity, initialFilled,
       price_inr || null, initialAvgFill, initialStatus]
    );
    const order = orderRes.rows[0];

    // ── Market order settlement ────────────────────────────────────────────
    if (type === 'market') {
      if (side === 'buy') {
        await tx.query(
          `INSERT INTO portfolio_holdings (user_id, token_id, quantity, avg_cost_inr)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (user_id, token_id) DO UPDATE
             SET avg_cost_inr = (portfolio_holdings.avg_cost_inr * portfolio_holdings.quantity + $4 * $3)
                                / (portfolio_holdings.quantity + $3),
                 quantity     = portfolio_holdings.quantity + $3,
                 updated_at   = NOW()`,
          [userId, token.id, quantity, fillPrice]
        );
      } else {
        // Tokens already reserved — credit wallet
        await tx.query(
          'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
          [totalCost, userId]
        );
      }
    }

    // ── Limit order: run matching engine ───────────────────────────────────
    if (type === 'limit') {
      await matchOrder(tx, order, token);
    }

    logger.info('Order placed', { userId, symbol, side, type, quantity, status: order.status });
    return created(res, order);
  });
};

const getOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const params     = [req.user.sub];
  const conditions = ['o.user_id=$1'];
  if (status) {
    params.push(status);
    conditions.push(`o.status=$${params.length}`);
  }
  const where  = conditions.join(' AND ');
  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(parseInt(limit), offset);
  const { rows } = await query(
    `SELECT o.*, ct.symbol, ct.name AS token_name
     FROM orders o
     JOIN crop_tokens ct ON ct.id = o.token_id
     WHERE ${where}
     ORDER BY o.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return success(res, rows);
};

const cancelOrder = async (req, res) => {
  return withTransaction(async (tx) => {
    const { rows } = await tx.query(
      `UPDATE orders SET status='cancelled', updated_at=NOW()
       WHERE id=$1 AND user_id=$2 AND status IN ('open','partially_filled')
       RETURNING *`,
      [req.params.id, req.user.sub]
    );
    if (!rows.length) return notFound(res, 'Order');
    const order = rows[0];

    // Refund reserved funds/tokens proportional to unfilled quantity
    if (order.side === 'buy') {
      const refundQty   = order.quantity - order.filled_qty;
      const refundValue = refundQty * parseFloat(order.price_inr);
      await tx.query(
        'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
        [refundValue, req.user.sub]
      );
    }

    if (order.side === 'sell') {
      const refundQty = order.quantity - order.filled_qty;
      if (refundQty > 0) {
        await tx.query(
          `INSERT INTO portfolio_holdings (user_id, token_id, quantity, avg_cost_inr)
           VALUES ($1,$2,$3,0)
           ON CONFLICT (user_id, token_id) DO UPDATE
             SET quantity   = portfolio_holdings.quantity + $3,
                 updated_at = NOW()`,
          [req.user.sub, order.token_id, refundQty]
        );
      }
    }

    return success(res, order);
  });
};

module.exports = { placeOrderValidation, placeOrder, getOrders, cancelOrder };