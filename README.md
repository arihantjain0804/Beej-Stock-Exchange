<<<<<<< HEAD
# Beej-Srock-Exchange — Crop Token Exchange
=======
# Beej-Stock-Exchange — Crop Token Exchange
>>>>>>> a729d1c958f768ee32c621f3ecd834384144377c

A frontend trading-platform simulation that lets users buy, sell, and track tokenized Indian agricultural commodities (wheat, rice, cotton, mustard, and more) the way a stock exchange app handles equities. Built as a React + Vite single-page app.

**Live demo:** _add your Vercel URL here_

## Features

- **Tokenized crop markets** — eight regional crop tokens (Punjab Wheat, Vidarbha Soy, Krishna Rice, Nashik Onion, Gujarat Cotton, Rajasthan Mustard, Kerala Coconut, MP Gram) with simulated live price movement, ticker, and depth charts.
- **Trading flow** — trade, portfolio, watchlist, wallet, price alerts, and a yield calculator, each as modals/drawers that persist across routes.
- **Webcam hand-gesture intro** — an optional hand-tracking cursor on the entry screen, built on MediaPipe-style landmark smoothing (One Euro filter) rather than the regular mouse pointer.
- **Accessible modals** — all 8 modals and 2 drawers use `role="dialog"` / `aria-modal`, and a global Escape-key handler closes the topmost open one.
- **Responsive layout** — dedicated mobile bottom-navigation bar and breakpoint-driven layout collapse for hero, market grid, and footer sections.

## Tech Stack

- React 19 + Vite
- react-router-dom v7 (client-side routing: `/`, `/markets`; trade/portfolio open as modals via query params)
- Plain CSS (no UI framework) with Canvas-based charts (no charting library)
- Single global state via React Context (`AppContext`) — no Redux

## Getting Started

```bash
git clone https://github.com/arihantjain0804/Beej-Stock-Exchange.git
cd Beej-Stock-Exchange
npm install
npm run dev
```

Other scripts: `npm run build` (production build), `npm run preview` (preview the build locally), `npm run lint`.

## Project Structure

```
src/
  components/   # Nav, Hero, modals, drawers, page sections
  context/      # AppContext — global app state
  data/         # crop token definitions, card data
  hooks/        # useLivePrices, useHandTracking, useParticles, useReveal
  pages/        # HomePage, MarketsPage, NotFoundPage
  styles/       # base, responsive, cursor styles
```

## Known Limitations

- Prices are simulated client-side, not pulled from a real market data feed.
- Modals have keyboard dismissal and ARIA roles, but no focus trap or focus restoration yet.
- Automated tests are in progress (Vitest + React Testing Library).

## License

Not yet licensed — add one (MIT is a common default for portfolio projects) if you want others to be able to reuse this freely.
