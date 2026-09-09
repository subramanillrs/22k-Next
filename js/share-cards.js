/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: HIGH-DPI DYNAMIC SHARE CARDS
 * Strict 2-Mode Fidelity: Day (Ivory/Espresso) & Night (OLED/#ffd700)
 * ============================================================================
 */

(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ShareCards = factory();
  }
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function formatMoney(n) {
    return "₹ " + Number(n).toLocaleString("en-IN");
  }

  function getActiveTheme() {
    if (typeof document === "undefined") return "day";
    const attr = (document.documentElement && document.documentElement.getAttribute && document.documentElement.getAttribute("data-theme") || "").toLowerCase();
    const saved = (typeof localStorage !== "undefined" && localStorage && localStorage.getItem ? localStorage.getItem("gold_theme_next") || "" : "").toLowerCase();
    const isNight = attr === "oled" || (!attr && saved === "oled");
    return isNight ? "night" : "day";
  }

  /**
   * Generates Market Snapshot Card (820 x 530)
   */
  function generateSnapshotCard(marketData = {}) {
    const isNight = getActiveTheme() === "night";
    const canvas = document.createElement("canvas");
    const W = 820;
    const H = 530;
    const dpr = Math.min(2, Math.max(1, (typeof window !== "undefined" && window.devicePixelRatio) || 1.5));

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // 1. Background
    const bgGrad = ctx.createRadialGradient(W / 2, 20, 10, W / 2, H / 2, W * 0.75);
    if (isNight) {
      bgGrad.addColorStop(0, "#121212");
      bgGrad.addColorStop(0.5, "#000000");
      bgGrad.addColorStop(1, "#000000");
    } else {
      bgGrad.addColorStop(0, "#ffffff");
      bgGrad.addColorStop(0.55, "#faf6ed");
      bgGrad.addColorStop(1, "#eee5d3");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Outer Border
    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.40)" : "rgba(169, 127, 52, 0.35)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, 16, 16, W - 32, H - 32, 20);
    ctx.stroke();

    if (isNight) {
      ctx.strokeStyle = "rgba(255, 215, 0, 0.12)";
      ctx.lineWidth = 1;
      roundRect(ctx, 22, 22, W - 44, H - 44, 16);
      ctx.stroke();
    }

    // 3. Header: Brand Badge (Au)
    const badgeGrad = ctx.createLinearGradient(36, 36, 74, 74);
    if (isNight) {
      badgeGrad.addColorStop(0, "#fff2a8");
      badgeGrad.addColorStop(0.5, "#ffd700");
      badgeGrad.addColorStop(1, "#b39200");
    } else {
      badgeGrad.addColorStop(0, "#f4dca0");
      badgeGrad.addColorStop(0.55, "#a97f34");
      badgeGrad.addColorStop(1, "#6b5223");
    }
    ctx.fillStyle = badgeGrad;
    roundRect(ctx, 36, 36, 38, 38, 9);
    ctx.fill();

    ctx.fillStyle = isNight ? "#000000" : "#ffffff";
    ctx.font = "bold 19px 'Fraunces', Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Au", 55, 55);

    // Title & Benchmark Info
    ctx.textAlign = "left";
    ctx.fillStyle = isNight ? "#ffffff" : "#1c1712";
    ctx.font = "italic 600 23px 'Fraunces', Georgia, serif";
    ctx.fillText("Chennai 22K Gold Terminal", 86, 49);

    ctx.fillStyle = isNight ? "#d4ab63" : "#6b6255";
    ctx.font = "500 12px 'Inter', -apple-system, sans-serif";
    ctx.fillText("Live MJDMA Official Benchmark · Institutional Feed", 86, 68);

    // Top Right Date Pill
    const dateStr = marketData.date || "Today";
    const sessionStr = marketData.session ? `${marketData.session} Fix` : "Official Fix";
    const pillText = `${dateStr} · ${sessionStr}`;

    ctx.font = "600 11.5px 'Inter', sans-serif";
    const pillW = ctx.measureText(pillText).width + 24;
    const pillX = W - 36 - pillW;

    ctx.fillStyle = isNight ? "rgba(255, 215, 0, 0.10)" : "rgba(169, 127, 52, 0.08)";
    roundRect(ctx, pillX, 39, pillW, 30, 15);
    ctx.fill();
    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.35)" : "rgba(169, 127, 52, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = isNight ? "#ffd700" : "#8a6627";
    ctx.textAlign = "center";
    ctx.fillText(pillText, pillX + pillW / 2, 55);

    // Header divider
    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.25)" : "rgba(169, 127, 52, 0.20)";
    ctx.beginPath();
    ctx.moveTo(36, 90);
    ctx.lineTo(W - 36, 90);
    ctx.stroke();

    // 4. Hero Sovereign Rate
    ctx.textAlign = "left";
    ctx.fillStyle = isNight ? "#ffd700" : "#a97f34";
    ctx.font = "italic 600 14px 'Fraunces', Georgia, serif";
    ctx.fillText("One sovereign, eight grams", 36, 122);

    const r8 = marketData.rate_8g || 113160;
    const r22 = marketData.rate_22k || 14145;
    const chg = marketData.change || -125;

    ctx.fillStyle = isNight ? "#ffffff" : "#1c1712";
    ctx.font = "bold 52px 'Fraunces', Georgia, serif";
    ctx.fillText(formatMoney(r8), 36, 175);

    // Change badge
    const isUp = chg > 0;
    const isDown = chg < 0;
    const chgText = isUp ? `▲ +₹ ${chg} Today` : (isDown ? `▼ -₹ ${Math.abs(chg)} Today` : "No change");

    ctx.font = "bold 13px 'Inter', sans-serif";
    const chgW = ctx.measureText(chgText).width + 24;
    const chgX = 36 + ctx.measureText(formatMoney(r8)).width + 18;
    const chgY = 142;

    if (isUp) {
      ctx.fillStyle = isNight ? "rgba(0, 230, 118, 0.16)" : "#e1efe4";
      ctx.strokeStyle = isNight ? "#00e676" : "#337a4c";
    } else if (isDown) {
      ctx.fillStyle = isNight ? "rgba(255, 82, 82, 0.16)" : "#f5e2df";
      ctx.strokeStyle = isNight ? "#ff5252" : "#ad3d30";
    } else {
      ctx.fillStyle = isNight ? "rgba(255, 255, 255, 0.08)" : "#f0eadb";
      ctx.strokeStyle = isNight ? "rgba(255, 255, 255, 0.20)" : "#cdbe9d";
    }
    roundRect(ctx, chgX, chgY, chgW, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isUp ? (isNight ? "#00e676" : "#337a4c") : isDown ? (isNight ? "#ff5252" : "#ad3d30") : (isNight ? "#a89d88" : "#6b6255");
    ctx.textAlign = "center";
    ctx.fillText(chgText, chgX + chgW / 2, chgY + 15);

    // Sub-bar
    ctx.textAlign = "left";
    ctx.font = "500 13px 'Inter', sans-serif";
    ctx.fillStyle = isNight ? "#a89d88" : "#6b6255";
    ctx.fillText("Rate per gram: ", 36, 206);
    ctx.fillStyle = isNight ? "#ffffff" : "#1c1712";
    ctx.font = "700 13px 'Inter', sans-serif";
    ctx.fillText(formatMoney(r22) + "/g", 134, 206);

    ctx.textAlign = "right";
    ctx.font = "500 12.5px 'Inter', sans-serif";
    ctx.fillStyle = isNight ? "#d4ab63" : "#8a6627";
    ctx.fillText("Official MJDMA Fix · Chennai Market", W - 36, 206);

    // 5. Purity Cards Grid
    const boxY = 224;
    const boxH = 155;
    const boxW = W - 72;
    ctx.fillStyle = isNight ? "rgba(14, 14, 14, 0.9)" : "rgba(255, 255, 255, 0.85)";
    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.20)" : "rgba(169, 127, 52, 0.22)";
    roundRect(ctx, 36, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();

    const colW = boxW / 3;
    const r24 = marketData.rate_24k || Math.round(r22 * (0.999 / 0.916));
    const r18 = Math.round(r22 * (0.750 / 0.916));

    const purities = [
      { title: "24K PURE GOLD", sub: "99.9% Fineness", val: formatMoney(r24) + "/g", desc: "Investment Standard" },
      { title: "22K SOVEREIGN", sub: "91.6% Standard", val: formatMoney(r22) + "/g", desc: "MJDMA Fix Benchmark", highlight: true },
      { title: "18K JEWELLERY", sub: "75.0% Fineness", val: formatMoney(r18) + "/g", desc: "Diamond Craft Standard" }
    ];

    purities.forEach((p, idx) => {
      const cx = 36 + idx * colW;
      if (p.highlight) {
        ctx.fillStyle = isNight ? "rgba(255, 215, 0, 0.12)" : "rgba(169, 127, 52, 0.09)";
        roundRect(ctx, cx + 5, boxY + 5, colW - 10, boxH - 10, 12);
        ctx.fill();
        ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.35)" : "rgba(169, 127, 52, 0.28)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (idx > 0) {
        ctx.strokeStyle = isNight ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.07)";
        ctx.beginPath();
        ctx.moveTo(cx, boxY + 14);
        ctx.lineTo(cx, boxY + boxH - 14);
        ctx.stroke();
      }

      ctx.textAlign = "center";
      ctx.fillStyle = p.highlight ? (isNight ? "#ffd700" : "#a97f34") : (isNight ? "#a89d88" : "#8a8174");
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.fillText(p.title, cx + colW / 2, boxY + 34);

      ctx.fillStyle = isNight ? "#777777" : "#a89d88";
      ctx.font = "500 10.5px 'Inter', sans-serif";
      ctx.fillText(p.sub, cx + colW / 2, boxY + 52);

      ctx.fillStyle = isNight ? "#ffffff" : "#1c1712";
      ctx.font = "bold 26px 'Fraunces', Georgia, serif";
      ctx.fillText(p.val, cx + colW / 2, boxY + 92);

      ctx.fillStyle = p.highlight ? (isNight ? "#ffd700" : "#6b5223") : (isNight ? "#a89d88" : "#8a8174");
      ctx.font = (p.highlight ? "600" : "500") + " 10.5px 'Inter', sans-serif";
      ctx.fillText(p.desc, cx + colW / 2, boxY + 124);
    });

    // 6. Regional Basis Parity Strip (Salem, Coimbatore, Madurai)
    const salemRate = formatMoney(r22 - 10);
    const cbeRate = formatMoney(r22 - 15);
    const madRate = formatMoney(r22 + 15);

    const stripY = 394;
    ctx.fillStyle = isNight ? "rgba(255, 215, 0, 0.08)" : "rgba(169, 127, 52, 0.06)";
    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.22)" : "rgba(169, 127, 52, 0.18)";
    roundRect(ctx, 36, stripY, boxW, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "600 12px 'Inter', sans-serif";
    ctx.fillStyle = isNight ? "#ffd700" : "#6b5223";
    ctx.fillText(`Regional Parity: Salem ${salemRate} (-₹10)  ·  Coimbatore ${cbeRate} (-₹15)  ·  Madurai ${madRate} (+₹15)`, W / 2, stripY + 24);

    // 7. Footer
    ctx.textAlign = "left";
    ctx.fillStyle = isNight ? "#666666" : "#a89d88";
    ctx.font = "500 11px 'Inter', sans-serif";
    ctx.fillText("Official MJDMA Terminal · Madras Jewellers & Diamond Merchants Association", 36, 480);

    ctx.textAlign = "right";
    ctx.fillText("gold22k · Verified Consensus", W - 36, 480);

    return canvas;
  }

  /**
   * Generates Itemized Quotation Receipt Card (720 x 640)
   */
  function generateReceiptCard(receiptData = {}) {
    const isNight = getActiveTheme() === "night";
    const canvas = document.createElement("canvas");
    const W = 720;
    const H = 640;
    const dpr = Math.min(2, Math.max(1, (typeof window !== "undefined" && window.devicePixelRatio) || 1.5));

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const bgGrad = ctx.createRadialGradient(W / 2, 40, 20, W / 2, H / 2, W * 0.85);
    if (isNight) {
      bgGrad.addColorStop(0, "#121212");
      bgGrad.addColorStop(0.5, "#000000");
      bgGrad.addColorStop(1, "#000000");
    } else {
      bgGrad.addColorStop(0, "#ffffff");
      bgGrad.addColorStop(0.55, "#faf6ed");
      bgGrad.addColorStop(1, "#eee5d3");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.40)" : "rgba(169, 127, 52, 0.35)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, 16, 16, W - 32, H - 32, 20);
    ctx.stroke();

    if (isNight) {
      ctx.strokeStyle = "rgba(255, 215, 0, 0.14)";
      ctx.lineWidth = 1;
      roundRect(ctx, 22, 22, W - 44, H - 44, 16);
      ctx.stroke();
    }

    // Brand badge
    const badgeGrad = ctx.createLinearGradient(36, 36, 74, 74);
    if (isNight) {
      badgeGrad.addColorStop(0, "#fff2a8");
      badgeGrad.addColorStop(0.5, "#ffd700");
      badgeGrad.addColorStop(1, "#b39200");
    } else {
      badgeGrad.addColorStop(0, "#f4dca0");
      badgeGrad.addColorStop(0.55, "#a97f34");
      badgeGrad.addColorStop(1, "#6b5223");
    }
    ctx.fillStyle = badgeGrad;
    roundRect(ctx, 36, 36, 38, 38, 9);
    ctx.fill();

    ctx.fillStyle = isNight ? "#000000" : "#ffffff";
    ctx.font = "bold 19px 'Fraunces', Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Au", 55, 55);

    // Header
    ctx.textAlign = "left";
    ctx.fillStyle = isNight ? "#ffffff" : "#1c1712";
    ctx.font = "italic 600 22px 'Fraunces', Georgia, serif";
    ctx.fillText("Purchase Quotation", 86, 49);

    ctx.fillStyle = isNight ? "#d4ab63" : "#6b6255";
    ctx.font = "500 12px 'Inter', sans-serif";
    ctx.fillText("Chennai 22K Gold · Itemized Estimate", 86, 68);

    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.22)" : "rgba(28, 23, 18, 0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, 96);
    ctx.lineTo(W - 36, 96);
    ctx.stroke();

    const lines = [
      ["Base 22K Gold Cost", receiptData.base || "₹ 0"],
      [`Making Charges (${receiptData.makingPct || "8"}%)`, receiptData.making || "₹ 0"],
      ["GST (3%)", receiptData.gst || "₹ 0"],
      ["Hallmarking / Flat Fees", receiptData.fee || "₹ 0"],
    ];
    if (receiptData.oldGold) {
      lines.push(["Old Gold Exchange Credit", `-${receiptData.oldGold}`]);
    }

    const boxY = 114;
    const boxH = 34 * lines.length + 22;
    ctx.fillStyle = isNight ? "rgba(14, 14, 14, 0.85)" : "rgba(255, 255, 255, 0.85)";
    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.20)" : "rgba(169, 127, 52, 0.20)";
    ctx.lineWidth = 1;
    roundRect(ctx, 36, boxY, W - 72, boxH, 14);
    ctx.fill();
    ctx.stroke();

    let y = boxY + 28;
    ctx.font = "500 15px 'Inter', sans-serif";
    lines.forEach(([label, val]) => {
      const isCredit = label.includes("Credit");
      ctx.fillStyle = isNight ? "#a89d88" : "#6b6255";
      ctx.textAlign = "left";
      ctx.fillText(label, 52, y);
      ctx.fillStyle = isCredit ? (isNight ? "#00e676" : "#2d7a48") : (isNight ? "#ffffff" : "#1c1712");
      ctx.font = "600 15px 'Inter', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(val, W - 52, y);
      ctx.font = "500 15px 'Inter', sans-serif";
      y += 34;
    });

    // Total Card Box
    const totalY = boxY + boxH + 16;
    ctx.fillStyle = isNight ? "rgba(255, 215, 0, 0.12)" : "rgba(169, 127, 52, 0.08)";
    ctx.strokeStyle = isNight ? "rgba(255, 215, 0, 0.40)" : "rgba(169, 127, 52, 0.30)";
    ctx.lineWidth = 1;
    roundRect(ctx, 36, totalY, W - 72, 86, 14);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "600 14px 'Inter', sans-serif";
    ctx.fillStyle = isNight ? "#ffd700" : "#8a6627";
    ctx.fillText("Net Payable Amount", 56, totalY + 36);

    ctx.textAlign = "right";
    ctx.font = "700 36px 'Fraunces', Georgia, serif";
    ctx.fillStyle = isNight ? "#ffd700" : "#6b5223";
    ctx.fillText(receiptData.total || "₹ —", W - 56, totalY + 54);

    // Subtitle & Date
    const footY = totalY + 116;
    ctx.textAlign = "left";
    ctx.font = "500 12px 'Inter', sans-serif";
    ctx.fillStyle = isNight ? "#a89d88" : "#8a8174";
    ctx.fillText("Based on live 22K rate · Official MJDMA Fix", 36, footY);

    ctx.textAlign = "right";
    ctx.fillStyle = isNight ? "#d4ab63" : "#6b5223";
    ctx.fillText(receiptData.date || "Today", W - 36, footY);

    ctx.textAlign = "center";
    ctx.font = "500 11px 'Inter', sans-serif";
    ctx.fillStyle = isNight ? "#666666" : "#a89d88";
    ctx.fillText("Chennai 22K Gold · Institutional Terminal Benchmark", W / 2, H - 24);

    return canvas;
  }

  return {
    generateSnapshotCard,
    generateReceiptCard
  };
});
