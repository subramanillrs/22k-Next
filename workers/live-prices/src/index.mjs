const LIVECHENNAI_URL = "https://www.livechennai.com/gold_silverrate.asp";
const GOODRETURNS_URL = "https://www.goodreturns.in/gold-rates/chennai.html";
const MIN_RATE = 5000;
const MAX_RATE = 50000;

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(?:8377|x20b9);/gi, "₹")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function textFromHtml(html) {
  return decodeHtml(String(html || "").replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function cellsFromRow(row) {
  return [...row.matchAll(/<(?:td|th)\b([^>]*)>([\s\S]*?)<\/(?:td|th)\s*>/gi)].map(match => ({
    text: textFromHtml(match[2]),
    colspan: Math.max(1, Number(match[1].match(/\bcolspan\s*=\s*["']?(\d+)/i)?.[1] || 1)),
  }));
}

function rowsFromTable(table) {
  return [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)].map(match => cellsFromRow(match[1]));
}

function isValidRate(value) {
  const rate = Number(value);
  return Number.isInteger(rate) && rate >= MIN_RATE && rate <= MAX_RATE;
}

function parseRate(text) {
  const numbers = String(text || "").match(/[\d,]+/g) || [];
  for (const candidate of numbers) {
    const value = Number(candidate.replace(/,/g, ""));
    if (isValidRate(value)) return value;
  }
  return null;
}

export function extractLiveChennai(html) {
  const tables = [...String(html || "").matchAll(/<table\b[^>]*>([\s\S]*?)<\/table\s*>/gi)];
  for (const tableMatch of tables) {
    const rows = rowsFromTable(tableMatch[1]);
    if (rows.length < 3) continue;
    const expand = row => row.flatMap(cell => Array(cell.colspan).fill(cell.text.toLowerCase()));
    const top = expand(rows[0]);
    let sub = expand(rows[1]);
    if (top.length > sub.length) sub = [...Array(top.length - sub.length).fill(""), ...sub];
    let col22 = -1;
    let col24 = -1;
    let col8g = -1;
    for (let i = 0; i < Math.min(top.length, sub.length); i++) {
      if ((top[i].includes("22") || top[i].includes("standard")) && !top[i].includes("24")) {
        if (sub[i].includes("8")) col8g = i;
        else if (sub[i].includes("1")) col22 = i;
      } else if ((top[i].includes("24") || top[i].includes("pure")) && !top[i].includes("22") && sub[i].includes("1")) {
        col24 = i;
      }
    }
    if (col22 < 0) continue;
    for (const row of rows.slice(2)) {
      const rate22 = parseRate(row[col22]?.text);
      if (!rate22) continue;
      const rate24 = parseRate(row[col24]?.text);
      const rate8g = Number((row[col8g]?.text || "").replace(/[^\d]/g, ""));
      return {
        rate_22k: rate22,
        rate_24k: isValidRate(rate24) ? rate24 : null,
        rate_8g: Number.isInteger(rate8g) && rate8g >= 40000 && rate8g <= 500000 ? rate8g : rate22 * 8,
      };
    }
  }

  const pageText = textFromHtml(html);
  const patterns = [
    /Today's?\s+22\s*K\s*(?:Rate|Gold)?[^\d]{0,30}(?:₹|Rs\.?|INR)?\s*([\d,]+)/i,
    /22\s*K(?:arat|orat)?\s*(?:\(1\s*g\)|1\s*gm?|1\s*gram|Gold|Rate)?[^\d]{0,30}(?:₹|Rs\.?|INR)?\s*([\d,]+)/i,
    /22\s*Carat\s+gold\s+rate[^\d]{0,30}(?:₹|Rs\.?|INR)?\s*([\d,]+)/i,
  ];
  for (const pattern of patterns) {
    const match = pageText.match(pattern);
    const rate = match && parseRate(match[1]);
    if (rate) return { rate_22k: rate, rate_24k: null, rate_8g: rate * 8 };
  }
  return null;
}

export function extractGoodReturns(html) {
  const tables = [...String(html || "").matchAll(/<table\b[^>]*>([\s\S]*?)<\/table\s*>/gi)];
  for (const tableMatch of tables) {
    const rows = rowsFromTable(tableMatch[1]);
    if (rows.length < 2) continue;
    const header = rows[0].map(cell => cell.text.toLowerCase());
    const column = header.findIndex(value => value.includes("22") && !value.includes("24") && !value.includes("18"));
    if (column < 0) continue;
    for (const row of rows.slice(1)) {
      const label = (row[0]?.text || "").toLowerCase().replace(/\s+/g, "");
      if (!["1", "1g", "1gm", "1gram"].includes(label)) continue;
      const rate = parseRate(row[column]?.text);
      if (rate) return rate;
    }
  }

  const pageText = textFromHtml(html);
  const patterns = [
    /22\s*K\s+Gold\s*\/\s*g[^\d]{0,30}(?:₹|Rs\.?|INR)?\s*([\d,]+)/i,
    /22\s*(?:K|Carat|Karat)\s*Gold[^\d]{0,50}(?:₹|Rs\.?|INR)?\s*([\d,]+)/i,
  ];
  for (const pattern of patterns) {
    const match = pageText.match(pattern);
    const rate = match && parseRate(match[1]);
    if (rate) return rate;
  }
  return null;
}

function istParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function agreementTolerance(rate) {
  return Math.max(200, Math.round(rate * 0.015));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "ChennaiGoldRateMonitor/1.0 (+price freshness checker)", "Accept": "text/html" },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  return response.text();
}

export async function runCheck(env, now = new Date()) {
  const key = "latest";
  const previous = await env.LIVE_PRICE_KV.get(key, "json");
  const checkedAt = now.toISOString();
  const p = istParts(now);
  const date = `${p.year}-${p.month}-${p.day}`;
  const time = `${p.hour}:${p.minute}:${p.second}`;

  const results = await Promise.allSettled([
    fetchText(LIVECHENNAI_URL).then(html => extractLiveChennai(html)),
    fetchText(GOODRETURNS_URL).then(html => extractGoodReturns(html)),
  ]);
  const live = results[0].status === "fulfilled" ? results[0].value : null;
  const good = results[1].status === "fulfilled" ? results[1].value : null;
  const sources = {
    livechennai: { source: "LiveChennai", rate_22k: live?.rate_22k ?? null, url: LIVECHENNAI_URL, fetched_at: checkedAt },
    goodreturns: { source: "GoodReturns", rate_22k: good ?? null, url: GOODRETURNS_URL, fetched_at: checkedAt },
  };
  const rates = [live?.rate_22k, good].filter(Number.isFinite);
  const base = previous || {};

  if (live && good && Math.abs(live.rate_22k - good) <= agreementTolerance(live.rate_22k)) {
    const oldRate = isValidRate(base.rate_22k) ? Number(base.rate_22k) : null;
    const changed = oldRate !== live.rate_22k;
    const result = {
      ...base,
      schema_version: 1,
      verification_status: "confirmed",
      rate_22k: live.rate_22k,
      rate_24k: live.rate_24k || Math.round(live.rate_22k * 24 / 22),
      rate_8g: live.rate_8g || live.rate_22k * 8,
      currency: "INR",
      city: "Chennai",
      purity: "22K",
      date: changed ? date : (base.date || date),
      time: changed ? time : (base.time || time),
      timestamp: checkedAt,
      source_observed_at: checkedAt,
      rate_changed_observed_at: changed ? checkedAt : (base.rate_changed_observed_at || checkedAt),
      last_checked_at: checkedAt,
      changed,
      previous_rate_22k: changed && oldRate !== null
        ? oldRate
        : (isValidRate(base.previous_rate_22k) ? Number(base.previous_rate_22k) : (oldRate ?? live.rate_22k)),
      change: changed && oldRate !== null
        ? live.rate_22k - oldRate
        : (Number.isFinite(Number(base.change)) ? Number(base.change) : 0),
      sources,
      source_rates: rates,
      sources_agree: true,
      agreement: true,
      source: "LiveChennai + GoodReturns (verified)",
      source_update_times: [checkedAt, checkedAt],
    };
    await env.LIVE_PRICE_KV.put(key, JSON.stringify(result));
    return result;
  }

  const result = {
    ...base,
    schema_version: 1,
    verification_status: rates.length ? "pending" : "unavailable",
    last_checked_at: checkedAt,
    source_observed_at: checkedAt,
    sources,
    source_rates: rates,
    sources_agree: false,
    agreement: false,
    warning: rates.length ? "Source prices differ; keeping the last confirmed price." : "No fresh valid price was available; keeping the last confirmed price.",
  };
  await env.LIVE_PRICE_KV.put(key, JSON.stringify(result));
  return result;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cache-Control",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Cache-Control",
        "Access-Control-Max-Age": "86400",
      },
    });
    if (request.method !== "GET" || url.pathname !== "/live") return jsonResponse({ error: "Not found" }, 404);
    const latest = await env.LIVE_PRICE_KV.get("latest", "json");
    return latest ? jsonResponse(latest) : jsonResponse({ verification_status: "unavailable", error: "No source check completed yet" }, 503);
  },
  async scheduled(_controller, env) {
    await runCheck(env);
  },
};
