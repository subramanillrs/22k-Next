/**
 * ============================================================================
 * UNIT TESTS: GOLD SCHEME & XIRR OPTIMIZER
 * ============================================================================
 */

let SchemeOptimizer;
if (typeof require !== "undefined") {
  try {
    SchemeOptimizer = require("../js/scheme-optimizer.js");
  } catch (e) {
    SchemeOptimizer = require("./js/scheme-optimizer.js");
  }
} else if (typeof load !== "undefined") {
  try {
    load("js/scheme-optimizer.js");
  } catch (e) {
    load("../js/scheme-optimizer.js");
  }
  SchemeOptimizer = this.SchemeOptimizer;
}

print("============================================================");
print("TESTING GOLD SCHEME & XIRR OPTIMIZER");
print("============================================================");

// [TEST 1] Newton-Raphson XIRR Solver
const sampleFlows = [
  { date: "2026-01-01", amount: -10000 },
  { date: "2027-01-01", amount: 11000 }
];
const simpleRate = SchemeOptimizer.solveXIRR(sampleFlows);
const simplePct = Number((simpleRate * 100).toFixed(2));

if (simplePct >= 9.9 && simplePct <= 10.1) {
  print("  ✓ [TEST 1] XIRR accurately solved simple annual flow: " + simplePct + "% (Expected: ~10.0%)");
} else {
  throw new Error("[TEST 1 FAIL] Expected ~10%, got: " + simplePct);
}

// [TEST 2] Weight Scheme Simulation (GRT Golden Eleven / Lalitha)
const weightRes = SchemeOptimizer.simulateWeightScheme(10000, 11, 14145, 18.0);
if (weightRes.accumulatedGrams > 7.0 && weightRes.effectiveXIRRPct > 20.0) {
  print("  ✓ [TEST 2] Weight Scheme yielded " + weightRes.accumulatedGrams + "g with effective XIRR: " + weightRes.effectiveXIRRPct + "% (VA waived: ₹" + weightRes.vaWaivedAmount + ")");
} else {
  throw new Error("[TEST 2 FAIL] Invalid weight scheme result: " + JSON.stringify(weightRes));
}

// [TEST 3] Cash Scheme Simulation (Tanishq 11+1 Bonus)
const cashRes = SchemeOptimizer.simulateCashScheme(10000, 11, 1.0, 14145);
if (cashRes.voucherValue === 120000 && cashRes.effectiveXIRRPct > 14.0 && cashRes.effectiveXIRRPct < 22.0) {
  print("  ✓ [TEST 3] Cash Scheme produced ₹" + cashRes.voucherValue + " voucher with effective XIRR: " + cashRes.effectiveXIRRPct + "%");
} else {
  throw new Error("[TEST 3 FAIL] Invalid cash scheme result: " + JSON.stringify(cashRes));
}

// [TEST 4] Analytical Harmonic Mean Breakeven Gold Price
const breakeven = SchemeOptimizer.computeBreakevenPrice(14145, 14.0, 1.0);
if (breakeven > 14000 && breakeven < 16000) {
  print("  ✓ [TEST 4] Breakeven price computed: ₹" + breakeven + "/g (appreciation threshold)");
} else {
  throw new Error("[TEST 4 FAIL] Invalid breakeven: " + breakeven);
}

print("============================================================");
print("ALL GOLD SCHEME & XIRR TESTS PASSED 100%! ✓");
print("============================================================");
