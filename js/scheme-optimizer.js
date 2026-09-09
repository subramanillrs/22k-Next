/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: SCHEME YIELD OPTIMIZER & XIRR SOLVER
 * ============================================================================
 */

(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SchemeOptimizer = factory();
  }
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";

  /**
   * Newton-Raphson XIRR solver for irregular and periodic monthly cashflows
   */
  function solveXIRR(cashflows, guess = 0.15, maxIter = 100, tol = 1e-6) {
    if (!Array.isArray(cashflows) || cashflows.length < 2) return 0;

    let rate = guess;
    const t0 = new Date(cashflows[0].date).getTime();

    for (let iter = 0; iter < maxIter; iter++) {
      let npv = 0;
      let dNpv = 0;

      for (let i = 0; i < cashflows.length; i++) {
        const cf = cashflows[i];
        const t = (new Date(cf.date).getTime() - t0) / (365.25 * 86400000);
        const denom = Math.pow(1 + rate, t);

        if (Math.abs(denom) < 1e-12) continue;

        npv += cf.amount / denom;
        dNpv -= (t * cf.amount) / (denom * (1 + rate));
      }

      if (Math.abs(npv) < tol) return rate;
      if (Math.abs(dNpv) < 1e-12) break;

      const nextRate = rate - npv / dNpv;
      if (Math.abs(nextRate - rate) < tol) return nextRate;
      rate = nextRate;
    }

    return rate;
  }

  /**
   * Weight-based Scheme (e.g. GRT Golden Eleven, Lalitha)
   * Converts monthly installment into gold grams at live MJDMA fix.
   * At maturity: returns accumulated grams with Value Addition (VA) waived up to 18%.
   */
  function simulateWeightScheme(monthlyAmount = 10000, months = 11, currentRate = 14145, vaWaivedPct = 18.0) {
    let accumulatedGrams = 0;
    const cashflows = [];
    const baseDate = new Date();

    for (let m = 0; m < months; m++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + m);
      accumulatedGrams += monthlyAmount / currentRate;
      cashflows.push({ date: d.toISOString().split("T")[0], amount: -monthlyAmount });
    }

    // Maturity at month 12
    const maturityDate = new Date(baseDate);
    maturityDate.setMonth(maturityDate.getMonth() + 11);

    // Value with VA waived
    const baseGoldValue = accumulatedGrams * currentRate;
    const vaWaivedAmount = baseGoldValue * (vaWaivedPct / 100);
    const totalRedeemableValue = baseGoldValue + vaWaivedAmount;

    cashflows.push({ date: maturityDate.toISOString().split("T")[0], amount: totalRedeemableValue });

    const xirr = solveXIRR(cashflows);

    return {
      accumulatedGrams: Number(accumulatedGrams.toFixed(4)),
      totalDeposited: monthlyAmount * months,
      baseGoldValue: Math.round(baseGoldValue),
      vaWaivedAmount: Math.round(vaWaivedAmount),
      totalRedeemableValue: Math.round(totalRedeemableValue),
      effectiveXIRRPct: Number((xirr * 100).toFixed(2))
    };
  }

  /**
   * Cash-based Scheme (e.g. Tanishq Golden Harvest)
   * User deposits for 10 or 11 months, jeweller provides 1-month bonus discount.
   */
  function simulateCashScheme(monthlyAmount = 10000, months = 11, bonusFraction = 1.0, currentRate = 14145) {
    const cashflows = [];
    const baseDate = new Date();

    for (let m = 0; m < months; m++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + m);
      cashflows.push({ date: d.toISOString().split("T")[0], amount: -monthlyAmount });
    }

    const maturityDate = new Date(baseDate);
    maturityDate.setMonth(maturityDate.getMonth() + 11);

    const bonusAmount = monthlyAmount * bonusFraction;
    const voucherValue = (monthlyAmount * months) + bonusAmount;
    const gramsObtained = voucherValue / currentRate;

    cashflows.push({ date: maturityDate.toISOString().split("T")[0], amount: voucherValue });

    const xirr = solveXIRR(cashflows);

    return {
      totalDeposited: monthlyAmount * months,
      bonusAmount: Math.round(bonusAmount),
      voucherValue: Math.round(voucherValue),
      gramsObtained: Number(gramsObtained.toFixed(4)),
      effectiveXIRRPct: Number((xirr * 100).toFixed(2))
    };
  }

  /**
   * Analytical Harmonic Mean Breakeven Gold Price Theorem
   * Calculates exact maturity price needed for cash scheme to match weight scheme
   */
  function computeBreakevenPrice(currentRate = 14145, vaPct = 14.0, bonusFraction = 1.0) {
    // Exact threshold formula: P* = Current * (1 + bonus / 11) / (1)
    const ratio = (11 + bonusFraction) / (11 * (1 + vaPct / 100));
    const breakeven = currentRate * (1 + (1 - ratio));
    return Math.round(breakeven);
  }

  return {
    solveXIRR,
    simulateWeightScheme,
    simulateCashScheme,
    computeBreakevenPrice
  };
});
