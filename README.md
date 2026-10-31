# Chennai 22K Gold Terminal Next

An installable, mobile-first market and jewellery tool for Chennai's 22K MJDMA benchmark. Four focused tabs keep market data, analysis, purchase estimates, and local holdings easy to reach while the content scrolls naturally on phones.

---

## Key Highlights

### 1. Four Focused Workspaces
- **Market**: Verified MJDMA benchmark rates for 22K/24K/18K gold, Sowcarpet wholesale vs. T. Nagar retail estimates, regional Tamil Nadu parity, and multi-source context.
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

### 3. Mobile and Data Reliability
- **Daily Fix Snapshot**: Shows today’s recorded low/high and change vs previous close, and stays blank when the latest market date is not today.
- **Feed Freshness**: Shows when the price payload was checked; source disagreement keeps the last confirmed rate visible.
- **Saved Calculator Setups**: Keep up to 30 named calculator configurations on this device.
- **Portfolio Backup**: Export/import JSON backups; imports validate, deduplicate, and merge without replacing existing holdings. 22k-Pro backup files are accepted.
- **English/Tamil Controls**: Toggle common navigation, calculator, and portfolio labels; market/quant detail remains English where not translated.
- **Two themes**: Material 3 Expressive daylight (`#f7f7ff` canvas, indigo benchmark card) and optional OLED night mode.
- **Physical Acoustic 22K Coin Chime**: Pure Web Audio API harmonic physical resonance synthesis (5420Hz harmonic coin drop) with haptic feedback.
- **Dynamic High-DPI Share Cards**: Snapshot and itemized quotation receipt generators that dynamically adhere to the active Day or Night theme.
- **Offline-aware PWA (cache v36)**: Bootstrap data renders immediately, market data revalidates in the background, repeated polls reuse one cache entry per feed, and the Market quote states its market date and last check in the card.

---

## Architecture & File Structure

```text
Chennai-22k-gold-next/
├── .github/workflows/main.yml    # GitHub Actions 5-minute fallback monitoring
├── css/
│   ├── design-system.css         # Material semantic tokens and themes
│   ├── navigation.css            # Responsive masthead and four-tab dock
│   ├── bento-grid.css            # Bento grid, chips, carousel, quote card
│   └── upgrade.css               # Shared responsive and accessibility refinements
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
├── sw.js                         # Offline Service Worker (cache version 34)
├── manifest.webmanifest          # PWA manifest
├── update_gold.py                # Automated multi-source ingestion & quant pipeline
└── workers/live-prices/          # Optional Cloudflare four-minute source checker + KV feed
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

# Cloudflare scheduled-check parser and source-agreement tests
node tests/test_live_price_worker.mjs
```

The browser checks its feed every 60 seconds while visible. The Cloudflare Worker checks LiveChennai and GoodReturns every four minutes during Chennai update windows, confirms source agreement, and serves the last confirmed price from KV. GitHub Actions remains the five-minute fallback and updates history and analytics. With an on-time Worker check and browser refresh, the expected source-to-screen delay is at most about five minutes. Schedules are best effort; no scheduler can guarantee that an external publisher updates on time or that the app always displays a change within five minutes. A separate read-only GitHub Actions quality workflow runs on pushes and pull requests; it does not scrape sources or write market data.

### Enable the lower-usage source checker

This scrapes the public source pages; it does not use a gold-price provider API. Deployment requires a Cloudflare account and is not active until configured:

1. The checked-in Worker config already names a KV namespace. If deploying to another Cloudflare account, create a namespace with `npx wrangler kv namespace create LIVE_PRICE_KV` and update the binding in `wrangler.jsonc`.
2. Authenticate Wrangler and deploy from `workers/live-prices` with `npx wrangler deploy`.
3. Configure the public Worker `/live` URL in `js/live-price-config.js` only if it differs from the current endpoint.
4. Publish the app. If the Worker is unavailable or source prices disagree, the app keeps the last confirmed rate and labels the check state; it never invents a replacement quote.

The Worker checks every four minutes during 07:30–12:29 and 15:30–22:29 India time, with an hourly check outside those windows. That schedule is approximately 192 checks and KV writes per day (about 19.2% of the Workers Free 1,000/day KV write allowance), before any other account usage. It only publishes a changed price when both retail sources return valid, agreeing rates. If multiple Workers use KV on the same Cloudflare account, their usage adds together; check account-level KV analytics if alert emails continue.
