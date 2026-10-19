if (typeof print !== "function") var print = console.log;
const tools = typeof load === "function"
  ? (load("js/local-tools.js"), this.GoldLocalTools)
  : require("../js/local-tools.js");

print("============================================================");
print("TESTING LOCAL PRESETS & PORTFOLIO BACKUP VALIDATION");
print("============================================================");
if (!tools) throw new Error("GoldLocalTools did not load");

if (!tools.validDate("2024-02-29") || tools.validDate("2025-02-29") || tools.validDate("2026-02-31")) {
  throw new Error("Date validation accepted an impossible calendar date");
}
print("  ✓ Validates real calendar dates including leap years");

const proBackup = JSON.stringify({
  format: "22k-pro-portfolio",
  version: 1,
  lots: [
    { id: "old-lot", date: "2026-01-10", weight: 8, rate: 12000, note: "Festival" },
    { date: "2026-01-10", weight: 0, rate: 12000, note: "invalid" }
  ]
});
const imported = tools.parsePortfolioBackup(proBackup, proBackup.length);
if (imported.lots.length !== 1 || imported.skippedCount !== 1 || imported.lots[0].weight !== 8) {
  throw new Error("Pro backup import validation failed");
}
print("  ✓ Reads compatible 22k-Pro backups and skips invalid lots");

const existing = [{ id: "keep", date: "2026-01-10", weight: 8, rate: 12000, note: "Festival" }];
const merged = tools.mergePortfolioLots(existing, [
  { id: "duplicate", date: "2026-01-10", weight: 8, rate: 12000, note: "Festival" },
  { id: "new", date: "2026-02-01", weight: 4, rate: 12500, note: "New lot" }
]);
if (merged.addedCount !== 1 || merged.lots.length !== 2 || merged.lots[0].id !== "keep") {
  throw new Error("Import must merge and deduplicate without replacing existing lots");
}
print("  ✓ Import merges new lots, deduplicates, and preserves existing records");

let rejectedLarge = false;
try { tools.parsePortfolioBackup("[]", tools.MAX_BACKUP_BYTES + 1); } catch (_) { rejectedLarge = true; }
if (!rejectedLarge) throw new Error("Oversized backup was accepted");
print("  ✓ Rejects backups over the 500 KB limit");

const safe = tools.escapeHtml('<img src=x onerror="run()">');
if (safe !== "&lt;img src=x onerror=&quot;run()&quot;&gt;") throw new Error("HTML escaping failed");
print("  ✓ Escapes imported notes before inserting them into a table");

const presets = tools.normalizeCalculatorPresets([
  { name: "  Sov  ", values: { calcMode: "bad", weight: 8, oldPurity: "99", ignored: "x" } },
  { name: "", values: {} },
  null
]);
if (presets.length !== 1 || presets[0].name !== "Sov" || presets[0].values.calcMode !== "value" || presets[0].values.ignored !== undefined) {
  throw new Error("Calculator preset normalization failed");
}
print("  ✓ Normalizes saved setups and limits them to known calculator fields");

print("============================================================");
print("ALL LOCAL TOOL TESTS PASSED 100%! ✓");
print("============================================================");
