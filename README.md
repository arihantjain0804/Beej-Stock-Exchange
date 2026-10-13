# Beej Stock Exchange (BSE)

A full-stack web app where users trade tokenized Indian crops, in the style of a stock exchange app. It has a React frontend, a Node/Express API, a PostgreSQL database, and an order-matching engine.

**Live demo:** https://beej-stock-exchange.vercel.app
**API health check:** https://beej-stock-exchange.onrender.com/api/health

> This is a portfolio / demonstration project. It uses virtual money and is not a licensed exchange. Crop "tokens" are rows in a database, not blockchain assets.

If the first page load is slow, the backend may be waking up. Wait a moment and refresh.

---

## What works

- **Crop token markets:** 12 tokens with prices, a ticker, price charts for several time ranges, and an order book.
- **Orders:** place market and limit orders, view your orders, cancel open orders. Limit orders are matched against opposite orders by a matching engine on the backend (price first, then time).
- **Login:** phone number plus one-time code (OTP), then JWT access and refresh tokens.
- **Portfolio and transactions:** holdings, average cost and transaction history per user.
- **Watchlist, price alerts, notifications:** create and delete watchlist items and alerts, and read notifications.
- **Live prices:** the server sends price updates every 3 seconds over WebSocket, and saves a price point to the database every 60 seconds so charts grow over time.
- **Real market prices (partial):** hourly price refresh from the Government of India Agmarknet dataset on data.gov.in. See the table below.
- **BEEJ-50:** an index value and index history endpoint.
- **Optional hand-gesture intro:** control the cursor with your webcam using Google MediaPipe (hand landmarks, smoothed with a One Euro filter). Fist gesture clicks, and hand position near the screen edges scrolls.
- **Frontend polish:** mobile bottom navigation bar, Escape key closes the top modal, dialog roles on modals.

## Real data vs simulated data

| Item | Status |
|---|---|
| GUJ-GND, KRS-RCE, MP-SOY, AP-TRM, VDB-SOY | Real daily mandi prices from data.gov.in, refreshed hourly |
| RJ-CUM, PNJ-WHT, TN-BSM, KER-CCO, UP-SGC, KAR-RGI, MH-CTN | Simulated. Commodity names do not match the government data yet |
| Frequency of real data | Daily. Small movements between updates are simulated noise |
| Charts and order book with little data | A sample chart or sample order book is shown instead of an empty screen |
| Seed script price history and BEEJ-50 history | Generated randomly for demo purposes |

Source: Agmarknet daily mandi prices, data.gov.in, resource ID `9ef84268-d588-465a-a308-a864a43d0070`.

## Not built yet (shown in the interface but not functional)

- **Wallet connect screen:** a mock. It shows wallet options such as MetaMask, but it waits about 2 seconds and shows a fixed fake address. There is no real wallet or blockchain connection.
- **Adding money:** there is no deposit or payment feature. The `razorpay` package is installed but not used.
- **SMS:** the SMS provider's trial plan only allows fixed templates, so the app shows the OTP on screen (dev mode) instead.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 19, Vite, React Router 7, Recharts |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (Supabase) |
| Cache and OTP storage | Redis (Upstash) |
| Realtime | WebSocket (`ws`) |
| Auth | OTP, JWT |
| Backend safety | Helmet, CORS, request validation (express-validator), rate limiting (express-rate-limit), Winston logs |
| Hand tracking | MediaPipe Tasks Vision 1.0.1 (version pinned) |
| Tests | Vitest, React Testing Library (3 test files, a handful of tests) |
| Hosting | Vercel (frontend), Render (backend) |

## Project structure

```
bse-frontend/
  src/components/   modals, drawers, ticker, crop cards, nav
  src/api/          backend calls
  src/hooks/        live prices, hand tracking
bse-backend/
  src/controllers/  tokens, orders, portfolio, auth, alerts, watchlist, notifications, beej50
  src/services/     order matching engine
  src/websocket/    price server and data.gov.in refresh
  src/migrations/   database tables
  src/seeds/        sample data
```

## Try the demo

1. Open the live demo and choose investor login.
2. Use the test number `+919900000001`.
3. The one-time code appears on screen. No real SMS is sent.

Use this number rather than your own. It is a seeded account with a starting balance.

## Run it locally

Needs Node.js 20+, a PostgreSQL database, and Redis (login codes are stored in Redis).

**Backend**
```bash
cd bse-backend
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
# fill in your own values
npm run migrate
npm run seed
npm run dev               # http://localhost:3001
```

**Frontend**
```bash
cd bse-frontend
npm install
# set VITE_API_URL to your backend URL (for example http://localhost:3001)
npm run dev
npm test
```

**Important:** the seed script creates 8 sample tokens with different symbols (for example `WHTPUN24`) from the 12 tokens on the live site. The real-price mapping uses the live symbols, so a local setup built only from the seed script will not show real prices.

## Backend environment variables

See `bse-backend/.env.example`. Never commit real passwords or keys.

## API routes

Under `/api`: `auth` (send-otp, verify-otp, refresh, me), `tokens` (list, detail, price-history, order-book, trades), `beej50`, `portfolio`, `orders`, `watchlist`, `alerts`, `notifications`, `health`. A table is in `bse-backend/README.md`.

## Known limitations

- 5 of 12 tokens use real prices. The rest are simulated.
- Real data is daily, not live.
- There is no order expiry, so old open orders stay in the order book. The order book hides very small and far-from-price orders to keep it readable.
- Test coverage is small.
- Modals close with Escape but do not trap keyboard focus.

## License

No license file yet.
