/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: QUANTITATIVE RISK & SPLINE CHART MODULE
 * ============================================================================
 */

(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.QuantRisk = factory();
  }
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";

  /**
   * Computes Exponential Moving Average (EMA)
   */
  function computeEMA(prices, period) {
    if (!prices || prices.length < period) return null;
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return Number(ema.toFixed(2));
  }

  /**
   * Computes Relative Strength Index (RSI 14)
   */
  function computeRSI(prices, period = 14) {
    if (!prices || prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      const gain = diff >= 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return Number((100 - (100 / (1 + rs))).toFixed(1));
  }

  /**
   * High-Performance Canvas Spline Chart Renderer
   */
  function drawSplineChart(canvas, dataPoints, isNight = false) {
    if (!canvas || !dataPoints || dataPoints.length < 2) return;

    const dpr = Math.min(2, Math.max(1, (typeof window !== "undefined" && window.devicePixelRatio) || 1.5));
    const rect = canvas.getBoundingClientRect();
    const W = rect.width || 600;
    const H = 220;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);

    const padLeft = 10;
    const padRight = 10;
    const padTop = 16;
    const padBottom = 24;

    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    const values = dataPoints.map(d => d.rate_22k);
    let minVal = Math.min(...values);
    let maxVal = Math.max(...values);
    if (minVal === maxVal) { minVal -= 100; maxVal += 100; }
    const range = maxVal - minVal;

    const points = values.map((val, idx) => {
      const x = padLeft + (idx / (values.length - 1)) * plotW;
      const y = padTop + plotH - ((val - minVal) / range) * plotH;
      return { x, y, val };
    });

    // Background horizontal grid lines
    ctx.strokeStyle = isNight ? "rgba(255, 255, 255, 0.05)" : "rgba(28, 23, 18, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const gy = padTop + (plotH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, gy);
      ctx.lineTo(W - padRight, gy);
      ctx.stroke();
    }

    // Gradient fill under the spline
    const fillGrad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    if (isNight) {
      fillGrad.addColorStop(0, "rgba(255, 215, 0, 0.28)");
      fillGrad.addColorStop(1, "rgba(255, 215, 0, 0.0)");
    } else {
      fillGrad.addColorStop(0, "rgba(169, 127, 52, 0.25)");
      fillGrad.addColorStop(1, "rgba(169, 127, 52, 0.0)");
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.lineTo(points[points.length - 1].x, padTop + plotH);
    ctx.lineTo(points[0].x, padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Spline stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.strokeStyle = isNight ? "#ffd700" : "#a97f34";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Latest price point marker
    const lastP = points[points.length - 1];
    ctx.fillStyle = isNight ? "#ffffff" : "#1c1712";
    ctx.beginPath();
    ctx.arc(lastP.x, lastP.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isNight ? "#ffd700" : "#a97f34";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return {
    computeEMA,
    computeRSI,
    drawSplineChart
  };
});
