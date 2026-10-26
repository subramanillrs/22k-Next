import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker, { extractGoodReturns, extractLiveChennai, runCheck } from "../workers/live-prices/src/index.mjs";

const liveChennai = `
  <table><tr><th rowspan="2">Date</th><th colspan="2">Pure Gold (24 k)</th><th colspan="2">Standard Gold (22 K)</th></tr>
  <tr><th>1 Gm</th><th>8 Gm</th><th>1 Gm</th><th>8 Gm</th></tr>
  <tr><td>18 Oct</td><td>15,100</td><td>120,800</td><td>13,880</td><td>111,040</td></tr></table>`;
const goodReturns = `
  <table><tr><th>Gram</th><th>24K</th><th>22K</th><th>18K</th></tr>
  <tr><td>1</td><td>15,100</td><td>13,880</td><td>11,340</td></tr></table>`;

assert.deepEqual(extractLiveChennai(liveChennai), { rate_22k: 13880, rate_24k: 15100, rate_8g: 111040 });
assert.equal(extractGoodReturns(goodReturns), 13880);
assert.equal(extractGoodReturns(`<table><tr><th>Gram</th><th>22K</th></tr><tr><td>8</td><td>110000</td></tr></table>`), null);

const workerConfig = await readFile(new URL("../workers/live-prices/wrangler.jsonc", import.meta.url), "utf8");
assert.match(workerConfig, /"\*\/3 2-6 \* \* \*"/);
assert.match(workerConfig, /"\*\/3 10-16 \* \* \*"/);
assert.match(workerConfig, /"0 0,1,7-9,17-23 \* \* \*"/);
const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert.ok(indexHtml.indexOf("live-price-config.js") < indexHtml.indexOf("js/app.js"), "Worker URL config loads before app logic");
const appJs = await readFile(new URL("../js/app.js", import.meta.url), "utf8");
assert.match(appJs, /LIVE_DATA_POLL_INTERVAL_MS = 60_000/);
const workflow = await readFile(new URL("../.github/workflows/main.yml", import.meta.url), "utf8");
assert.match(workflow, /cron: "\*\/5 2-6 \* \* \*"/, "GitHub's five-minute pipeline remains as fallback");

const writes = new Map();
const env = { LIVE_PRICE_KV: {
  async get(key) { return writes.has(key) ? JSON.parse(writes.get(key)) : null; },
  async put(key, value) { writes.set(key, value); },
} };
const originalFetch = globalThis.fetch;
globalThis.fetch = async url => ({
  ok: true,
  status: 200,
  async text() { return String(url).includes("livechennai") ? liveChennai : goodReturns; },
});
try {
  const confirmed = await runCheck(env, new Date("2026-10-18T06:00:00.000Z"));
  assert.equal(confirmed.verification_status, "confirmed");
  assert.equal(confirmed.rate_22k, 13880);
  assert.equal(confirmed.rate_8g, 111040);

  globalThis.fetch = async url => ({
    ok: true, status: 200,
    async text() { return String(url).includes("livechennai") ? liveChennai.replace("13,880", "14,100") : goodReturns.replace("13,880", "14,100"); },
  });
  const changed = await runCheck(env, new Date("2026-10-18T06:01:00.000Z"));
  assert.equal(changed.verification_status, "confirmed");
  assert.equal(changed.rate_22k, 14100);
  assert.equal(changed.change, 220);
  assert.equal(changed.previous_rate_22k, 13880);

  const stable = await runCheck(env, new Date("2026-10-18T06:02:00.000Z"));
  assert.equal(stable.changed, false);
  assert.equal(stable.change, 220, "the last fix delta remains visible between polling runs");
  assert.equal(stable.previous_rate_22k, 13880);

  globalThis.fetch = async url => ({
    ok: true, status: 200,
    async text() { return String(url).includes("livechennai") ? liveChennai.replace("13,880", "14,500") : goodReturns.replace("13,880", "14,100"); },
  });
  const pending = await runCheck(env, new Date("2026-10-18T06:03:00.000Z"));
  assert.equal(pending.verification_status, "pending");
  assert.equal(pending.rate_22k, 14100, "unverified source changes must not replace the last confirmed rate");

  globalThis.fetch = async () => ({ ok: false, status: 503, async text() { return "temporarily unavailable"; } });
  const unavailable = await runCheck(env, new Date("2026-10-18T06:04:00.000Z"));
  assert.equal(unavailable.verification_status, "unavailable");
  assert.equal(unavailable.rate_22k, 14100, "source outages must retain the last confirmed rate");
} finally {
  globalThis.fetch = originalFetch;
}

const request = new Request("https://worker.example/live");
writes.set("latest", JSON.stringify({
  rate_22k: 14100,
  verification_status: "confirmed",
  last_checked_at: new Date().toISOString(),
}));
const freshResponse = await worker.fetch(request, env);
assert.equal(freshResponse.status, 200);
assert.equal((await freshResponse.json()).verification_status, "confirmed");

writes.set("latest", JSON.stringify({
  rate_22k: 14100,
  verification_status: "confirmed",
  last_checked_at: new Date(Date.now() - 6 * 60_000).toISOString(),
}));
const staleResponse = await worker.fetch(request, env);
const stalePayload = await staleResponse.json();
assert.equal(staleResponse.status, 200);
assert.equal(stalePayload.verification_status, "unavailable");
assert.equal(stalePayload.rate_22k, 14100, "stale checks must preserve the last confirmed rate without claiming freshness");

writes.set("latest", JSON.stringify({ rate_22k: 1, last_checked_at: new Date().toISOString() }));
assert.equal((await worker.fetch(request, env)).status, 503, "invalid cached values must not be served as a market quote");

console.log("Live price Worker parser and confirmation tests passed.");
