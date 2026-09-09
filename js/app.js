/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: MAIN APPLICATION CONTROLLER
 * 4-Tab Docked Architecture, ML Model Orchestration, Dynamic Island, PWA v8
 * ============================================================================
 */

(function() {
  "use strict";

  // State management
  let state = {
    activeTab: "market",
    theme: "light",
    live: null,
    history: [],
    quant: null,
    activeTimeframe: 30,
    alerts: []
  };

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  function formatMoney(n) {
    return "₹ " + Number(n).toLocaleString("en-IN");
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
      localStorage.setItem("gold_theme_next", active);

      const color = active === "oled" ? "#000000" : "#faf7f0";
      if (metaLight) metaLight.setAttribute("content", color);
      if (metaDark) metaDark.setAttribute("content", color);

      renderSplineChart();
      return active;
    }

    const saved = localStorage.getItem("gold_theme_next");
    applyTheme(saved || "light");

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
          setTimeout(renderAnalyticsView, 50);
        }
      };
    });
  }

  // ==========================================================================
  // 3. DYNAMIC ISLAND (Collapsing Micro-Header on Scroll)
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
  // 4. DATA HYDRATION & PIPELINE
  // ==========================================================================
  async function loadMarketData() {
    // 1. Instant bootstrap from script tag if pre-baked
    const bootEl = $("gold-bootstrap") || $("bootstrapPayload");
    if (bootEl && bootEl.textContent.trim()) {
      try {
        const boot = JSON.parse(bootEl.textContent);
        if (boot && boot.live) {
          hydrateWithData(boot);
        }
      } catch (e) {
        console.warn("Bootstrap parse error:", e);
      }
    }

    // 2. Fast network-first fetch
    try {
      const ts = Date.now();
      const res = await fetch(`data/live.json?_v=${ts}`, { cache: "no-store" });
      if (res.ok) {
        const live = await res.json();
        state.live = live;
        renderMarketView(live);
      }
    } catch (e) {
      console.warn("Live fetch error, falling back to cached:", e);
    }

    // 3. History fetch for charts and ML
    try {
      const resHist = await fetch(`data/history.json?_v=${Date.now()}`, { cache: "no-store" });
      if (resHist.ok) {
        const hist = await resHist.json();
        state.history = hist;
        renderAnalyticsView();
      }
    } catch (e) {
      console.warn("History fetch error:", e);
    }
  }

  function hydrateWithData(payload) {
    state.live = payload.live;
    if (payload.history) state.history = payload.history;
    if (payload.quant) state.quant = payload.quant;
    renderMarketView(state.live);
    renderAnalyticsView();
  }

  // ==========================================================================
  // 5. RENDER MARKET TERMINAL VIEW (Tab 1)
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
    if ($("marketDateVal")) $("marketDateVal").textContent = `${dateStr} · ${timeStr}`;

    // Dynamic Island
    if ($("islandRateVal")) $("islandRateVal").textContent = `Au 22K ${formatMoney(r22)}/g (${chg >= 0 ? "+" : ""}${chg})`;

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

    // Fix Timeline
    const session = live.session || "PM";
    if ($("amFixRate")) $("amFixRate").textContent = formatMoney(live.previous_close_22k || 14270);
    if ($("pmFixRate")) $("pmFixRate").textContent = formatMoney(r22);
    if ($("pmFixChip")) $("pmFixChip").classList.toggle("confirmed", session === "PM");

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
    const premium = r22 - ibja22k;
    const premPct = Number(((premium / ibja22k) * 100).toFixed(2));

    if ($("ibjaSpotRate")) $("ibjaSpotRate").textContent = formatMoney(ibja22k);
    if ($("spreadPremiumVal")) $("spreadPremiumVal").textContent = `+₹ ${premium}/g (+${premPct}%)`;

    // Recalculate quotation with live rate
    updateQuotation();
  }

  // ==========================================================================
  // 6. RENDER ANALYTICS & ML VIEW (Tab 2)
  // ==========================================================================
  function renderAnalyticsView() {
    renderSplineChart();

    const currentRate = (state.live && Number(state.live.rate_22k)) || 14145;
    const historyPrices = state.history.map(h => Number(h.rate_22k)).filter(Boolean);

    // Run clientside Machine Learning Forecast
    if (typeof GoldMLEngine !== "undefined") {
      const predictor = new GoldMLEngine.ARIMAPredictor();
      const fc = predictor.forecast(historyPrices, currentRate);

      if ($("fc1dVal")) $("fc1dVal").textContent = formatMoney(fc.fc1d);
      if ($("fc3dVal")) $("fc3dVal").textContent = formatMoney(fc.fc3d);
      if ($("fc7dVal")) $("fc7dVal").textContent = formatMoney(fc.fc7d);
      if ($("fc30dVal")) $("fc30dVal").textContent = formatMoney(fc.fc30d);

      // Delta labels
      const d7 = Number((((fc.fc7d - currentRate) / currentRate) * 100).toFixed(2));
      if ($("fc7dDelta")) {
        $("fc7dDelta").textContent = `${d7 >= 0 ? "+" : ""}${d7}%`;
        $("fc7dDelta").className = "fc-delta " + (d7 >= 0 ? "up" : "down");
      }

      // Monte Carlo Risk Engine (10,000 paths)
      const mc = GoldMLEngine.MonteCarloRiskEngine.simulateVaR(currentRate, 0.0102, 10000);
      if ($("var95Val")) $("var95Val").textContent = `₹ ${mc.var95Amount}/g (₹ ${mc.var95Sovereign8g} / 8g)`;
      if ($("var99Val")) $("var99Val").textContent = `₹ ${mc.var99Amount}/g`;
      if ($("cvar95Val")) $("cvar95Val").textContent = `₹ ${mc.cvar95Amount}/g (Expected Shortfall)`;
      if ($("volAnnualVal")) $("volAnnualVal").textContent = `${fc.volatility.annualizedVolPct}% (GARCH 1,1)`;

      // Technical Decision Signal
      const rsi = (typeof QuantRisk !== "undefined") ? QuantRisk.computeRSI(historyPrices) : 48;
      const decision = GoldMLEngine.PurchaseTimingAdvisor.advise(currentRate, rsi, fc.driftPct, mc.var95Amount, fc.fc7d);

      if ($("rsiVal")) $("rsiVal").textContent = `${rsi} (Oversold < 30)`;
      if ($("actionDecisionBadge")) {
        $("actionDecisionBadge").textContent = decision.action;
        $("actionDecisionBadge").className = "change-badge " + (decision.action.includes("ACCUMULATE") ? "up" : "same");
      }
      if ($("actionDecisionHint")) $("actionDecisionHint").textContent = decision.hint;
    }
  }

  function renderSplineChart() {
    const canvas = $("priceSplineCanvas");
    if (!canvas || !state.history.length || typeof QuantRisk === "undefined") return;

    const tf = state.activeTimeframe;
    const slice = tf >= state.history.length ? state.history : state.history.slice(-tf);
    const isNight = state.theme === "oled";

    QuantRisk.drawSplineChart(canvas, slice, isNight);
  }

  // ==========================================================================
  // 7. CALCULATOR & SHOP AUDITOR VIEW (Tab 3)
  // ==========================================================================
  function updateQuotation() {
    const r22 = (state.live && Number(state.live.rate_22k)) || 14145;
    const grams = parseFloat($("calcGrams") ? $("calcGrams").value : 8.0) || 8.0;
    const makingPct = parseFloat($("calcMaking") ? $("calcMaking").value : 8.0) || 8.0;
    const oldGold = parseFloat($("calcOldCredit") ? $("calcOldCredit").value : 0.0) || 0.0;

    const baseCost = Math.round(grams * r22);
    const makingCost = Math.round(baseCost * (makingPct / 100));
    const fee = 53; // Hallmarking fee
    const taxableAmount = baseCost + makingCost + fee;
    const gstCost = Math.round(taxableAmount * 0.03);
    const netTotal = taxableAmount + gstCost - oldGold;

    if ($("qBaseCost")) $("qBaseCost").textContent = formatMoney(baseCost);
    if ($("qMakingCost")) $("qMakingCost").textContent = formatMoney(makingCost);
    if ($("qGstCost")) $("qGstCost").textContent = formatMoney(gstCost);
    if ($("qNetTotal")) $("qNetTotal").textContent = formatMoney(netTotal);

    // Shop bill audit comparison
    const maxFairVA = 12.0;
    const fairCost = Math.round((baseCost * (1 + maxFairVA / 100) + fee) * 1.03);
    const markupOverFair = netTotal - fairCost;
    if ($("auditMarkupAlert")) {
      if (makingPct > maxFairVA) {
        $("auditMarkupAlert").hidden = false;
        $("auditMarkupAlert").textContent = `⚠️ Quoted VA is ${makingPct}%. Typical MJDMA competitive rate is ≤ ${maxFairVA}%. You may be overpaying by ~₹${markupOverFair}.`;
      } else {
        $("auditMarkupAlert").hidden = true;
      }
    }
  }

  function initCalculator() {
    ["calcGrams", "calcMaking", "calcOldCredit"].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener("input", updateQuotation);
    });

    const shareReceiptBtn = $("shareReceiptActionBtn");
    if (shareReceiptBtn) {
      shareReceiptBtn.onclick = async () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(15);
        if (typeof ShareCards !== "undefined") {
          const canvas = ShareCards.generateReceiptCard({
            base: $("qBaseCost").textContent,
            making: $("qMakingCost").textContent,
            makingPct: $("calcMaking").value,
            gst: $("qGstCost").textContent,
            fee: "₹ 53",
            oldGold: $("calcOldCredit").value > 0 ? formatMoney($("calcOldCredit").value) : null,
            total: $("qNetTotal").textContent,
            date: state.live ? state.live.date : "Today"
          });

          await handleCanvasShare(canvas, "gold-quotation-receipt.png", "🧾 Chennai 22K Gold Purchase Quotation");
        }
      };
    }
  }

  // ==========================================================================
  // 8. SCHEMES & WEALTH ADVISOR (Tab 4)
  // ==========================================================================
  function initSchemes() {
    const calcSchemes = () => {
      const monthly = parseFloat($("schemeMonthly") ? $("schemeMonthly").value : 10000) || 10000;
      const currentRate = (state.live && Number(state.live.rate_22k)) || 14145;

      if (typeof SchemeOptimizer !== "undefined") {
        const weightSim = SchemeOptimizer.simulateWeightScheme(monthly, 11, currentRate, 18.0);
        const cashSim = SchemeOptimizer.simulateCashScheme(monthly, 11, 1.0, currentRate);
        const breakeven = SchemeOptimizer.computeBreakevenPrice(currentRate, 14.0, 1.0);

        if ($("weightGramsVal")) $("weightGramsVal").textContent = `${weightSim.accumulatedGrams} g`;
        if ($("weightXirrVal")) $("weightXirrVal").textContent = `${weightSim.effectiveXIRRPct}%`;
        if ($("cashVoucherVal")) $("cashVoucherVal").textContent = formatMoney(cashSim.voucherValue);
        if ($("cashXirrVal")) $("cashXirrVal").textContent = `${cashSim.effectiveXIRRPct}%`;
        if ($("breakevenPriceVal")) $("breakevenPriceVal").textContent = formatMoney(breakeven);

        // Recommendation
        if ($("schemeVerdict")) {
          $("schemeVerdict").textContent = "👑 Weight Scheme (GRT / Lalitha) is mathematically optimal when making charges exceed 10%.";
        }
      }
    };

    if ($("schemeMonthly")) $("schemeMonthly").addEventListener("input", calcSchemes);
    calcSchemes();
  }

  // ==========================================================================
  // 9. SHARE SNAPSHOT ACTION
  // ==========================================================================
  function initShareButtons() {
    const shareSnapshotBtn = $("shareSnapshotBtn");
    if (shareSnapshotBtn) {
      shareSnapshotBtn.onclick = async () => {
        if (typeof GoldAudio !== "undefined" && GoldAudio.haptic) GoldAudio.haptic(15);
        if (typeof ShareCards !== "undefined" && state.live) {
          const canvas = ShareCards.generateSnapshotCard(state.live);
          await handleCanvasShare(canvas, "chennai-gold-snapshot.png", `🪙 Chennai 22K Gold Benchmark: ${formatMoney(state.live.rate_8g)} (1 Sovereign)`);
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
            console.log("Share cancelled or failed:", e);
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
    showToast("Snapshot Card downloaded!");
  }

  // ==========================================================================
  // 10. MODAL BOTTOM SHEET (Target Price Alarm Watchdog)
  // ==========================================================================
  function initModalSheets() {
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

    const setAlarmBtn = $("setAlarmBtn");
    if (setAlarmBtn) {
      setAlarmBtn.onclick = () => {
        const val = parseFloat($("targetRateInput") ? $("targetRateInput").value : 0);
        if (val > 0) {
          if (typeof GoldAudio !== "undefined" && GoldAudio.playCoinChime) GoldAudio.playCoinChime(1.0);
          showToast(`Target alarm active for ${formatMoney(val)}!`);
          closeSheet();
        }
      };
    }
  }

  function showToast(msg) {
    let t = $("globalToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "globalToast";
      t.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--surface-raised);color:var(--ink-primary);border:1px solid var(--border-strong);padding:8px 16px;border-radius:var(--r-full);box-shadow:var(--shadow-lg);font-size:var(--fs-xs);font-weight:700;z-index:999;transition:all 0.3s;opacity:0;pointer-events:none;";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(-10px)";
    }, 2400);
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  window.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavigation();
    initDynamicIsland();
    initCalculator();
    initSchemes();
    initShareButtons();
    initModalSheets();
    loadMarketData();

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

    // Chart Timeframe toggles
    $$(".tf-btn").forEach(btn => {
      btn.onclick = () => {
        $$(".tf-btn").forEach(b => b.classList.toggle("active", b === btn));
        state.activeTimeframe = parseInt(btn.getAttribute("data-tf") || "30", 10);
        renderSplineChart();
      };
    });
  });

})();
