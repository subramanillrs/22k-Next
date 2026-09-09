/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: QUANTITATIVE RISK & INTERACTIVE CHART MODULE
 * Monotone Splines, Session Candles, Crosshairs, Moving Averages & RSI
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
   * Monotone Cubic Hermite Spline calculation
   * Guarantees monotonicity without overshoot
   */
  function drawSpline(ctx, pts) {
    const n = pts.length;
    if (n < 2) return;
    if (n === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      return;
    }
    const dx = new Float64Array(n - 1);
    const m = new Float64Array(n - 1);
    for (let i = 0; i < n - 1; i++) {
      dx[i] = pts[i + 1].x - pts[i].x;
      m[i] = (pts[i + 1].y - pts[i].y) / (dx[i] || 1e-6);
    }
    const d = new Float64Array(n);
    d[0] = m[0];
    d[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (m[i - 1] * m[i] <= 0) {
        d[i] = 0;
      } else {
        d[i] = (m[i - 1] + m[i]) / 2;
      }
    }
    for (let i = 0; i < n - 1; i++) {
      if (Math.abs(m[i]) < 1e-9) {
        d[i] = 0;
        d[i + 1] = 0;
      } else {
        const alpha = d[i] / m[i];
        const beta = d[i + 1] / m[i];
        const dist = alpha * alpha + beta * beta;
        if (dist > 9) {
          const tau = 3 / Math.sqrt(dist);
          d[i] = tau * alpha * m[i];
          d[i + 1] = tau * beta * m[i];
        }
      }
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i] / 3;
      ctx.bezierCurveTo(
        pts[i].x + h,
        pts[i].y + d[i] * h,
        pts[i + 1].x - h,
        pts[i + 1].y - d[i + 1] * h,
        pts[i + 1].x,
        pts[i + 1].y
      );
    }
  }

  /**
   * Full Interactive Spline & Candlestick Chart Renderer
   */
  function drawInteractiveChart(canvas, data, options) {
    if (!canvas || !canvas.parentElement || !data || data.length < 2) return null;

    options = options || {};
    const width = canvas.parentElement.clientWidth || 600;
    const height = canvas.parentElement.clientHeight || 240;
    const dpr = Math.min(2.5, Math.max(1, (typeof window !== "undefined" && window.devicePixelRatio) || 1.5));

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const isNight = !!options.isNight;
    const mode = options.mode || "spline";
    const scrubIndex = Number.isInteger(options.scrubIndex) ? options.scrubIndex : -1;

    const colorGold = isNight ? "#ffd700" : "#a97f34";
    const colorTextTertiary = isNight ? "#786d5c" : "#8c8273";

    const values = data.map(i => Number(i.rate_22k));
    const min0 = Math.min(...values);
    const max0 = Math.max(...values);
    const pad = Math.max(40, (max0 - min0) * 0.16);
    const min = min0 - pad;
    const max = max0 + pad;

    const L = 52, R = 14, T = 22, B = 24;
    const plotW = width - L - R;
    const plotH = height - T - B;

    const py = val => T + (1 - ((val - min) / (max - min))) * plotH;
    const points = values.map((val, i) => ({
      x: L + (i / (values.length - 1)) * plotW,
      y: py(val),
      val
    }));

    // 1. Horizontal Grid Lines + Price Labels
    ctx.font = "600 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "right";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const gy = T + (plotH * i / 4);
      ctx.strokeStyle = isNight ? "rgba(255, 255, 255, 0.06)" : "rgba(28, 23, 18, 0.07)";
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(L, gy);
      ctx.lineTo(width - R, gy);
      ctx.stroke();

      const gridVal = max - ((max - min) * i / 4);
      ctx.fillStyle = colorTextTertiary;
      ctx.fillText(Math.round(gridVal).toLocaleString("en-IN"), L - 8, gy + 3.5);
    }

    // 2. Period Open Baseline (dashed reference)
    const openY = points[0].y;
    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.22)" : "rgba(169, 127, 52, 0.20)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(L, openY);
    ctx.lineTo(width - R, openY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (mode === "spread") {
      // 3a. Session Candlesticks (AM / PM)
      const dayMap = new Map();
      data.forEach(r => {
        const d = r.date;
        if (!dayMap.has(d)) dayMap.set(d, { date: d, am: null, pm: null, rates: [] });
        const entry = dayMap.get(d);
        const val = Number(r.rate_22k);
        entry.rates.push(val);
        const isAm = r.session === "AM" || (r.time && parseInt(String(r.time).split(":")[0], 10) < 14);
        if (isAm && entry.am === null) entry.am = val;
        else entry.pm = val;
      });

      const days = Array.from(dayMap.values());
      const barW = Math.max(6, Math.min(26, (plotW / Math.max(1, days.length)) * 0.72));

      days.forEach((day, i) => {
        const cx = L + (i / Math.max(1, days.length - 1)) * plotW;
        const amVal = day.am !== null ? day.am : day.rates[0];
        const pmVal = day.pm !== null ? day.pm : day.rates[day.rates.length - 1];
        const isUp = pmVal >= amVal;
        const dayHigh = Math.max(...day.rates, amVal, pmVal);
        const dayLow = Math.min(...day.rates, amVal, pmVal);
        const yHigh = py(dayHigh);
        const yLow = py(dayLow);
        const yOpen = py(amVal);
        const yClose = py(pmVal);
        const yBodyTop = Math.min(yOpen, yClose);
        const yBodyBot = Math.max(yOpen, yClose);
        const barH = Math.max(4, yBodyBot - yBodyTop);

        const strokeColor = isUp ? (isNight ? "#7bd39a" : "#1b7a42") : (isNight ? "#ff7b72" : "#c62828");
        const fillColor = isUp
          ? (isNight ? "rgba(123, 211, 154, 0.35)" : "rgba(27, 122, 66, 0.28)")
          : (isNight ? "rgba(255, 123, 114, 0.35)" : "rgba(198, 40, 40, 0.28)");

        // Wick
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx, yHigh);
        ctx.lineTo(cx, yLow);
        ctx.stroke();

        // Body
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        const r = Math.min(3, barW / 4);
        ctx.beginPath();
        ctx.moveTo(cx - barW / 2 + r, yBodyTop);
        ctx.arcTo(cx + barW / 2, yBodyTop, cx + barW / 2, yBodyTop + barH, r);
        ctx.arcTo(cx + barW / 2, yBodyTop + barH, cx - barW / 2, yBodyTop + barH, r);
        ctx.arcTo(cx - barW / 2, yBodyTop + barH, cx - barW / 2, yBodyTop, r);
        ctx.arcTo(cx - barW / 2, yBodyTop, cx + barW / 2, yBodyTop, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    } else {
      // 3b. Monotone Cubic Spline with Ambient Glow Gradient
      drawSpline(ctx, points);
      ctx.lineTo(points[points.length - 1].x, height - B);
      ctx.lineTo(points[0].x, height - B);
      ctx.closePath();

      const fillGrad = ctx.createLinearGradient(0, T, 0, height - B);
      if (isNight) {
        fillGrad.addColorStop(0, "rgba(255, 215, 0, 0.26)");
        fillGrad.addColorStop(0.45, "rgba(255, 215, 0, 0.09)");
        fillGrad.addColorStop(1, "rgba(255, 215, 0, 0.0)");
      } else {
        fillGrad.addColorStop(0, "rgba(169, 127, 52, 0.22)");
        fillGrad.addColorStop(0.45, "rgba(169, 127, 52, 0.07)");
        fillGrad.addColorStop(1, "rgba(169, 127, 52, 0.0)");
      }
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Ambient glow line
      drawSpline(ctx, points);
      ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.22)" : "rgba(169, 127, 52, 0.18)";
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Crisp line
      drawSpline(ctx, points);
      ctx.strokeStyle = colorGold;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // High & Low Callout Badges
      if (data.length >= 3) {
        let maxIdx = 0, minIdx = 0;
        for (let i = 1; i < values.length; i++) {
          if (values[i] > values[maxIdx]) maxIdx = i;
          if (values[i] < values[minIdx]) minIdx = i;
        }

        const drawCallout = (pt, label, isPeak) => {
          const pillW = 60, pillH = 18;
          const bx = Math.max(L + 2, Math.min(width - R - pillW - 2, pt.x - pillW / 2));
          const by = isPeak ? Math.max(T - 18, pt.y - pillH - 6) : Math.min(height - B - pillH - 2, pt.y + 6);

          ctx.fillStyle = isNight ? "rgba(18, 16, 14, 0.88)" : "rgba(255, 255, 255, 0.92)";
          ctx.strokeStyle = isPeak
            ? (isNight ? "rgba(123, 211, 154, 0.45)" : "rgba(27, 122, 66, 0.4)")
            : (isNight ? "rgba(255, 123, 114, 0.45)" : "rgba(198, 40, 40, 0.4)");
          ctx.lineWidth = 1;

          const cr = 4;
          ctx.beginPath();
          ctx.moveTo(bx + cr, by);
          ctx.arcTo(bx + pillW, by, bx + pillW, by + pillH, cr);
          ctx.arcTo(bx + pillW, by + pillH, bx, by + pillH, cr);
          ctx.arcTo(bx, by + pillH, bx, by, cr);
          ctx.arcTo(bx, by, bx + pillW, by, cr);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.font = "700 8.5px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = isPeak
            ? (isNight ? "#7bd39a" : "#1b7a42")
            : (isNight ? "#ff7b72" : "#c62828");
          ctx.fillText(label, bx + pillW / 2, by + 12);
        };

        if (maxIdx !== minIdx) {
          drawCallout(points[maxIdx], "▲ ₹" + max0.toLocaleString("en-IN"), true);
          drawCallout(points[minIdx], "▼ ₹" + min0.toLocaleString("en-IN"), false);
        }
      }
    }

    // 4. Interactive Scrub Crosshairs & Tooltip Indicators
    const activeIdx = (scrubIndex >= 0 && scrubIndex < data.length) ? scrubIndex : data.length - 1;
    const activePt = points[activeIdx];

    if (scrubIndex >= 0) {
      // Vertical crosshair
      ctx.strokeStyle = colorGold;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(activePt.x, T);
      ctx.lineTo(activePt.x, height - B);
      ctx.stroke();

      // Horizontal crosshair to Y-axis
      ctx.beginPath();
      ctx.moveTo(L, activePt.y);
      ctx.lineTo(activePt.x, activePt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis Price Pill
      const priceText = "₹ " + values[activeIdx].toLocaleString("en-IN");
      ctx.font = "700 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
      const pW = ctx.measureText(priceText).width + 8;
      ctx.fillStyle = colorGold;
      ctx.fillRect(L - pW - 2, activePt.y - 7.5, pW, 15);
      ctx.fillStyle = isNight ? "#000000" : "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(priceText, L - 2 - pW / 2, activePt.y + 3.5);
    }

    // Active point circle
    ctx.fillStyle = colorGold;
    ctx.beginPath();
    ctx.arc(activePt.x, activePt.y, scrubIndex >= 0 ? 5.5 : 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isNight ? "#12100e" : "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const delta = values[values.length - 1] - values[0];
    const pct = values[0] ? (delta / values[0] * 100) : 0;

    return {
      min: min0,
      max: max0,
      delta,
      pct,
      high: max0,
      low: min0,
      activePt,
      activeVal: values[activeIdx],
      activeItem: data[activeIdx],
      plotBounds: { L, R, T, B, plotW, plotH, width, height }
    };
  }

  // Legacy fallback
  function drawSplineChart(canvas, dataPoints, isNight) {
    return drawInteractiveChart(canvas, dataPoints, { isNight: !!isNight, mode: "spline" });
  }

  return {
    computeEMA,
    computeRSI,
    drawSpline,
    drawInteractiveChart,
    drawSplineChart
  };
});
