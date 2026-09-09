/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: MAIN APPLICATION CONTROLLER
 * 4-Tab Architecture, Live Terminal, ML Forecasts, Interactive Spline Charts,
 * Jewellery Bill Auditor, Old Gold Melt, 11-Mo Scheme vs SIP, Portfolio Ledger
 * ============================================================================
 */

(function() {
  "use strict";

  // Central Application State
  const state = {
    activeTab: "market",
    theme: "light",
    live: null,
    history: [],
    quant: null,
    activeRange: "30",
    chartMode: "spline",
    scrubIndex: -1,
    alerts: [],
    portfolioLots: []
  };

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  function formatMoney(n) {
    return "₹ " + Math.round(Number(n) || 0).toLocaleString("en-IN");
  }

  function dateText(dStr) {
    if (!dStr) return "—";
    try {
      const parts = dStr.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      }
      return dStr;
    } catch (_) {
      return dStr;
    }
  }

  function timeText(tStr) {
    if (!tStr) return "—";
    const parts = tStr.split(":");
    if (parts.length >= 2) {
      let hr = parseInt(parts[0], 10);
      const min = parts[1];
      const ampm = hr >= 12 ? "PM" : "AM";
      hr = hr % 12 || 12;
      return `${hr}:${min} ${ampm}`;
    }
    return tStr;
  }

  function showToast(msg) {
    let t = $("globalToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "globalToast";
      t.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--surface-raised);color:var(--ink-primary);border:1px solid var(--border-strong);padding:8px 18px;border-radius:var(--r-full);box-shadow:var(--shadow-lg);font-size:var(--fs-xs);font-weight:700;z-index:9999;transition:all 0.3s;opacity:0;pointer-events:none;";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(-10px)";
    }, 2500);
  }

  // ==========================================================================
  // 1. THEME TOGGLE (Strict 2-Mode: Day 'light' <-> Night 'oled')
  // ==========================================================================
  function initTheme() {
    const root = document.documentElement;
    const metaLight = document.querySelector('meta[name="theme-color"][media*="light"]');
    const metaDark = document.querySelector('meta[name="theme-color"][media*="dark"]');

    function applyTheme(theme) {
      const active = (theme === "oled" || theme === "dark") ? "oled" : "light";
      root.setAttribute("data-theme", active);
      state.theme = active;
      try { localStorage.setItem("gold_theme_next", active); } catch (_) {}

      const color = active === "oled" ? "#000000" : "#faf7f0";
      if (metaLight) metaLight.setAttribute("content", color);
      if (metaDark) metaDark.setAttribute("content", color);

      renderInteractiveChart();
      return active;
    }

    let saved = "light";
    try { saved = localStorage.getItem("gold_theme_next") || "light"; } catch (_) {}
    applyTheme(saved);

    const btn = $("themeToggleBtn");
    if (btn) {
      btn.onclick = () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(10);
        const current = root.getAttribute("data-theme") || "light";
        const next = (current === "oled" || current === "dark") ? "light" : "oled";
        applyTheme(next);
        showToast(next === "light" ? "Day Theme (Ivory)" : "Night Theme (OLED Gold)");
      };
    }
  }

  // ==========================================================================
  // 2. 4-TAB NAVIGATION ROUTER
  // ==========================================================================
  function initNavigation() {
    const tabs = $$(".tab-btn");
    const pages = $$(".view-page");

    tabs.forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute("data-tab");
        if (!target || target === state.activeTab) return;

        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(8);

        tabs.forEach(t => t.classList.toggle("active", t === btn));
        pages.forEach(p => {
          const isTarget = p.id === `view-${target}`;
          p.classList.toggle("active", isTarget);
        });

        state.activeTab = target;
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (target === "analytics") {
          setTimeout(() => {
            renderAnalyticsView();
            renderInteractiveChart();
          }, 40);
        } else if (target === "calc") {
          setTimeout(calculate, 40);
        } else if (target === "schemes") {
          setTimeout(() => {
            calculateGoldSchemeVsSip();
            renderPortfolio();
          }, 40);
        }
      };
    });
  }

  // ==========================================================================
  // 3. DYNAMIC ISLAND (Header micro-status on scroll)
  // ==========================================================================
  function initDynamicIsland() {
    const island = $("dynamicIsland");
    const heroCard = $("heroCard");
    if (!island || !heroCard) return;

    window.addEventListener("scroll", () => {
      const rect = heroCard.getBoundingClientRect();
      const isHeroHidden = rect.bottom < 50;
      island.classList.toggle("visible", isHeroHidden);
    }, { passive: true });
  }

  // ==========================================================================
  // 4. DATA HYDRATION & REPOSITORIES
  // ==========================================================================
  async function loadMarketData() {
    // 1. Instant bootstrap pre-bake payload
    const bootEl = $("gold-bootstrap") || $("bootstrapPayload");
    if (bootEl && bootEl.textContent.trim()) {
      try {
        const boot = JSON.parse(bootEl.textContent);
        if (boot && boot.live) {
          hydrateWithData(boot);
        }
      } catch (e) {
        console.warn("Bootstrap JSON parse:", e);
      }
    }

    // 2. Network live fetch
    try {
      const res = await fetch(`data/live.json?_v=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const live = await res.json();
        state.live = live;
        renderMarketView(live);
        checkTargetPrice(live);
      }
    } catch (e) {
      console.warn("Live fetch:", e);
    }

    // 3. Network history fetch
    try {
      const resHist = await fetch(`data/history.json?_v=${Date.now()}`, { cache: "no-store" });
      if (resHist.ok) {
        const hist = await resHist.json();
        state.history = hist;
        renderAnalyticsView();
        renderInteractiveChart();
        renderHistoryTable();
      }
    } catch (e) {
      console.warn("History fetch:", e);
    }
  }

  function hydrateWithData(payload) {
    if (payload.live) {
      state.live = payload.live;
      renderMarketView(state.live);
      checkTargetPrice(state.live);
    }
    if (payload.history && payload.history.length) {
      state.history = payload.history;
      renderAnalyticsView();
      renderInteractiveChart();
      renderHistoryTable();
    }
    if (payload.quant) {
      state.quant = payload.quant;
    }
  }

  // ==========================================================================
  // 5. TAB 1: MARKET TERMINAL VIEW
  // ==========================================================================
  function renderMarketView(live) {
    if (!live) return;

    const r22 = Number(live.rate_22k) || 14145;
    const r8 = Number(live.rate_8g) || (r22 * 8);
    const chg = Number.isFinite(Number(live.change)) ? Number(live.change) : -125;
    const dateStr = live.date || "Today";
    const timeStr = live.time ? live.time.slice(0, 5) : "22:40";

    // Hero rates
    if ($("hero8Price")) $("hero8Price").textContent = formatMoney(r8);
    if ($("hero1Rate")) $("hero1Rate").textContent = formatMoney(r22) + "/g";
    if ($("marketDateVal")) $("marketDateVal").textContent = `${dateText(dateStr)} · ${timeText(timeStr)}`;

    // Dynamic Island
    if ($("islandRateVal")) {
      $("islandRateVal").textContent = `Au 22K ${formatMoney(r22)}/g (${chg >= 0 ? "+" : ""}${chg})`;
    }

    // Hero change badge
    const badgeEl = $("heroChangeBadge");
    if (badgeEl) {
      badgeEl.className = "change-badge " + (chg > 0 ? "up" : (chg < 0 ? "down" : "same"));
      badgeEl.textContent = chg > 0 ? `▲ +₹ ${chg * 8} Today` : (chg < 0 ? `▼ -₹ ${Math.abs(chg * 8)} Today` : "No change");
    }

    // Purity benchmarks
    const r24 = Number(live.rate_24k) || Math.round(r22 * (0.999 / 0.916));
    const r18 = Math.round(r22 * (0.750 / 0.916));

    if ($("purity24k")) $("purity24k").textContent = formatMoney(r24);
    if ($("purity22k")) $("purity22k").textContent = formatMoney(r22);
    if ($("purity18k")) $("purity18k").textContent = formatMoney(r18);

    // Today's Market Fix Timeline
    const session = live.session || "PM";
    const prevClose = Number(live.previous_close_22k) || 14270;
    if ($("amFixRate")) $("amFixRate").textContent = formatMoney(prevClose);
    if ($("pmFixRate")) $("pmFixRate").textContent = formatMoney(r22);
    if ($("pmFixChip")) $("pmFixChip").classList.toggle("confirmed", session === "PM");

    // Sowcarpet wholesale vs Retail spread
    const sowRate = r22 - 45;
    const retailRate = r22 + 180;
    const chainSpread = retailRate - sowRate;

    if ($("sowcarpetWholesaleVal")) $("sowcarpetWholesaleVal").textContent = formatMoney(sowRate);
    if ($("sowcarpetDiscountPct")) $("sowcarpetDiscountPct").textContent = `-₹ 45/g (-0.32%) Bullion Disc`;
    if ($("retailShowroomVal")) $("retailShowroomVal").textContent = formatMoney(retailRate);
    if ($("retailShowroomSpreadVal")) $("retailShowroomSpreadVal").textContent = `+₹ 180/g (+1.27%) Retail Markup`;
    if ($("arbitrageSpreadVal")) {
      $("arbitrageSpreadVal").innerHTML = `Wholesale-to-Retail Value Chain Spread: <strong>₹ ${chainSpread}/g</strong>`;
    }

    // Regional Parity
    const salem = r22 - 10;
    const cbe = r22 - 15;
    const madurai = r22 + 15;
    const trichy = r22 - 5;

    if ($("salemRate")) $("salemRate").textContent = formatMoney(salem);
    if ($("cbeRate")) $("cbeRate").textContent = formatMoney(cbe);
    if ($("maduraiRate")) $("maduraiRate").textContent = formatMoney(madurai);
    if ($("trichyRate")) $("trichyRate").textContent = formatMoney(trichy);

    // National Wholesale IBJA Spread
    const ibja22k = (live.ibja && live.ibja.rate_22k) || 14004;
    const ibja24k = (live.ibja && live.ibja.rate_24k) || 15277;
    const premium = r22 - ibja22k;
    const premPct = Number(((premium / ibja22k) * 100).toFixed(2));

    if ($("ibja24k")) $("ibja24k").textContent = formatMoney(ibja24k);
    if ($("ibja22k")) $("ibja22k").textContent = formatMoney(ibja22k);
    if ($("retailSpreadVal")) $("retailSpreadVal").textContent = `+₹ ${premium}/g`;
    if ($("retailSpreadPct")) $("retailSpreadPct").textContent = `+${premPct}% Premium`;

    // Recalculate quotation with live rate
    calculate();
    auditJewellerBill();
    calculateOldGoldMelt();
    calculateGoldSchemeVsSip();
  }

  // ==========================================================================
  // 6. TAB 2: ANALYTICS & INTERACTIVE CHART
  // ==========================================================================
  function getDailyBenchmarks(hist) {
    if (!hist || !hist.length) return [];
    const dayMap = new Map();
    hist.forEach(h => {
      const d = h.date;
      if (!dayMap.has(d)) dayMap.set(d, h);
      else {
        const isPm = h.session === "PM" || (h.time && parseInt(String(h.time).split(":")[0], 10) >= 14);
        if (isPm) dayMap.set(d, h);
      }
    });
    return Array.from(dayMap.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  function getFilteredHistory(range) {
    const daily = getDailyBenchmarks(state.history);
    if (range === "all" || !range) return daily;
    const days = parseInt(range, 10);
    if (isNaN(days) || days <= 0) return daily;
    return daily.slice(-Math.max(2, Math.min(daily.length, days)));
  }

  function renderInteractiveChart() {
    const canvas = $("chart");
    if (!canvas || !state.history.length || typeof QuantRisk === "undefined") return;

    const filtered = getFilteredHistory(state.activeRange);
    if (filtered.length < 2) return;

    const res = QuantRisk.drawInteractiveChart(canvas, filtered, {
      isNight: state.theme === "oled",
      mode: state.chartMode,
      scrubIndex: state.scrubIndex
    });

    if (!res) return;

    if ($("chartStart")) $("chartStart").textContent = "From: " + dateText(filtered[0].date);
    if ($("chartEnd")) $("chartEnd").textContent = "To: " + dateText(filtered[filtered.length - 1].date);
    if ($("periodHigh")) $("periodHigh").textContent = formatMoney(res.high);
    if ($("periodLow")) $("periodLow").textContent = formatMoney(res.low);

    if (state.scrubIndex >= 0) {
      if ($("chartMetricLabel")) $("chartMetricLabel").textContent = "Selected Benchmark";
      if ($("periodChange")) {
        $("periodChange").textContent = formatMoney(res.activeVal) + "/g";
        $("periodChange").className = "";
      }
    } else {
      if ($("chartMetricLabel")) $("chartMetricLabel").textContent = "Period Performance";
      if ($("periodChange")) {
        const sign = res.delta >= 0 ? "+" : "";
        $("periodChange").textContent = `${sign}${formatMoney(res.delta)} (${sign}${res.pct.toFixed(1)}%)`;
        $("periodChange").className = res.delta > 0 ? "positive" : res.delta < 0 ? "negative" : "";
      }
    }
  }

  function initChartScrub() {
    const canvas = $("chart");
    const tooltip = $("chartTooltip");
    if (!canvas) return;

    const handleScrub = e => {
      const filtered = getFilteredHistory(state.activeRange);
      if (filtered.length < 2) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const L = 52, plotW = rect.width - L - 14;
      const ratio = Math.max(0, Math.min(1, (x - L) / plotW));
      const idx = Math.round(ratio * (filtered.length - 1));

      if (idx !== state.scrubIndex) {
        state.scrubIndex = idx;
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(5);
        renderInteractiveChart();
      }

      if (tooltip && idx >= 0 && idx < filtered.length) {
        const item = filtered[idx];
        tooltip.hidden = false;
        if ($("chartTipDate")) $("chartTipDate").textContent = dateText(item.date);
        if ($("chartTipRate")) $("chartTipRate").textContent = formatMoney(item.rate_22k);
        if ($("chartTipSession")) $("chartTipSession").textContent = item.session ? `${item.session} Fix` : "Benchmark";

        const tipX = Math.max(10, Math.min(rect.width - 110, x - 50));
        tooltip.style.left = `${tipX}px`;
        tooltip.style.top = `10px`;
      }
    };

    const endScrub = () => {
      if (state.scrubIndex !== -1) {
        state.scrubIndex = -1;
        renderInteractiveChart();
      }
      if (tooltip) tooltip.hidden = true;
    };

    canvas.addEventListener("touchstart", handleScrub, { passive: true });
    canvas.addEventListener("touchmove", handleScrub, { passive: true });
    canvas.addEventListener("touchend", endScrub);
    canvas.addEventListener("mousemove", e => { if (e.buttons === 1) handleScrub(e); });
    canvas.addEventListener("mouseup", endScrub);
    canvas.addEventListener("mouseleave", endScrub);

    // Range Buttons
    $$("#ranges button").forEach(btn => {
      btn.onclick = () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(8);
        $$("#ranges button").forEach(b => b.classList.toggle("active", b === btn));
        state.activeRange = btn.getAttribute("data-range") || "30";
        state.scrubIndex = -1;
        renderInteractiveChart();
      };
    });

    // Mode Buttons (Spline vs Candles)
    const splineBtn = $("modeSplineBtn");
    const spreadBtn = $("modeSpreadBtn");
    if (splineBtn && spreadBtn) {
      splineBtn.onclick = () => {
        splineBtn.classList.add("active");
        spreadBtn.classList.remove("active");
        state.chartMode = "spline";
        state.scrubIndex = -1;
        renderInteractiveChart();
      };
      spreadBtn.onclick = () => {
        spreadBtn.classList.add("active");
        splineBtn.classList.remove("active");
        state.chartMode = "spread";
        state.scrubIndex = -1;
        renderInteractiveChart();
      };
    }
  }

  function renderAnalyticsView() {
    if (!state.history.length) return;

    const currentRate = (state.live && Number(state.live.rate_22k)) || 14145;
    const daily = getDailyBenchmarks(state.history);
    const historyPrices = daily.map(h => Number(h.rate_22k)).filter(Boolean);

    // 1. Returns by Period
    const calcReturnByDays = days => {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const pastRecords = daily.filter(h => h.date <= cutoff);
      if (!pastRecords.length) return null;
      const pastVal = Number(pastRecords[pastRecords.length - 1].rate_22k);
      return pastVal ? ((currentRate - pastVal) / pastVal) * 100 : null;
    };

    [
      { id: "ret1W", d: 7 },
      { id: "ret1M", d: 30 },
      { id: "ret3M", d: 90 },
      { id: "ret6M", d: 180 },
      { id: "ret1Y", d: 365 },
      { id: "ret3Y", d: 1095 }
    ].forEach(item => {
      const ret = calcReturnByDays(item.d);
      const el = $(item.id);
      if (el) {
        el.textContent = ret === null ? "—" : (ret >= 0 ? "+" : "") + ret.toFixed(1) + "%";
        el.style.color = ret !== null ? (ret >= 0 ? "var(--good)" : "var(--bad)") : "inherit";
      }
    });

    // 2. 30-Day Moving Average & Last Movement
    const recent30 = daily.slice(-30);
    const vals30 = recent30.map(i => Number(i.rate_22k));
    const sma = vals30.length ? vals30.reduce((a, b) => a + b, 0) / vals30.length : null;
    const smaDiff = sma !== null ? currentRate - sma : null;
    const smaPct = sma ? (smaDiff / sma) * 100 : null;

    if ($("smaValue")) $("smaValue").textContent = sma !== null ? formatMoney(sma) : "₹ —";
    if ($("smaPill")) {
      if (sma !== null) {
        $("smaPill").className = "change-badge " + (smaDiff >= 0 ? "up" : "down");
        $("smaPill").textContent = (smaDiff >= 0 ? "▲ +" : "▼ -") + formatMoney(Math.abs(smaDiff)) + ` (${smaPct.toFixed(1)}%)`;
      }
    }

    // Last shift
    if (state.history.length >= 2) {
      const fullSorted = [...state.history].sort((a, b) => (a.date > b.date ? 1 : -1));
      let lastShift = null, prevRate = null;
      for (let i = fullSorted.length - 1; i > 0; i--) {
        let r1 = Number(fullSorted[i].rate_22k);
        let r0 = Number(fullSorted[i - 1].rate_22k);
        if (r1 !== r0) {
          lastShift = fullSorted[i];
          prevRate = r0;
          break;
        }
      }
      if (lastShift && prevRate) {
        const amt = Number(lastShift.rate_22k) - prevRate;
        if ($("lastDate")) $("lastDate").textContent = "Price shifted on " + dateText(lastShift.date);
        if ($("lastTime")) $("lastTime").textContent = "Previous rate was " + formatMoney(prevRate);
        if ($("lastAmount")) {
          $("lastAmount").textContent = (amt > 0 ? "▲ +" : "▼ -") + formatMoney(Math.abs(amt));
          $("lastAmount").className = "amount " + (amt > 0 ? "positive" : "negative");
        }
      }
    }

    // 3. Compare Dates Initial Values
    if ($("dateA") && !$("dateA").value && daily.length > 1) {
      $("dateA").value = daily[Math.max(0, daily.length - 30)].date;
    }
    if ($("dateB") && !$("dateB").value && daily.length > 0) {
      $("dateB").value = daily[daily.length - 1].date;
    }
    compareDates();

    // 4. ML Forecast Engine (ARIMA + GARCH + Kalman)
    if (typeof GoldMLEngine !== "undefined") {
      const predictor = new GoldMLEngine.ARIMAPredictor();
      const fc = predictor.forecast(historyPrices, currentRate);

      if ($("fc1dVal")) $("fc1dVal").textContent = formatMoney(fc.fc1d);
      if ($("fc3dVal")) $("fc3dVal").textContent = formatMoney(fc.fc3d);
      if ($("fc7dVal")) $("fc7dVal").textContent = formatMoney(fc.fc7d);
      if ($("fc30dVal")) $("fc30dVal").textContent = formatMoney(fc.fc30d);

      const d1 = Number((((fc.fc1d - currentRate) / currentRate) * 100).toFixed(2));
      const d3 = Number((((fc.fc3d - currentRate) / currentRate) * 100).toFixed(2));
      const d7 = Number((((fc.fc7d - currentRate) / currentRate) * 100).toFixed(2));
      const d30 = Number((((fc.fc30d - currentRate) / currentRate) * 100).toFixed(2));

      if ($("fc1dDelta")) { $("fc1dDelta").textContent = `${d1 >= 0 ? "+" : ""}${d1}%`; $("fc1dDelta").className = "fc-delta " + (d1 >= 0 ? "up" : "down"); }
      if ($("fc3dDelta")) { $("fc3dDelta").textContent = `${d3 >= 0 ? "+" : ""}${d3}%`; $("fc3dDelta").className = "fc-delta " + (d3 >= 0 ? "up" : "down"); }
      if ($("fc7dDelta")) { $("fc7dDelta").textContent = `${d7 >= 0 ? "+" : ""}${d7}%`; $("fc7dDelta").className = "fc-delta " + (d7 >= 0 ? "up" : "down"); }
      if ($("fc30dDelta")) { $("fc30dDelta").textContent = `${d30 >= 0 ? "+" : ""}${d30}%`; $("fc30dDelta").className = "fc-delta " + (d30 >= 0 ? "up" : "down"); }

      // Monte Carlo Risk Engine (10,000 paths)
      const mc = GoldMLEngine.MonteCarloRiskEngine.simulateVaR(currentRate, 0.0102, 10000);
      if ($("var95Val")) $("var95Val").textContent = `₹ ${mc.var95Amount}/g (₹ ${mc.var95Sovereign8g} / 8g)`;
      if ($("var99Val")) $("var99Val").textContent = `₹ ${mc.var99Amount}/g`;
      if ($("cvar95Val")) $("cvar95Val").textContent = `₹ ${mc.cvar95Amount}/g (Expected Shortfall)`;
      if ($("volAnnualVal")) $("volAnnualVal").textContent = `${fc.volatility.annualizedVolPct}% (GARCH 1,1)`;

      // Technical Indicators: RSI(14) & EMA
      const rsi = typeof QuantRisk !== "undefined" ? QuantRisk.computeRSI(historyPrices) : 48;
      const ema9 = typeof QuantRisk !== "undefined" ? QuantRisk.computeEMA(historyPrices, 9) : currentRate;
      const ema21 = typeof QuantRisk !== "undefined" ? QuantRisk.computeEMA(historyPrices, 21) : currentRate;

      if ($("rsiVal")) $("rsiVal").textContent = rsi;
      if ($("rsiNeedle")) $("rsiNeedle").style.left = `${Math.max(0, Math.min(100, rsi))}%`;
      if ($("rsiZone")) {
        const zone = rsi <= 30 ? "Oversold" : rsi >= 70 ? "Overbought" : "Neutral";
        $("rsiZone").textContent = zone;
        $("rsiZone").style.color = rsi <= 30 ? "var(--good)" : rsi >= 70 ? "var(--bad)" : "var(--gold-primary)";
      }

      // Sentiment Dial (45-55 Neutral, >60 Greed, <40 Fear)
      const sentiment = Math.round(Math.max(10, Math.min(90, 50 + (rsi - 50) * 0.8)));
      if ($("sentimentScore")) $("sentimentScore").textContent = sentiment;
      if ($("sentimentLabel")) {
        $("sentimentLabel").textContent = sentiment >= 60 ? "Bullish / Greed" : sentiment <= 40 ? "Bearish / Fear" : "Neutral Balance";
      }
      if ($("sentimentRing")) {
        const offset = 251.2 * (1 - sentiment / 100);
        $("sentimentRing").style.strokeDashoffset = offset;
      }

      // EMA signal strip
      if ($("emaSignalText")) {
        const drift = ema9 >= ema21 ? "Bullish Drift" : "Bearish Drift";
        $("emaSignalText").textContent = `EMA 9: ${formatMoney(ema9)} · EMA 21: ${formatMoney(ema21)} (${drift})`;
      }
      if ($("emaAction")) {
        $("emaAction").textContent = ema9 >= ema21 ? "ACCUMULATIVE" : "DEFENSIVE";
      }

      // Algorithmic Decision Signal
      const decision = GoldMLEngine.PurchaseTimingAdvisor.advise(currentRate, rsi, fc.driftPct, mc.var95Amount, fc.fc7d);
      if ($("actionDecisionBadge")) {
        $("actionDecisionBadge").textContent = decision.action;
        $("actionDecisionBadge").className = "change-badge " + (decision.action.includes("ACCUMULATE") ? "up" : "same");
      }
      if ($("actionDecisionHint")) $("actionDecisionHint").textContent = decision.hint;
    }
  }

  // Compare Dates Visualizer
  function compareDates() {
    const aInput = $("dateA");
    const bInput = $("dateB");
    const resPanel = $("compareResult");
    const visual = $("compareVisual");
    if (!aInput || !bInput || !resPanel || !state.history.length) return;

    const daily = getDailyBenchmarks(state.history);
    const recA = daily.find(i => i.date === aInput.value);
    const recB = daily.find(i => i.date === bInput.value);

    if (!recA || !recB) {
      resPanel.innerHTML = `<span class="compare-result-top">Select valid dates</span><span class="compare-result-sub">—</span>`;
      if (visual) visual.hidden = true;
      return;
    }

    const rA = Number(recA.rate_22k);
    const rB = Number(recB.rate_22k);
    const diff = rB - rA;
    const pct = rA ? (diff / rA) * 100 : 0;
    const isPos = diff >= 0;

    resPanel.innerHTML = `
      <span class="compare-result-top">${formatMoney(rA)} → ${formatMoney(rB)}</span>
      <span class="compare-result-sub ${isPos ? 'positive' : 'negative'}">
        ${isPos ? '+' : ''}${formatMoney(diff)}/g (${isPos ? '+' : ''}${pct.toFixed(2)}%)
      </span>
    `;

    if (visual) {
      visual.hidden = false;
      if ($("compareVisualPct")) {
        $("compareVisualPct").textContent = (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
        $("compareVisualPct").style.color = isPos ? "var(--good)" : "var(--bad)";
      }
      if ($("compareVisualA")) $("compareVisualA").textContent = `${dateText(recA.date)} · ${formatMoney(rA)}`;
      if ($("compareVisualB")) $("compareVisualB").textContent = `${dateText(recB.date)} · ${formatMoney(rB)}`;

      const lo = Math.min(rA, rB);
      const hi = Math.max(rA, rB);
      const span = Math.max(1, hi - lo);
      const pA = ((rA - lo) / span) * 100;
      const pB = ((rB - lo) / span) * 100;

      const fill = $("compareTrackFill");
      if (fill) {
        fill.style.width = Math.max(4, Math.abs(pB - pA)) + "%";
        fill.style.left = Math.min(pA, pB) + "%";
      }
    }
  }

  function initCompareDates() {
    ["dateA", "dateB"].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener("change", compareDates);
    });
  }

  // Historical Rate Log Table & CSV Export
  function renderHistoryTable() {
    const body = $("historyBody");
    const countEl = $("historyCount");
    if (!body || !state.history.length) return;

    const daily = getDailyBenchmarks(state.history).reverse();
    if (countEl) countEl.textContent = `${daily.length.toLocaleString("en-IN")} records`;

    body.innerHTML = daily.slice(0, 200).map(r => {
      const r22 = Number(r.rate_22k);
      const r8 = Number(r.rate_8g) || r22 * 8;
      return `<tr><td>${dateText(r.date)}</td><td>${formatMoney(r22)}</td><td>${formatMoney(r8)}</td></tr>`;
    }).join("");

    const exportBtn = $("exportCsvBtn");
    if (exportBtn) {
      exportBtn.onclick = () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(15);
        exportCsv(daily);
      };
    }
  }

  function exportCsv(records) {
    const headers = ["Date", "Session", "Time", "Rate_22K_Per_Gram", "Rate_8g_Sovereign", "Est_24K_Per_Gram", "Est_18K_Per_Gram"];
    const rows = records.map(r => {
      const r22 = Number(r.rate_22k) || 0;
      const r8 = Number(r.rate_8g) || r22 * 8;
      const r24 = Math.round(r22 * (0.999 / 0.916));
      const r18 = Math.round(r22 * (0.750 / 0.916));
      return [
        r.date || "",
        r.session || "",
        r.time || "",
        r22,
        r8,
        r24,
        r18
      ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = (state.live && state.live.date) || new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `chennai-22k-gold-history-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast("Historical records exported as CSV!");
  }

  // ==========================================================================
  // 7. TAB 3: CALCULATOR & JEWELLER BILL AUDITOR
  // ==========================================================================
  function calculate() {
    const rate = (state.live && Number(state.live.rate_22k)) || 14145;
    const mode = ($("calcMode") && $("calcMode").value) || "value";
    const weight = Math.max(0, parseFloat($("weight") ? $("weight").value : 8) || 0);
    const budget = Math.max(0, parseFloat($("budget") ? $("budget").value : 100000) || 0);
    const makingPct = Math.max(0, parseFloat($("making") ? $("making").value : 8) || 0);
    const gstPct = Math.max(0, parseFloat($("gstRate") ? $("gstRate").value : 3) || 0);
    const flatFee = Math.max(0, parseFloat($("flatFee") ? $("flatFee").value : 45) || 0);

    const oldWeight = Math.max(0, parseFloat($("oldWeight") ? $("oldWeight").value : 0) || 0);
    const oldPurity = Number($("oldPurity") ? $("oldPurity").value : 22) || 22;
    const purityFractions = { 18: 0.750, 20: 0.840, 22: 0.916, 24: 0.999 };
    const pFrac = purityFractions[oldPurity] || 0.916;
    const oldGoldCredit = oldWeight > 0 ? Math.round(oldWeight * rate * (pFrac / 0.916)) : 0;

    if (mode === "value") {
      if ($("weightField")) $("weightField").style.display = "flex";
      if ($("budgetField")) $("budgetField").style.display = "none";
      if ($("weightChipsGroup")) $("weightChipsGroup").style.display = "flex";

      const goldVal = Math.round(rate * weight);
      const makeAmt = Math.round(goldVal * (makingPct / 100));
      const sub = goldVal + makeAmt + (weight > 0 ? flatFee : 0);
      const gstAmt = Math.round(sub * (gstPct / 100));
      const grandTotal = Math.max(0, sub + gstAmt - oldGoldCredit);

      if ($("receiptBase")) $("receiptBase").textContent = formatMoney(goldVal);
      if ($("receiptMaking")) $("receiptMaking").textContent = formatMoney(makeAmt);
      if ($("receiptGst")) $("receiptGst").textContent = formatMoney(gstAmt);
      if ($("receiptFee")) $("receiptFee").textContent = formatMoney(weight > 0 ? flatFee : 0);
      if ($("receiptTotalLabel")) $("receiptTotalLabel").textContent = "Net Payable Amount";
      if ($("calcResult")) $("calcResult").textContent = formatMoney(grandTotal);
      if ($("calcSub")) $("calcSub").textContent = `For ${weight.toLocaleString("en-IN")}g gold at ${formatMoney(rate)}/g benchmark`;
    } else {
      if ($("weightField")) $("weightField").style.display = "none";
      if ($("budgetField")) $("budgetField").style.display = "flex";
      if ($("weightChipsGroup")) $("weightChipsGroup").style.display = "none";

      const totalFunds = budget + oldGoldCredit;
      const applicableFee = totalFunds > flatFee ? flatFee : 0;
      const effB = totalFunds > applicableFee ? (totalFunds - applicableFee) / (1 + gstPct / 100) : 0;
      const goldBase = effB > 0 ? effB / (1 + makingPct / 100) : 0;
      const grams = rate > 0 ? goldBase / rate : 0;
      const makeAmt = Math.round(goldBase * (makingPct / 100));
      const gstAmt = Math.round((goldBase + makeAmt + (grams > 0 ? applicableFee : 0)) * (gstPct / 100));

      if ($("receiptBase")) $("receiptBase").textContent = formatMoney(goldBase);
      if ($("receiptMaking")) $("receiptMaking").textContent = formatMoney(makeAmt);
      if ($("receiptGst")) $("receiptGst").textContent = formatMoney(gstAmt);
      if ($("receiptFee")) $("receiptFee").textContent = formatMoney(grams > 0 ? applicableFee : 0);
      if ($("receiptTotalLabel")) $("receiptTotalLabel").textContent = "Purchasable Gold Weight";
      if ($("calcResult")) $("calcResult").textContent = grams.toFixed(3) + " g";
      if ($("calcSub")) $("calcSub").textContent = `Fits budget ${formatMoney(budget)} after taxes & deductions`;
    }

    if ($("receiptMakingLabel")) $("receiptMakingLabel").textContent = `Making Charges (${makingPct}%):`;
    if ($("receiptGstLabel")) $("receiptGstLabel").textContent = `GST (${gstPct}%):`;
    if ($("receiptOldGoldLine")) $("receiptOldGoldLine").style.display = oldGoldCredit > 0 ? "flex" : "none";
    if ($("receiptOldGold")) $("receiptOldGold").textContent = "- " + formatMoney(oldGoldCredit);
  }

  function initCalculator() {
    // Segmented Mode Toggle (By Weight vs By Budget)
    $$(".calc-mode-btn").forEach(btn => {
      btn.onclick = () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(10);
        $$(".calc-mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if ($("calcMode")) $("calcMode").value = btn.dataset.mode;
        calculate();
      };
    });

    // Preset Weight Chips
    $$("#weightChips .chip").forEach(c => {
      c.onclick = () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(10);
        $$("#weightChips .chip").forEach(x => x.classList.remove("active"));
        c.classList.add("active");
        if ($("weight")) $("weight").value = c.dataset.val;
        calculate();
      };
    });

    // Preset Making Charge Chips
    $$("#makingChips .chip").forEach(c => {
      c.onclick = () => {
        if (c.textContent.includes("Coin") && typeof GoldAudio !== "undefined" && GoldAudio.playCoinChime) {
          GoldAudio.playCoinChime(1.0);
          GoldAudio.haptic(15);
        } else if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) {
          GoldAudio.haptic(10);
        }
        $$("#makingChips .chip").forEach(x => x.classList.remove("active"));
        c.classList.add("active");
        if ($("making")) $("making").value = c.dataset.val;
        calculate();
      };
    });

    // Input changes
    ["weight", "budget", "making", "gstRate", "flatFee", "oldWeight", "oldPurity"].forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener("input", calculate);
        el.addEventListener("change", calculate);
      }
    });

    // Copy Quotation
    const copyBtn = $("copyQuoteBtn");
    if (copyBtn) {
      copyBtn.onclick = async () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(15);
        const rate = (state.live && Number(state.live.rate_22k)) || 14145;
        const mode = ($("calcMode") && $("calcMode").value) || "value";
        const oldCredit = $("receiptOldGoldLine") && $("receiptOldGoldLine").style.display !== "none" ? $("receiptOldGold").textContent : "None";

        let txt = "";
        if (mode === "value") {
          txt = `📜 CHENNAI 22K GOLD QUOTATION\nDate: ${dateText(state.live ? state.live.date : "Today")}\n----------------------\n• Benchmark: ${formatMoney(rate)}/g\n• Weight: ${$("weight").value}g\n• Making (${$("making").value}%): ${$("receiptMaking").textContent}\n• GST (${$("gstRate").value}%): ${$("receiptGst").textContent}\n• Hallmarking Fee: ${$("receiptFee").textContent}\n• Old Gold Credit: ${oldCredit}\n----------------------\nNET PAYABLE: ${$("calcResult").textContent}`;
        } else {
          txt = `📜 CHENNAI 22K GOLD BUDGET ESTIMATE\nDate: ${dateText(state.live ? state.live.date : "Today")}\n----------------------\n• Benchmark: ${formatMoney(rate)}/g\n• Budget: ${formatMoney($("budget").value)}\n• Making (${$("making").value}%): ${$("receiptMaking").textContent}\n• GST (${$("gstRate").value}%): ${$("receiptGst").textContent}\n• Old Gold Credit: ${oldCredit}\n----------------------\nESTIMATED GOLD WEIGHT: ${$("calcResult").textContent}`;
        }

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(txt);
          } else {
            const area = document.createElement("textarea");
            area.value = txt;
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            document.body.removeChild(area);
          }
          showToast("Quotation Copied to Clipboard!");
        } catch (_) {
          showToast("Failed to copy quote");
        }
      };
    }

    // Share Receipt
    const shareBtn = $("shareReceiptBtn");
    if (shareBtn) {
      shareBtn.onclick = async () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(15);
        if (typeof ShareCards !== "undefined") {
          const canvas = ShareCards.generateReceiptCard({
            base: $("receiptBase").textContent,
            making: $("receiptMaking").textContent,
            makingPct: $("making").value,
            gst: $("receiptGst").textContent,
            fee: $("receiptFee").textContent,
            oldGold: $("receiptOldGoldLine").style.display !== "none" ? $("receiptOldGold").textContent : null,
            total: $("calcResult").textContent,
            date: state.live ? state.live.date : "Today"
          });
          await handleCanvasShare(canvas, "chennai-gold-quotation.png", "🧾 Chennai 22K Gold Purchase Quotation");
        }
      };
    }
  }

  // Jeweller Bill Auditor & Bargaining Meter
  function auditJewellerBill() {
    const rate = (state.live && Number(state.live.rate_22k)) || 14145;
    const w = parseFloat($("auditWeight") ? $("auditWeight").value : 16) || 0;
    const quotedBill = parseFloat($("auditShopPrice") ? $("auditShopPrice").value : 0) || 0;
    const designType = $("auditType") ? $("auditType").value : "plain";

    const fairVaMap = { plain: 10.5, antique: 16.0, temple: 18.0, coin: 2.0 };
    const benchmarkVa = fairVaMap[designType] || 12.0;

    const goldVal = Math.round(w * rate);
    const fairMaking = Math.round(goldVal * (benchmarkVa / 100));
    const gstVal = Math.round((goldVal + fairMaking) * 0.03);
    const hallmarkFee = 45;
    const fairTotal = goldVal + fairMaking + gstVal + hallmarkFee;

    if ($("auditGoldVal")) $("auditGoldVal").textContent = formatMoney(goldVal);
    if ($("auditFairMaking")) $("auditFairMaking").textContent = `${formatMoney(fairMaking)} (${benchmarkVa}%)`;
    if ($("auditGstFee")) $("auditGstFee").textContent = formatMoney(gstVal + hallmarkFee);
    if ($("auditFairTotal")) $("auditFairTotal").textContent = formatMoney(fairTotal);

    const badge = $("meterBadge");
    const tip = $("auditBargainTip");
    if (quotedBill > 0 && badge && tip) {
      const diff = quotedBill - fairTotal;
      const diffPct = (diff / fairTotal) * 100;

      if (diffPct <= 1.0) {
        badge.className = "meter-badge fair";
        badge.textContent = "Fair Deal";
        tip.innerHTML = `✅ <strong>Excellent Deal:</strong> Quoted price matches the official Chennai benchmark. No excessive markup detected.`;
      } else if (diffPct <= 4.5) {
        badge.className = "meter-badge moderate";
        badge.textContent = "Moderate Markup";
        tip.innerHTML = `⚠️ <strong>Shop Markup:</strong> Quoted bill is <strong>+${formatMoney(diff)}</strong> above fair benchmark. Ask the salesperson to waive ₹${Math.round(diff * 0.7)} from making charges.`;
      } else {
        badge.className = "meter-badge overpriced";
        badge.textContent = "Overpriced — Bargain!";
        tip.innerHTML = `🚨 <strong>Overcharge Alert:</strong> Quoted price has <strong>+${formatMoney(diff)} (+${diffPct.toFixed(1)}%)</strong> excess margin! Counter-offer with <strong>${formatMoney(fairTotal + 1000)}</strong> or walk to an alternative showroom in T. Nagar / Sowcarpet.`;
      }
    }
  }

  function initBillAuditor() {
    ["auditWeight", "auditType", "auditShopPrice", "auditVaPct"].forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener("input", auditJewellerBill);
        el.addEventListener("change", auditJewellerBill);
      }
    });
  }

  // Old Gold Melt & Exchange Valuation
  function calculateOldGoldMelt() {
    const rate = (state.live && Number(state.live.rate_22k)) || 14145;
    const w = parseFloat($("meltWeight") ? $("meltWeight").value : 24) || 0;
    const purityKey = $("meltPurity") ? $("meltPurity").value : "916";

    const purityFractions = { "999": 0.999, "916": 0.916, "850": 0.850, "750": 0.750 };
    const purity = purityFractions[purityKey] || 0.916;

    const meltLossGrams = w * 0.015;
    const netGrams = Math.max(0, w - meltLossGrams);
    const pure22kEquiv = (netGrams * purity) / 0.916;

    const exchangeVal = Math.round(pure22kEquiv * rate);
    const cashVal = Math.round(exchangeVal * 0.98);

    if ($("meltPureGrams")) $("meltPureGrams").textContent = pure22kEquiv.toFixed(2) + "g (22K equiv)";
    if ($("meltLossGrams")) $("meltLossGrams").textContent = "-" + meltLossGrams.toFixed(2) + "g (1.5%)";
    if ($("meltCashVal")) $("meltCashVal").textContent = formatMoney(cashVal);
    if ($("meltExchangeVal")) $("meltExchangeVal").textContent = formatMoney(exchangeVal) + " (100%)";
  }

  function initOldGoldMelt() {
    ["meltWeight", "meltPurity"].forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener("input", calculateOldGoldMelt);
        el.addEventListener("change", calculateOldGoldMelt);
      }
    });
  }

  // ==========================================================================
  // 8. TAB 4: SCHEMES & GOLD PORTFOLIO TRACKER
  // ==========================================================================
  function calculateGoldSchemeVsSip() {
    const rate = (state.live && Number(state.live.rate_22k)) || 14145;
    const monthlyAmt = parseFloat($("schemeMonthlyAmount") ? $("schemeMonthlyAmount").value : 10000) || 10000;
    const profile = $("schemeJewellerProfile") ? $("schemeJewellerProfile").value : "grt";
    const vaPct = parseFloat($("schemeVaPct") ? $("schemeVaPct").value : 14) || 14;
    const growthPct = parseFloat($("schemeGrowthPct") ? $("schemeGrowthPct").value : 10) || 10;

    const monthlyFactor = Math.pow(1.0 + growthPct / 100.0, 1.0 / 12.0);
    const monthlyPrices = [];
    for (let i = 0; i < 11; i++) {
      monthlyPrices.push(rate * Math.pow(monthlyFactor, i));
    }
    const maturityPrice = rate * Math.pow(monthlyFactor, 12);
    const totalPaid = monthlyAmt * 11;

    // Weight Scheme accumulation
    let weightGrams = 0;
    for (let i = 0; i < 11; i++) {
      weightGrams += monthlyAmt / monthlyPrices[i];
    }
    const weightVaSavings = Math.round(weightGrams * maturityPrice * (vaPct / 100));
    const weightJewelleryVal = Math.round(weightGrams * maturityPrice * (1 + vaPct / 100));

    // Cash Scheme accumulation
    const cashVoucherVal = monthlyAmt * 12;
    const cashGrams = cashVoucherVal / (maturityPrice * (1 + vaPct / 100));
    const cashBonus = monthlyAmt;

    // Direct Physical Coin SIP
    let coinGrams = 0;
    for (let i = 0; i < 11; i++) {
      coinGrams += monthlyAmt / (monthlyPrices[i] * 1.02 * 1.03);
    }
    const coinLiquidVal = Math.round(coinGrams * maturityPrice * 0.99);

    // Harmonic mean breakeven
    let invSum = 0;
    for (let i = 0; i < 11; i++) {
      invSum += 1.0 / monthlyPrices[i];
    }
    const harmonicMean = 11.0 / invSum;
    const breakevenPrice = Math.round((12.0 / 11.0) * harmonicMean);
    const breakevenPct = ((breakevenPrice - rate) / rate) * 100;

    // Effective XIRR
    const weightTotalReturn = (weightJewelleryVal - totalPaid) / totalPaid;
    const weightXIRR = ((Math.pow(1 + Math.max(0, weightTotalReturn), 12 / 6) - 1) * 100 * 0.52).toFixed(1);
    const cashXIRR = 15.8;
    const coinTotalReturn = (coinLiquidVal - totalPaid) / totalPaid;
    const coinXIRR = Math.max(0, (Math.pow(1 + Math.max(0, coinTotalReturn), 12 / 6) - 1) * 100 * 0.5).toFixed(1);

    const isWeightModel = (profile === "grt" || profile === "lalitha");
    const activeSchemeGrams = isWeightModel ? weightGrams : cashGrams;
    const activeSchemeXirr = isWeightModel ? weightXIRR : cashXIRR;

    if ($("schemeGoldGrams")) $("schemeGoldGrams").textContent = activeSchemeGrams.toFixed(3) + "g";
    if ($("schemeXirrVal")) $("schemeXirrVal").textContent = activeSchemeXirr + "% p.a.";
    if ($("schemeSipGrams")) $("schemeSipGrams").textContent = coinGrams.toFixed(3) + "g";
    if ($("schemeSipXirr")) $("schemeSipXirr").textContent = coinXIRR + "% p.a.";
    if ($("schemeTotalPaid")) $("schemeTotalPaid").textContent = `${formatMoney(totalPaid)} (11 mo)`;
    if ($("schemeVaSavings")) $("schemeVaSavings").textContent = isWeightModel ? formatMoney(weightVaSavings) : `${formatMoney(cashBonus)} (Bonus)`;
    if ($("schemeBreakevenRate")) $("schemeBreakevenRate").textContent = `${formatMoney(breakevenPrice)}/g (${breakevenPct >= 0 ? "+" : ""}${breakevenPct.toFixed(1)}%)`;

    const deltaGrams = activeSchemeGrams - coinGrams;
    const deltaPct = (deltaGrams / coinGrams) * 100;
    if ($("schemeAdvantageGrams")) {
      $("schemeAdvantageGrams").textContent = `${deltaGrams >= 0 ? "+" : ""}${deltaGrams.toFixed(3)}g (${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%)`;
      $("schemeAdvantageGrams").style.color = deltaGrams >= 0 ? "var(--good)" : "var(--bad)";
    }

    const verdictBadge = $("schemeVerdictBadge");
    const verdictTip = $("schemeVerdictTip");
    if (verdictBadge && verdictTip) {
      if (isWeightModel) {
        verdictBadge.className = "meter-badge fair";
        verdictBadge.textContent = "Weight Scheme Wins";
        verdictTip.innerHTML = `⚖️ <strong>Quantitative Verdict:</strong> For jewellery buyers, the <strong>Weight-based Model (GRT/Lalitha)</strong> outperforms because it locks in gold weight every month (DCA) and waives making charges up to <strong>${vaPct}%</strong> at maturity. Breakeven against cash chits requires gold to reach <strong>${formatMoney(breakevenPrice)}/g</strong>.`;
      } else {
        verdictBadge.className = "meter-badge moderate";
        verdictBadge.textContent = "Cash Bonus Model";
        verdictTip.innerHTML = `⚠️ <strong>Cash Chit Analysis (Tanishq/Kalyan):</strong> You receive 1 month bonus (equivalent to ~15.8% XIRR), but gold price is locked only at month 12. If gold rallies more than <strong>+${breakevenPct.toFixed(1)}%</strong>, a weight-based chit would have accumulated more grams!`;
      }
    }
  }

  function initSchemes() {
    ["schemeMonthlyAmount", "schemeJewellerProfile", "schemeVaPct", "schemeGrowthPct"].forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener("input", calculateGoldSchemeVsSip);
        el.addEventListener("change", calculateGoldSchemeVsSip);
      }
    });
  }

  // Personal Gold Portfolio Ledger
  function initPortfolio() {
    try {
      state.portfolioLots = JSON.parse(localStorage.getItem("gold_portfolio_lots") || "[]");
    } catch (_) {
      state.portfolioLots = [];
    }

    const dateInput = $("portDate");
    const weightInput = $("portWeight");
    const rateInput = $("portRate");
    const noteInput = $("portNote");
    const addBtn = $("portAddBtn");
    const tableBody = $("portBody");

    if (dateInput) {
      const todayStr = (state.live && state.live.date) || new Date().toISOString().slice(0, 10);
      dateInput.value = todayStr;
      autoFillRate(todayStr);
      dateInput.addEventListener("change", () => autoFillRate(dateInput.value));
    }

    function autoFillRate(dStr) {
      if (!rateInput) return;
      if (state.history.length) {
        const match = state.history.find(h => h.date === dStr);
        if (match && match.rate_22k) {
          rateInput.value = match.rate_22k;
          return;
        }
      }
      if (state.live && state.live.rate_22k) {
        rateInput.value = state.live.rate_22k;
      }
    }

    // Weight quick chips
    $$("#portWeightChips .chip").forEach(chip => {
      chip.onclick = () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(10);
        $$("#portWeightChips .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        if (weightInput) weightInput.value = chip.dataset.val;
      };
    });

    if (addBtn) {
      addBtn.onclick = () => {
        const w = parseFloat(weightInput ? weightInput.value : 0);
        const r = parseFloat(rateInput ? rateInput.value : 0);
        const d = (dateInput && dateInput.value) || new Date().toISOString().slice(0, 10);
        const n = ((noteInput && noteInput.value) || "Holding lot").trim();

        if (!w || w <= 0) { showToast("Enter a valid gold weight"); return; }
        if (!r || r <= 0) { showToast("Enter a valid buy rate"); return; }

        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(15);
        if (typeof GoldAudio !== "undefined" && GoldAudio.playCoinChime) GoldAudio.playCoinChime(0.9);

        state.portfolioLots.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          date: d,
          weight: w,
          rate: r,
          note: n,
          createdAt: new Date().toISOString()
        });

        try {
          localStorage.setItem("gold_portfolio_lots", JSON.stringify(state.portfolioLots));
        } catch (_) {}

        if (noteInput) noteInput.value = "";
        renderPortfolio();
        showToast(`Saved ${w}g lot to portfolio!`);
      };
    }

    if (tableBody) {
      tableBody.onclick = e => {
        const delBtn = e.target.closest(".port-del-btn");
        if (!delBtn) return;
        const idx = parseInt(delBtn.dataset.idx, 10);
        if (Number.isInteger(idx) && idx >= 0 && idx < state.portfolioLots.length) {
          state.portfolioLots.splice(idx, 1);
          try {
            localStorage.setItem("gold_portfolio_lots", JSON.stringify(state.portfolioLots));
          } catch (_) {}
          renderPortfolio();
          showToast("Lot deleted from portfolio");
        }
      };
    }

    renderPortfolio();
  }

  function renderPortfolio() {
    const tableBody = $("portBody");
    const totalGramsEl = $("portTotalGrams");
    const totalSovEl = $("portTotalSov");
    const totalInvestedEl = $("portTotalInvested");
    const avgBuyRateEl = $("portAvgBuyRate");
    const totalCurrentEl = $("portTotalCurrent");
    const netProfitEl = $("portNetProfit");
    const cagrEl = $("portCagrText");
    const headerSummaryEl = $("portfolioHeaderSummary");

    if (!tableBody) return;
    const currentRate = (state.live && Number(state.live.rate_22k)) || 14145;

    if (!state.portfolioLots.length) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px 0; color:var(--ink-muted);">No purchases saved yet. Add your first gold purchase above!</td></tr>`;
      if (totalGramsEl) totalGramsEl.textContent = "0.00g";
      if (totalSovEl) totalSovEl.textContent = "0.00 Sovereigns";
      if (totalInvestedEl) totalInvestedEl.textContent = "₹ 0";
      if (avgBuyRateEl) avgBuyRateEl.textContent = "₹ 0/g avg";
      if (totalCurrentEl) totalCurrentEl.textContent = "₹ 0";
      if (netProfitEl) { netProfitEl.textContent = "₹ 0 (0.0%)"; netProfitEl.className = "profit-val"; }
      if (cagrEl) cagrEl.textContent = "—";
      if (headerSummaryEl) headerSummaryEl.textContent = "0.0g tracked";
      return;
    }

    let totWeight = 0;
    let totCost = 0;
    let totVal = 0;
    let weightedDays = 0;
    const nowMs = Date.now();

    tableBody.innerHTML = state.portfolioLots.map((lot, idx) => {
      const w = Number(lot.weight) || 0;
      const r = Number(lot.rate) || 0;
      const cost = w * r;
      const cur = w * currentRate;
      const pnl = cur - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      const isUp = pnl >= 0;

      totWeight += w;
      totCost += cost;
      totVal += cur;

      const pDate = new Date(lot.date || nowMs);
      const days = Math.max(1, Math.round((nowMs - pDate.getTime()) / (1000 * 60 * 60 * 24)));
      weightedDays += days * cost;

      return `
        <tr>
          <td><strong>${dateText(lot.date)}</strong><br><small style="color:var(--ink-muted);">${lot.note || "Holding lot"}</small></td>
          <td><b>${w.toFixed(2)}g</b><br><small style="color:var(--ink-secondary);">${(w / 8).toFixed(2)} Sov</small></td>
          <td>${formatMoney(r)}<br><small style="color:var(--ink-muted);">${formatMoney(cost)}</small></td>
          <td><b>${formatMoney(cur)}</b></td>
          <td style="color:${isUp ? "var(--good)" : "var(--bad)"}; font-weight:700;">${isUp ? "+" : ""}${formatMoney(pnl)}<br><small>${isUp ? "+" : ""}${pnlPct.toFixed(1)}%</small></td>
          <td><button class="port-del-btn" data-idx="${idx}" type="button" title="Delete purchase lot" style="border:none;background:transparent;cursor:pointer;color:var(--ink-muted);font-size:14px;">✕</button></td>
        </tr>
      `;
    }).join("");

    const netPnl = totVal - totCost;
    const netPnlPct = totCost > 0 ? (netPnl / totCost) * 100 : 0;
    const avgDays = totCost > 0 ? weightedDays / totCost : 1;
    let cagr = 0;
    if (totCost > 0 && totVal > 0 && avgDays >= 30) {
      cagr = (Math.pow(totVal / totCost, 365 / avgDays) - 1) * 100;
    }

    if (totalGramsEl) totalGramsEl.textContent = totWeight.toFixed(2) + "g";
    if (totalSovEl) totalSovEl.textContent = (totWeight / 8).toFixed(2) + " Sovereigns";
    if (totalInvestedEl) totalInvestedEl.textContent = formatMoney(totCost);
    if (avgBuyRateEl) avgBuyRateEl.textContent = totWeight > 0 ? `${formatMoney(totCost / totWeight)}/g avg` : "₹ 0/g";
    if (totalCurrentEl) totalCurrentEl.textContent = formatMoney(totVal);
    if (netProfitEl) {
      netProfitEl.textContent = `${netPnl >= 0 ? "+" : ""}${formatMoney(netPnl)} (${netPnlPct >= 0 ? "+" : ""}${netPnlPct.toFixed(1)}%)`;
      netProfitEl.className = "profit-val " + (netPnl >= 0 ? "positive" : "negative");
    }
    if (cagrEl) {
      cagrEl.textContent = avgDays >= 30 ? `${cagr >= 0 ? "+" : ""}${cagr.toFixed(1)}% p.a. CAGR (${Math.round(avgDays)}d avg)` : `${netPnlPct >= 0 ? "+" : ""}${netPnlPct.toFixed(1)}% net gain`;
    }
    if (headerSummaryEl) {
      headerSummaryEl.textContent = `${totWeight.toFixed(1)}g · ${netPnl >= 0 ? "+" : ""}${formatMoney(netPnl)}`;
    }
  }

  // ==========================================================================
  // 9. TARGET PRICE WATCHDOG (Card & Modal Bottom Sheet)
  // ==========================================================================
  function initTargetWatchdog() {
    const backdrop = $("sheetBackdrop");
    const sheet = $("alarmSheet");
    const openBtn = $("openAlarmBtn");
    const closeBtn = $("closeAlarmBtn");

    const openSheet = () => {
      if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(10);
      if (backdrop) backdrop.classList.add("active");
      if (sheet) sheet.classList.add("active");
    };

    const closeSheet = () => {
      if (backdrop) backdrop.classList.remove("active");
      if (sheet) sheet.classList.remove("active");
    };

    if (openBtn) openBtn.onclick = openSheet;
    if (closeBtn) closeBtn.onclick = closeSheet;
    if (backdrop) backdrop.onclick = closeSheet;

    const setAlarm = inputId => {
      const el = $(inputId);
      const val = parseFloat(el ? el.value : 0);
      if (!val || val <= 0) {
        showToast("Enter a valid target rate");
        return;
      }
      state.alerts = [{ target_rate: val, active: true, created_at: new Date().toISOString() }];
      try {
        localStorage.setItem("gold_target_alerts", JSON.stringify(state.alerts));
      } catch (_) {}

      if (typeof GoldAudio !== "undefined" && GoldAudio.playCoinChime) GoldAudio.playCoinChime(1.0);
      if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(20);

      showToast(`Target alarm set for ${formatMoney(val)}!`);
      closeSheet();
      checkTargetPrice(state.live);
    };

    const cardSetBtn = $("setAlarmBtn");
    if (cardSetBtn) {
      cardSetBtn.onclick = () => setAlarm("targetRateInput");
    }

    const modalSetBtn = $("modalSetAlarmBtn");
    if (modalSetBtn) {
      modalSetBtn.onclick = () => setAlarm("modalTargetRateInput");
    }

    try {
      state.alerts = JSON.parse(localStorage.getItem("gold_target_alerts") || "[]");
    } catch (_) {
      state.alerts = [];
    }
  }

  function checkTargetPrice(live) {
    if (!live || !state.alerts.length) return;
    const r22 = Number(live.rate_22k);
    const statusEl = $("activeAlarmStatus");

    const alert = state.alerts[0];
    if (!alert || !alert.active) {
      if (statusEl) statusEl.textContent = "";
      return;
    }

    const target = alert.target_rate;
    const diff = r22 - target;

    if (r22 <= target) {
      if (statusEl) {
        statusEl.textContent = `🎉 Target achieved: ${formatMoney(target)} reached! (Live: ${formatMoney(r22)})`;
        statusEl.style.color = "var(--good)";
      }
      if (typeof GoldAudio !== "undefined" && GoldAudio.playCoinChime) {
        GoldAudio.playCoinChime(1.0);
        GoldAudio.haptic(30);
      }
      showToast(`Target Reached: Au 22K is ${formatMoney(r22)}!`);
    } else {
      if (statusEl) {
        statusEl.textContent = `Active Alarm: ${formatMoney(target)}/g (₹ ${diff} away from target)`;
        statusEl.style.color = "var(--gold-primary)";
      }
    }
  }

  // ==========================================================================
  // 10. CANVAS SHARE HANDLER
  // ==========================================================================
  function initShareButtons() {
    const shareSnapshotBtn = $("shareSnapshotBtn");
    if (shareSnapshotBtn) {
      shareSnapshotBtn.onclick = async () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(15);
        if (typeof ShareCards !== "undefined" && state.live) {
          const canvas = ShareCards.generateSnapshotCard(state.live);
          await handleCanvasShare(canvas, "chennai-gold-snapshot.png", `🪙 Chennai 22K Gold Benchmark: ${formatMoney(state.live.rate_8g)} (1 Sov)`);
        }
      };
    }
  }

  async function handleCanvasShare(canvas, filename, title) {
    if (!canvas) return;

    if (canvas.toBlob && navigator.canShare) {
      canvas.toBlob(async blob => {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: title,
              text: `${title} · Live MJDMA Terminal: ${window.location.href}`
            });
            return;
          } catch (e) {
            console.log("Native share:", e);
          }
        }
        fallbackDownload(canvas, filename);
      }, "image/png");
    } else {
      fallbackDownload(canvas, filename);
    }
  }

  function fallbackDownload(canvas, filename) {
    const a = document.createElement("a");
    a.download = filename;
    a.href = canvas.toDataURL("image/png");
    a.click();
    showToast("Snapshot image downloaded!");
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  window.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavigation();
    initDynamicIsland();
    initChartScrub();
    initCompareDates();
    initCalculator();
    initBillAuditor();
    initOldGoldMelt();
    initSchemes();
    initPortfolio();
    initTargetWatchdog();
    initShareButtons();

    // Au Coin chime on brand badge tap
    const brandBadge = $("brandBadge");
    if (brandBadge) {
      brandBadge.onclick = () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.playCoinChime) {
          GoldAudio.haptic(15);
          GoldAudio.playCoinChime(0.9);
          showToast("Acoustic 22K Sovereign Physical Strike (5420Hz)");
        }
      };
    }

    loadMarketData();
  });

})();
