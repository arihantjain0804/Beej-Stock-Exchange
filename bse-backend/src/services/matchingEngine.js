const logger = require('../utils/logger');

async function matchOrder(tx, order, token) {
  if (order.type !== 'limit') return;
  if (order.status === 'filled') return;

  const isBuy          = order.side === 'secondary_buy';
  const oppSide        = isBuy ? 'secondary_sell' : 'secondary_buy';
  const priceCondition = isBuy ? `price_inr <= $2` : `price_inr >= $2`;
  const priceOrder     = isBuy ? 'ASC' : 'DESC';

  const { rows: counterOrders } = await tx.query(
    `SELECT o.*
     FROM orders o
     WHERE o.token_id  = $1
       AND o.side      = '${oppSide}'
       AND o.status    IN ('open', 'partially_filled')
       AND o.${priceCondition}
       AND o.user_id  != $3
     ORDER BY o.price_inr ${priceOrder}, o.created_at ASC
     FOR UPDATE OF o`,
    [token.id, order.price_inr, order.user_id]
  );

  if (!counterOrders.length) return;

  let remainingQty = order.quantity - (order.filled_qty || 0);

  for (const counter of counterOrders) {
    if (remainingQty <= 0) break;

    const counterRemaining = counter.quantity - counter.filled_qty;
    const fillQty   = Math.min(remainingQty, counterRemaining);
    const fillPrice = parseFloat(counter.price_inr);
    const fillValue = fillQty * fillPrice;

    // ── Update counter (resting) order ────────────────────────────────────
    const newCounterFilled = counter.filled_qty + fillQty;
    const counterStatus    = newCounterFilled >= counter.quantity ? 'filled' : 'partially_filled';

    await tx.query(
      `UPDATE orders
       SET filled_qty     = $1,
           avg_fill_price = (COALESCE(avg_fill_price, 0) * filled_qty + $2 * $3) / $1,
           status         = $4,
           updated_at     = NOW()
       WHERE id = $5`,
      [newCounterFilled, fillPrice, fillQty, counterStatus, counter.id]
    );

    // ── Settle wallets and holdings ───────────────────────────────────────
    const buyerId  = isBuy ? order.user_id   : counter.user_id;
    const sellerId = isBuy ? counter.user_id : order.user_id;

    await tx.query(
      'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2',
      [fillValue, buyerId]
    );
    await tx.query(
      'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
      [fillValue, sellerId]
    );

    await tx.query(
      `INSERT INTO portfolio_holdings (user_id, token_id, quantity, avg_cost_inr)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, token_id) DO UPDATE
         SET avg_cost_inr = (portfolio_holdings.avg_cost_inr * portfolio_holdings.quantity + $4 * $3)
                            / (portfolio_holdings.quantity + $3),
             quantity     = portfolio_holdings.quantity + $3,
             updated_at   = NOW()`,
      [buyerId, token.id, fillQty, fillPrice]
    );

    await tx.query(
      `UPDATE portfolio_holdings
       SET quantity = quantity - $1, updated_at = NOW()
       WHERE user_id = $2 AND token_id = $3`,
      [fillQty, sellerId, token.id]
    );

    // ── Record transactions ───────────────────────────────────────────────
    const buyerBalRes  = await tx.query('SELECT wallet_balance FROM users WHERE id=$1', [buyerId]);
    const sellerBalRes = await tx.query('SELECT wallet_balance FROM users WHERE id=$1', [sellerId]);

    await tx.query(
      `INSERT INTO transactions
         (user_id, type, amount_inr, token_id, token_quantity, reference_id, description, balance_after)
       VALUES ($1,'secondary_buy',$2,$3,$4,$5,$6,$7)`,
      [buyerId, fillValue, token.id, fillQty, order.id,
       `BUY ${fillQty} tokens @ ₹${fillPrice.toFixed(2)} (matched)`,
       buyerBalRes.rows[0].wallet_balance]
    );

    await tx.query(
      `INSERT INTO transactions
         (user_id, type, amount_inr, token_id, token_quantity, reference_id, description, balance_after)
       VALUES ($1,'secondary_sell',$2,$3,$4,$5,$6,$7)`,
      [sellerId, fillValue, token.id, fillQty, counter.id,
       `SELL ${fillQty} tokens @ ₹${fillPrice.toFixed(2)} (matched)`,
       sellerBalRes.rows[0].wallet_balance]
    );

    remainingQty -= fillQty;

    logger.info('Order matched', {
      incomingOrder: order.id,
      counterOrder:  counter.id,
      fillQty,
      fillPrice,
      fillValue,
    });
  }

  // ── Update incoming order status ──────────────────────────────────────────
  const totalFilled    = order.quantity - remainingQty;
  const incomingStatus = totalFilled >= order.quantity
    ? 'filled'
    : totalFilled > 0
    ? 'partially_filled'
    : 'open';

  if (totalFilled > 0) {
    await tx.query(
      `UPDATE orders
       SET filled_qty     = $1,
           avg_fill_price = $2,
           status         = $3,
           updated_at     = NOW()
       WHERE id = $4`,
      [totalFilled, order.price_inr, incomingStatus, order.id]
    );
  }
}

module.exports = { matchOrder };