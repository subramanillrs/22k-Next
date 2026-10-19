/* Safe local-only backup and calculator preset helpers. */
(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GoldLocalTools = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  "use strict";

  const MAX_BACKUP_BYTES = 512000;
  const MAX_LOTS = 500;
  const CALC_FIELDS = ["calcMode", "weight", "budget", "making", "gstRate", "flatFee", "oldWeight", "oldPurity"];

  function validDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return false;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  function cleanLot(lot) {
    if (!lot || typeof lot !== "object") return null;
    const weight = Number(lot.weight), rate = Number(lot.rate);
    if (!validDate(lot.date) || !Number.isFinite(weight) || weight <= 0 || weight > 10000 || !Number.isFinite(rate) || rate <= 0 || rate > 10000000) return null;
    const note = String(lot.note || "Purchase lot").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 80) || "Purchase lot";
    const createdAt = typeof lot.createdAt === "string" && Number.isFinite(Date.parse(lot.createdAt)) ? lot.createdAt : new Date().toISOString();
    return {
      id: String(lot.id || "").slice(0, 64) || makeId(),
      date: String(lot.date),
      weight,
      rate,
      note,
      createdAt
    };
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function fingerprint(lot) {
    return [lot.date, Number(lot.weight), Number(lot.rate), String(lot.note || "")].join("|");
  }

  function parsePortfolioBackup(text, fileSize) {
    if (Number(fileSize) > MAX_BACKUP_BYTES) throw new Error("Backup is too large (maximum 500 KB)");
    let parsed;
    try { parsed = JSON.parse(String(text)); } catch (_) { throw new Error("This backup is not valid JSON"); }
    let source;
    if (Array.isArray(parsed)) source = parsed;
    else if (parsed && parsed.version === 1 && ["22k-next-portfolio", "22k-pro-portfolio"].includes(parsed.format)) source = parsed.lots;
    if (!Array.isArray(source) || source.length > MAX_LOTS) throw new Error("This is not a supported portfolio backup (up to 500 lots)");
    const lots = source.map(cleanLot).filter(Boolean);
    if (!lots.length) throw new Error("No valid purchase lots found in this backup");
    return { lots, skippedCount: source.length - lots.length };
  }

  function mergePortfolioLots(existing, incoming) {
    const lots = (Array.isArray(existing) ? existing : []).map(cleanLot).filter(Boolean);
    const known = new Set(lots.map(fingerprint));
    let addedCount = 0;
    (Array.isArray(incoming) ? incoming : []).forEach(item => {
      const lot = cleanLot(item);
      if (!lot) return;
      const key = fingerprint(lot);
      if (known.has(key)) return;
      if (lots.length >= MAX_LOTS) throw new Error("Portfolio limit reached (500 lots). Export a backup before adding more.");
      known.add(key);
      lots.push(lot);
      addedCount += 1;
    });
    return { lots, addedCount };
  }

  function normalizeCalculatorPresets(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 30).map(item => {
      if (!item || typeof item.name !== "string" || !item.values || typeof item.values !== "object") return null;
      const name = item.name.trim().slice(0, 32);
      if (!name) return null;
      const values = {};
      CALC_FIELDS.forEach(key => {
        if (item.values[key] !== undefined) values[key] = String(item.values[key]).slice(0, 32);
      });
      if (values.calcMode && !["value", "grams"].includes(values.calcMode)) values.calcMode = "value";
      if (values.oldPurity && !["18", "20", "22", "24"].includes(values.oldPurity)) values.oldPurity = "22";
      return { name, values };
    }).filter(Boolean);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  return { MAX_BACKUP_BYTES, MAX_LOTS, CALC_FIELDS, validDate, cleanLot, parsePortfolioBackup, mergePortfolioLots, normalizeCalculatorPresets, escapeHtml };
});
