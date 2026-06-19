-- ============================================================
-- BSE — Beej Stock Exchange  |  Full Schema  v1
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for search

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE user_role      AS ENUM ('investor', 'farmer', 'admin');
CREATE TYPE user_kyc       AS ENUM ('none', 'pending', 'verified', 'rejected');
CREATE TYPE crop_status    AS ENUM ('upcoming', 'active', 'harvested', 'settled');
CREATE TYPE order_side     AS ENUM ('buy', 'sell');
CREATE TYPE order_type     AS ENUM ('market', 'limit');
CREATE TYPE order_status   AS ENUM ('pending', 'open', 'partially_filled', 'filled', 'cancelled', 'expired');
CREATE TYPE tx_type        AS ENUM ('primary_buy', 'secondary_buy', 'secondary_sell', 'yield_distribution', 'deposit', 'withdrawal');
CREATE TYPE alert_type     AS ENUM ('price_above', 'price_below', 'yield_update', 'harvest_alert');
CREATE TYPE alert_status   AS ENUM ('active', 'triggered', 'dismissed');
CREATE TYPE notification_type AS ENUM ('trade', 'price_alert', 'yield', 'kyc', 'system');

-- ── Users ────────────────────────────────────────────────────

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(15)  UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE,
  full_name       VARCHAR(255),
  role            user_role    NOT NULL DEFAULT 'investor',
  kyc_status      user_kyc     NOT NULL DEFAULT 'none',
  kyc_doc_url     TEXT,
  avatar_url      TEXT,
  wallet_balance  NUMERIC(18,4) NOT NULL DEFAULT 0,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role  ON users(role);

-- ── Farmers (extended profile) ───────────────────────────────

CREATE TABLE farmer_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_name       VARCHAR(255),
  location        VARCHAR(255),
  state           VARCHAR(100),
  district        VARCHAR(100),
  land_area_acres NUMERIC(10,2),
  fpo_name        VARCHAR(255),       -- Farmer Producer Organisation
  aadhaar_last4   VARCHAR(4),
  bank_account    VARCHAR(20),
  ifsc_code       VARCHAR(11),
  bio             TEXT,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  total_raised    NUMERIC(18,4) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_farmer_profiles_user ON farmer_profiles(user_id);

-- ── Crop Tokens ──────────────────────────────────────────────

