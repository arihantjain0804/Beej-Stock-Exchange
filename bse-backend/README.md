# BSE Backend — Beej Stock Exchange API

## Stack
- **Runtime**: Node.js 20+
- **Framework**: Express 4
- **Database**: PostgreSQL 15+
- **Cache / Pub-Sub**: Redis 7
- **Auth**: OTP (Twilio SMS) → JWT (access + refresh)
- **Realtime**: WebSocket (`ws`) — live price feed

---

## Quick Start

### 1. Prerequisites
```bash
# PostgreSQL
createdb bse_db
createuser bse_user
psql -c "ALTER USER bse_user PASSWORD 'yourpassword';"
psql -c "GRANT ALL ON DATABASE bse_db TO bse_user;"

# Redis (optional for dev)
brew install redis && brew services start redis
```

### 2. Install
```bash
cd bse-backend
npm install
cp .env.example .env
# Edit .env — set DB_PASSWORD, JWT_SECRET etc.
```

### 3. Migrate + Seed
```bash
npm run migrate          # creates all tables
npm run seed             # inserts all v23 mock data
# To reset:
npm run migrate:fresh && npm run seed
```

### 4. Run
```bash
npm run dev              # nodemon, hot-reload
npm start                # production
```

Server: http://localhost:3001  
WebSocket: ws://localhost:3001/ws

---

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/send-otp | — | Send OTP to phone |
| POST | /api/auth/verify-otp | — | Verify OTP → JWT |
| POST | /api/auth/refresh | — | Refresh access token |
| GET  | /api/auth/me | ✓ | Current user profile |
| GET  | /api/tokens | — | List all crop tokens |
| GET  | /api/tokens/:symbol | — | Token detail |
| GET  | /api/tokens/:symbol/price-history | — | OHLCV history |
| GET  | /api/tokens/:symbol/order-book | — | Bids/Asks |
| GET  | /api/beej50 | — | BEEJ-50 index |
| GET  | /api/beej50/history | — | Index history |
| GET  | /api/portfolio | ✓ | Holdings + PnL |
| POST | /api/orders | ✓ | Place buy/sell order |
| GET  | /api/orders | ✓ | My orders |
| GET  | /api/watchlist | ✓ | Watchlist |
| POST | /api/watchlist | ✓ | Add to watchlist |
| GET  | /api/alerts | ✓ | Price alerts |
| POST | /api/alerts | ✓ | Create alert |
| GET  | /api/notifications | ✓ | Notifications |
| GET  | /api/health | — | Health check |

### Dev OTP bypass
In `NODE_ENV=development`, the OTP is returned in the response body as `_dev_otp` and logged to console. No Twilio required.

### WebSocket Events
Connect to `ws://localhost:3001/ws`

**Client → Server:**
```json
{ "type": "subscribe", "symbols": ["WHTPUN24", "RICETEL24"] }
{ "type": "subscribe_all" }
{ "type": "auth", "token": "<access_token>" }
{ "type": "ping" }
```

**Server → Client:**
```json
{ "type": "snapshot", "data": { "WHTPUN24": { "price": "112.5000", "change_pct": "2.09" } } }
{ "type": "price_update", "data": { "symbol": "WHTPUN24", "price": "112.6100", "change_pct": "2.19" } }
{ "type": "ticker", "data": { ... all active tokens ... } }
```

---

## File Structure
```
src/
├── config/         database.js, redis.js
├── controllers/    auth, tokens, portfolio, orders, watchlist, alerts, notifications, beej50
├── middleware/     auth.js, validate.js, errorHandler.js
├── migrations/     001_schema.sql + run.js
├── routes/         index.js
├── seeds/          data.js + run.js
├── utils/          logger.js, response.js, jwt.js
├── websocket/      priceServer.js
└── server.js
```
