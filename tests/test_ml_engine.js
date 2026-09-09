/**
 * ============================================================================
 * UNIT TESTS: NEXT-GEN CLIENTSIDE MACHINE LEARNING & QUANT ENGINE
 * ============================================================================
 */

let GoldMLEngine;
if (typeof require !== "undefined") {
  try {
    GoldMLEngine = require("../js/ml-engine.js");
  } catch (e) {
    GoldMLEngine = require("./js/ml-engine.js");
  }
} else if (typeof load !== "undefined") {
  try {
    load("js/ml-engine.js");
  } catch (e) {
    load("../js/ml-engine.js");
  }
  GoldMLEngine = this.GoldMLEngine;
}

print("============================================================");
print("TESTING CLIENTSIDE MACHINE LEARNING & QUANT RISK ENGINE");
print("============================================================");

// [TEST 1] KalmanFilter1D State-Space Smoothing
const kf = new GoldMLEngine.KalmanFilter1D(0.001, 0.05);
const noisySeries = [14100, 14180, 14120, 14220, 14110, 14190, 14145];
const filtered = kf.filterSeries(noisySeries);

if (filtered.length === noisySeries.length) {
  print("  ✓ [TEST 1a] Kalman filter processed full series length (" + filtered.length + ")");
} else {
  throw new Error("[TEST 1a FAIL] Series length mismatch");
}

// Check that filtered price stays within reasonable envelope
const lastFiltered = filtered[filtered.length - 1];
if (lastFiltered >= 14100 && lastFiltered <= 14200) {
  print("  ✓ [TEST 1b] Kalman smoothed estimate converged to realistic price: ₹" + Math.round(lastFiltered));
} else {
  throw new Error("[TEST 1b FAIL] Filtered output out of bounds: " + lastFiltered);
}

// [TEST 2] GARCH(1,1) Volatility Forecasting
const garch = new GoldMLEngine.GARCHModel();
const sampleReturns = [0.005, -0.008, 0.002, 0.012, -0.004, -0.001, 0.007, -0.011];
const garchRes = garch.fitAndForecast(sampleReturns);

if (garchRes.dailyVolPct > 0 && garchRes.annualizedVolPct > 0) {
  print("  ✓ [TEST 2] GARCH(1,1) computed positive volatility (Daily: " + garchRes.dailyVolPct + "%, Annual: " + garchRes.annualizedVolPct + "%)");
} else {
  throw new Error("[TEST 2 FAIL] Invalid GARCH volatility: " + JSON.stringify(garchRes));
}

// [TEST 3] ARIMA + Exponential Multi-Horizon Forecasting
const predictor = new GoldMLEngine.ARIMAPredictor();
const prices = [14150, 14200, 14220, 14270, 14290, 14270, 14145];
const fc = predictor.forecast(prices, 14145);

if (fc.fc1d > 10000 && fc.fc3d > 10000 && fc.fc7d > 10000 && fc.fc30d > 10000) {
  print("  ✓ [TEST 3a] ARIMA generated 1D-30D multi-horizon forecasts (1D: " + fc.fc1d + ", 7D: " + fc.fc7d + ", 30D: " + fc.fc30d + ")");
} else {
  throw new Error("[TEST 3a FAIL] Invalid forecasts: " + JSON.stringify(fc));
}

if (fc.fc7dBand && fc.fc7dBand[0] < fc.fc7d && fc.fc7dBand[1] > fc.fc7d) {
  print("  ✓ [TEST 3b] Bayesian confidence band brackets forecast (90% Band: [" + fc.fc7dBand[0] + ", " + fc.fc7dBand[1] + "])");
} else {
  throw new Error("[TEST 3b FAIL] Confidence band error");
}

// [TEST 4] Merton Jump Diffusion Monte Carlo Risk Simulation (10,000 Paths)
const mc = GoldMLEngine.MonteCarloRiskEngine.simulateVaR(14145, 0.0102, 10000);

if (mc.var95Amount > 50 && mc.var95Amount < 600) {
  print("  ✓ [TEST 4a] 10,000-path Monte Carlo computed 1-Day 95% VaR: ₹" + mc.var95Amount + "/g (₹" + mc.var95Sovereign8g + " / 8g Sovereign)");
} else {
  throw new Error("[TEST 4a FAIL] Unexpected VaR 95%: " + mc.var95Amount);
}

if (mc.var99Amount >= mc.var95Amount && mc.cvar95Amount >= mc.var95Amount) {
  print("  ✓ [TEST 4b] Monotonicity holds: 99% VaR (₹" + mc.var99Amount + ") and Expected Shortfall CVaR (₹" + mc.cvar95Amount + ") >= 95% VaR");
} else {
  throw new Error("[TEST 4b FAIL] Inconsistent tail risk metrics");
}

// [TEST 5] Bayesian Consensus & Modified Z-Score Outlier Rejection
const testFeeds = {
  livechennai: { rate_22k: 14145 },
  goodreturns: { rate_22k: 14145 },
  glitch_feed: { rate_22k: 18500 } // Obvious spurious glitch (+₹4355)
};

const consensusRes = GoldMLEngine.BayesianConsensus.compute(testFeeds);
if (consensusRes.consensusRate === 14145) {
  print("  ✓ [TEST 5] Bayesian consensus rejected outlier (+₹4,355 glitch) and locked correct rate ₹14,145");
} else {
  throw new Error("[TEST 5 FAIL] Consensus affected by outlier: " + consensusRes.consensusRate);
}

// [TEST 6] Purchase Timing Advisor
const advice = GoldMLEngine.PurchaseTimingAdvisor.advise(14145, 25.0, -1.2, 238, 14250);
if (advice.action.includes("ACCUMULATE")) {
  print("  ✓ [TEST 6] Purchase Timing Advisor triggered '" + advice.action + "' on oversold dip (RSI 25)");
} else {
  throw new Error("[TEST 6 FAIL] Unexpected action: " + advice.action);
}

print("============================================================");
print("ALL CLIENTSIDE ML & QUANT ENGINE TESTS PASSED 100%! ✓");
print("============================================================");
