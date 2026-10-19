# Chennai 22K Gold Terminal Next

An ultra-modern, institutional-grade bullion tracking terminal and quantitative analytics suite for the Chennai (MJDMA) 22K gold market. Built with cutting-edge PWA standards, zero vertical scroll fatigue via a 4-tab docked liquid glass interface, and clientside Machine Learning & stochastic quantitative models.

---

## Key Highlights

### 1. 4-Tab Docked Architecture (Zero Scroll Fatigue)
- **Market**: Live MJDMA benchmark rates for 22K/24K/18K gold, Sowcarpet wholesale bullion discount vs. T. Nagar retail showroom spread, horizontal regional parity carousel (**Salem** `-₹10/g`, **Coimbatore** `-₹15/g`, **Madurai** `+₹15/g`, **Trichy** `-₹5/g`), and multi-source consensus.
- **Analytics**: Clientside ML forecasting suite with 1D/3D/7D/30D projections, Bayesian confidence intervals, GARCH(1,1) volatility cones, and 10,000-path Monte Carlo Value-at-Risk (VaR) & Expected Shortfall (CVaR).
- **Calculator**: Institutional jewellery quotation generator itemizing wastage (VA%), stone deductions, 3% GST, plus an instant shop bill auditor benchmarked to raw bullion casting parity.
- **Schemes**: Newton-Raphson XIRR optimizer comparing Weight Accumulation Schemes vs. Cash Bonus Schemes, solving for the exact breakeven price at maturity.

### 2. Next-Generation Algorithms & Machine Learning
- **1D State-Space Kalman Filter**: Separates true underlying price drift from transitory liquidity noise.
- **GARCH(1,1) Volatility Modeling**: Computes conditional volatility cones across 7-day and 30-day horizons.
- **ARIMA(1,1,1) Predictor**: Autoregressive moving average time-series forecasting with Student's t Bayesian confidence bands ($\pm 1.645 \sigma \sqrt{h}$).
- **10,000-Path Merton Jump Diffusion Monte Carlo Simulation**: Estimates empirical 95% and 99% VaR and Expected Shortfall under jump diffusion shocks.
- **Bayesian Consensus Engine**: Dynamic source reliability weighting and Modified Z-Score outlier filtering ($M_i = 0.6745 |x_i - \tilde{x}| / \text{MAD}$).
- **Gaussian Kernel Density Estimation (KDE)**: Non-parametric probability modeling for AM and PM fix arrival times.

### 3. Cutting-Edge UX & Mobile Hardware Features
- **Daily Fix Snapshot**: Shows today’s recorded low/high and change vs previous close, and stays blank when the latest market date is not today.
- **Feed Freshness**: Shows when the price payload was checked; source disagreement keeps the last confirmed rate visible.
- **Saved Calculator Setups**: Keep up to 30 named calculator configurations on this device.
- **Portfolio Backup**: Export/import JSON backups; imports validate, deduplicate, and merge without replacing existing holdings. 22k-Pro backup files are accepted.
- **English/Tamil Controls**: Toggle common navigation, calculator, and portfolio labels; market/quant detail remains English where not translated.
- **2-Mode Luxury Design System**: Strict Day (`#faf6ed`/`#1c1712`) and Night (`#000000`/`#ffd700`) modes.
- **Physical Acoustic 22K Coin Chime**: Pure Web Audio API harmonic physical resonance synthesis (5420Hz harmonic coin drop) with haptic feedback.
- **Dynamic High-DPI Share Cards**: Snapshot and itemized quotation receipt generators that dynamically adhere to the active Day or Night theme.
- **Service Worker v17 & Instant Pre-Baking**: Instant bootstrap hydration; live-data cache keys are normalized so polling does not accumulate duplicate cache entries.

---

## Architecture & File Structure

```text
Chennai-22k-gold-next/
├── .github/workflows/main.yml    # GitHub Actions 5-minute fallback monitoring
├── css/
│   ├── design-system.css         # Luxury 2-mode Day/Night design tokens
│   ├── navigation.css            # Masthead and liquid glass dock
│   ├── bento-grid.css            # Bento grid, chips, carousel, quote card
│   └── upgrade.css               # Responsive/accessibility polish and new UI components
├── js/
│   ├── ml-engine.js              # Kalman, GARCH, ARIMA, Monte Carlo risk, Bayesian consensus
│   ├── scheme-optimizer.js       # Newton-Raphson XIRR & scheme comparator
│   ├── audio-chimes.js           # Web Audio API 22K acoustic resonance synthesizer
│   ├── share-cards.js            # High-DPI Day/Night dynamic canvas share cards
│   ├── quant-risk.js             # Canvas spline charts, EMA(9/21), RSI(14)
│   ├── local-tools.js            # Safe presets and additive portfolio backup helpers
│   ├── live-price-config.js       # Optional deployed Worker endpoint
│   └── app.js                    # Tab router, quote calculator, shop auditor
├── data/                         # Published JSON market-data payloads
├── tests/
│   ├── test_ml_engine.js         # ML & risk verification test suite
│   ├── test_schemes.js           # XIRR & scheme mathematical test suite
│   ├── test_ui_navigation.js     # 4-tab docked routing & theme test suite
│   ├── test_local_tools.js       # Preset/backup validation and merge tests
│   ├── test_live_price_worker.mjs # Minute-check parsing and confirmation tests
│   └── test_quant_pipeline.py    # Python pipeline & bootstrap regression suite
├── index.html                    # 4-tab docked application shell
├── sw.js                         # Offline Service Worker v17
├── manifest.webmanifest          # PWA manifest
├── update_gold.py                # Automated multi-source ingestion & quant pipeline
└── workers/live-prices/          # Optional Cloudflare one-minute source checker + KV feed
```

---

## Verification & Testing

Run all test suites locally:

```bash
# Backend Pipeline & Quant Tests
python3 tests/test_quant_pipeline.py

# Machine Learning & Risk Engine Tests
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/test_ml_engine.js

# Scheme Optimizer & Newton-Raphson XIRR Tests
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/test_schemes.js

# Navigation & Theme Fidelity Tests
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/test_ui_navigation.js

# Local calculator presets & portfolio backup tests
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/test_local_tools.js

# Cloudflare minute-check parser and source-agreement tests
node tests/test_live_price_worker.mjs
```

The browser checks its feed every 15 seconds while visible. The optional Cloudflare Worker checks LiveChennai and GoodReturns once per minute during Chennai update windows, confirms source agreement, and serves the last confirmed price from KV. GitHub Actions remains the five-minute fallback and continues updating history and analytics. All schedules are best effort; no scheduler can make a third-party site publish sooner or guarantee a price within five minutes.

### Enable the one-minute source checker

This scrapes the public source pages; it does not use a gold-price provider API. Deployment requires a Cloudflare account and is not active until configured:

1. Create a KV namespace: `cd workers/live-prices && npx wrangler kv namespace create LIVE_PRICE_KV`.
2. Replace `REPLACE_WITH_CLOUDFLARE_KV_NAMESPACE_ID` in `wrangler.jsonc` with the returned namespace ID.
3. Deploy: `npx wrangler deploy`.
4. Copy the Worker `/live` URL into `window.GOLD_LIVE_WORKER_URL` in `js/live-price-config.js`.
5. Publish the updated app. If the Worker is unavailable or source prices disagree, the app keeps showing the last confirmed rate.

The Worker checks once per minute during 07:30–12:29 and 15:30–22:29 India time, with an hourly check outside those windows. It only publishes a changed price when both retail sources return valid, agreeing rates.