CREATE TABLE crop_tokens (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol              VARCHAR(20) UNIQUE NOT NULL,   -- e.g. WHTPUN24
  name                VARCHAR(255) NOT NULL,
  farmer_id           UUID NOT NULL REFERENCES users(id),
  crop_type           VARCHAR(100) NOT NULL,          -- wheat, rice, soybean…
  location            VARCHAR(255),
  state               VARCHAR(100),
  district            VARCHAR(100),
  harvest_date        DATE NOT NULL,
  total_supply        BIGINT NOT NULL,
  circulating_supply  BIGINT NOT NULL DEFAULT 0,
  token_price_inr     NUMERIC(14,4) NOT NULL,         -- IPO / primary price
  current_price_inr   NUMERIC(14,4) NOT NULL,
  prev_close_inr      NUMERIC(14,4),
  day_high_inr        NUMERIC(14,4),
  day_low_inr         NUMERIC(14,4),
  expected_yield_pct  NUMERIC(6,2),                  -- % annualised
  actual_yield_pct    NUMERIC(6,2),
  status              crop_status NOT NULL DEFAULT 'upcoming',
  smart_contract_addr VARCHAR(66),                    -- ETH/Polygon address
  description         TEXT,
  image_url           TEXT,
  land_area_acres     NUMERIC(10,2),
  min_investment_inr  NUMERIC(14,4) NOT NULL DEFAULT 100,
  is_beej50           BOOLEAN NOT NULL DEFAULT FALSE, -- part of BEEJ-50 index
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crop_tokens_status   ON crop_tokens(status);
CREATE INDEX idx_crop_tokens_farmer   ON crop_tokens(farmer_id);
CREATE INDEX idx_crop_tokens_beej50   ON crop_tokens(is_beej50);
CREATE INDEX idx_crop_tokens_symbol   ON crop_tokens(symbol);

-- ── Price History ────────────────────────────────────────────

CREATE TABLE price_history (
  id          BIGSERIAL PRIMARY KEY,
  token_id    UUID NOT NULL REFERENCES crop_tokens(id) ON DELETE CASCADE,
  price_inr   NUMERIC(14,4) NOT NULL,
  volume      BIGINT NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_token_time ON price_history(token_id, recorded_at DESC);

-- OHLCV candles (1h, 1d)
CREATE TABLE price_candles (
  id          BIGSERIAL PRIMARY KEY,
  token_id    UUID NOT NULL REFERENCES crop_tokens(id) ON DELETE CASCADE,
  interval    VARCHAR(5) NOT NULL,   -- '1h', '1d'
  open        NUMERIC(14,4) NOT NULL,
  high        NUMERIC(14,4) NOT NULL,
  low         NUMERIC(14,4) NOT NULL,
  close       NUMERIC(14,4) NOT NULL,
  volume      BIGINT NOT NULL DEFAULT 0,
  candle_time TIMESTAMPTZ NOT NULL,
  UNIQUE(token_id, interval, candle_time)
);

CREATE INDEX idx_candles_token_interval ON price_candles(token_id, interval, candle_time DESC);

-- ── BEEJ-50 Index ────────────────────────────────────────────

CREATE TABLE beej50_history (
  id          BIGSERIAL PRIMARY KEY,
  value       NUMERIC(12,2) NOT NULL,
  change_pct  NUMERIC(8,4),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_beej50_time ON beej50_history(recorded_at DESC);

-- ── Portfolio ────────────────────────────────────────────────

CREATE TABLE portfolio_holdings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id        UUID NOT NULL REFERENCES crop_tokens(id) ON DELETE CASCADE,
  quantity        BIGINT NOT NULL DEFAULT 0,
  avg_cost_inr    NUMERIC(14,4) NOT NULL DEFAULT 0,
  realized_pnl    NUMERIC(18,4) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token_id)
);

CREATE INDEX idx_holdings_user ON portfolio_holdings(user_id);

-- ── Orders (secondary market) ────────────────────────────────

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  token_id        UUID NOT NULL REFERENCES crop_tokens(id),
  side            order_side   NOT NULL,
  type            order_type   NOT NULL DEFAULT 'limit',
  quantity        BIGINT NOT NULL,
  filled_qty      BIGINT NOT NULL DEFAULT 0,
  price_inr       NUMERIC(14,4),       -- NULL for market orders
  avg_fill_price  NUMERIC(14,4),
  status          order_status NOT NULL DEFAULT 'open',
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user    ON orders(user_id);
CREATE INDEX idx_orders_token   ON orders(token_id, status);
CREATE INDEX idx_orders_status  ON orders(status);

-- Order book snapshot (materialised by matching engine)
CREATE TABLE trades (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buy_order_id    UUID NOT NULL REFERENCES orders(id),
  sell_order_id   UUID NOT NULL REFERENCES orders(id),
  token_id        UUID NOT NULL REFERENCES crop_tokens(id),
  quantity        BIGINT NOT NULL,
  price_inr       NUMERIC(14,4) NOT NULL,
  buyer_id        UUID NOT NULL REFERENCES users(id),
  seller_id       UUID NOT NULL REFERENCES users(id),
  executed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trades_token ON trades(token_id, executed_at DESC);
CREATE INDEX idx_trades_buyer ON trades(buyer_id);
CREATE INDEX idx_trades_seller ON trades(seller_id);

-- ── Transactions (wallet ledger) ─────────────────────────────

CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  type            tx_type NOT NULL,
  amount_inr      NUMERIC(18,4) NOT NULL,
  token_id        UUID REFERENCES crop_tokens(id),
  token_quantity  BIGINT,
  reference_id    UUID,               -- order/trade/payout ID
  description     TEXT,
  balance_after   NUMERIC(18,4) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tx_user ON transactions(user_id, created_at DESC);

-- ── Watchlist ────────────────────────────────────────────────

CREATE TABLE watchlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id    UUID NOT NULL REFERENCES crop_tokens(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token_id)
);

-- ── Price Alerts ─────────────────────────────────────────────

CREATE TABLE price_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id        UUID NOT NULL REFERENCES crop_tokens(id) ON DELETE CASCADE,
  alert_type      alert_type NOT NULL,
  threshold_inr   NUMERIC(14,4),
  status          alert_status NOT NULL DEFAULT 'active',
  triggered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user   ON price_alerts(user_id);
CREATE INDEX idx_alerts_active ON price_alerts(status, token_id);

-- ── Notifications ────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  meta        JSONB,                  -- extra payload (token symbol, price, etc.)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ── Smart Contract Audit Log ─────────────────────────────────

CREATE TABLE contract_events (
  id              BIGSERIAL PRIMARY KEY,
  token_id        UUID REFERENCES crop_tokens(id),
  contract_addr   VARCHAR(66),
  event_name      VARCHAR(100) NOT NULL,   -- TokenMinted, TradeSettled, YieldPaid…
  tx_hash         VARCHAR(66),
  block_number    BIGINT,
  payload         JSONB,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contract_events_token ON contract_events(token_id, recorded_at DESC);

-- ── Updated-at trigger ───────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated         BEFORE UPDATE ON users             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_crop_tokens_updated   BEFORE UPDATE ON crop_tokens       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_holdings_updated      BEFORE UPDATE ON portfolio_holdings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated        BEFORE UPDATE ON orders             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
