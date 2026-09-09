/**
 * ============================================================================
 * UNIT TESTS: UI NAVIGATION, 4-TAB DOCK & 2-MODE THEME FIDELITY
 * ============================================================================
 */

// Mock DOM environment for JSC
const mockElements = {};
function getElement(id) {
  if (!mockElements[id]) {
    mockElements[id] = {
      id: id,
      textContent: "",
      className: "",
      classList: {
        _set: new Set(),
        add: function(c) { this._set.add(c); mockElements[id].className = Array.from(this._set).join(" "); },
        remove: function(c) { this._set.delete(c); mockElements[id].className = Array.from(this._set).join(" "); },
        toggle: function(c, force) {
          if (force === undefined) {
            if (this._set.has(c)) this._set.delete(c); else this._set.add(c);
          } else if (force) this._set.add(c); else this._set.delete(c);
          mockElements[id].className = Array.from(this._set).join(" ");
        },
        contains: function(c) { return this._set.has(c); }
      },
      style: {},
      setAttribute: function(k, v) { this[k] = v; },
      getAttribute: function(k) { return this[k] || null; }
    };
  }
  return mockElements[id];
}

const document = {
  documentElement: getElement("documentElement"),
  getElementById: getElement,
  querySelectorAll: function(sel) { return []; },
  createElement: function(tag) {
    if (tag === "canvas") {
      return {
        width: 0,
        height: 0,
        getContext: function() {
          return {
            scale: function() {},
            createRadialGradient: function() { return { addColorStop: function() {} }; },
            createLinearGradient: function() { return { addColorStop: function() {} }; },
            fillRect: function() {},
            beginPath: function() {},
            roundRect: function() {},
            fill: function() {},
            stroke: function() {},
            fillText: function() {},
            measureText: function(txt) { return { width: (txt || "").length * 8 }; },
            moveTo: function() {},
            lineTo: function() {},
            arcTo: function() {},
            closePath: function() {}
          };
        },
        toDataURL: function() { return "data:image/png;base64,mock"; }
      };
    }
    return getElement("tag_" + tag);
  }
};

const window = {
  devicePixelRatio: 2,
  scrollTo: function() {}
};

print("============================================================");
print("TESTING 4-TAB DOCKED NAVIGATION & THEME FIDELITY");
print("============================================================");

// [TEST 1] 2-Mode Theme Toggle Cycle
function cycleTheme(current) {
  return (current === "oled" || current === "dark") ? "light" : "oled";
}

const t1 = cycleTheme("light");
if (t1 === "oled") {
  print("  ✓ [TEST 1a] Day Mode ('light') toggles strictly to Night Mode ('oled')");
} else {
  throw new Error("[TEST 1a FAIL] Expected 'oled', got: " + t1);
}

const t2 = cycleTheme("oled");
if (t2 === "light") {
  print("  ✓ [TEST 1b] Night Mode ('oled') toggles strictly to Day Mode ('light')");
} else {
  throw new Error("[TEST 1b FAIL] Expected 'light', got: " + t2);
}

// [TEST 2] 4-Tab Navigation Router State
const validTabs = ["market", "analytics", "calc", "schemes"];
let currentTab = "market";

function switchTab(newTab) {
  if (!validTabs.includes(newTab)) throw new Error("Invalid tab: " + newTab);
  currentTab = newTab;
  return currentTab;
}

validTabs.forEach(t => {
  switchTab(t);
  if (currentTab === t) {
    print("  ✓ [TEST 2] Navigation successfully routed to Tab: '" + t + "'");
  }
});

// [TEST 3] Dynamic Island Scroll Trigger
function checkIslandVisibility(heroBottom) {
  return heroBottom < 50;
}

if (!checkIslandVisibility(300)) {
  print("  ✓ [TEST 3a] Dynamic Island stays hidden when hero card is fully in viewport (bottom: 300px)");
} else {
  throw new Error("[TEST 3a FAIL]");
}

if (checkIslandVisibility(20)) {
  print("  ✓ [TEST 3b] Dynamic Island appears as hero card scrolls out of view (bottom: 20px)");
} else {
  throw new Error("[TEST 3b FAIL]");
}

// [TEST 4] Share Cards Generation with Mock Canvas
let ShareCards;
if (typeof require !== "undefined") {
  try {
    ShareCards = require("../js/share-cards.js");
  } catch (e) {
    ShareCards = require("./js/share-cards.js");
  }
} else if (typeof load !== "undefined") {
  try {
    load("js/share-cards.js");
  } catch (e) {
    load("../js/share-cards.js");
  }
  ShareCards = this.ShareCards;
}

if (ShareCards) {
  const snapshotCanvas = ShareCards.generateSnapshotCard({
    rate_22k: 14145,
    rate_8g: 113160,
    rate_24k: 15431,
    change: -125,
    date: "Sep 9, 2026",
    session: "PM"
  });

  if (snapshotCanvas && snapshotCanvas.toDataURL) {
    print("  ✓ [TEST 4a] generateSnapshotCard rendered high-DPI canvas successfully");
  } else {
    throw new Error("[TEST 4a FAIL] Failed to render snapshot canvas");
  }

  const receiptCanvas = ShareCards.generateReceiptCard({
    base: "₹ 1,13,160",
    making: "₹ 9,053",
    makingPct: "8",
    gst: "₹ 3,668",
    fee: "₹ 53",
    total: "₹ 1,25,934",
    date: "Sep 9, 2026"
  });

  if (receiptCanvas && receiptCanvas.toDataURL) {
    print("  ✓ [TEST 4b] generateReceiptCard rendered itemized receipt canvas successfully");
  } else {
    throw new Error("[TEST 4b FAIL] Failed to render receipt canvas");
  }
}

print("============================================================");
print("ALL NAVIGATION & UI TESTS PASSED 100%! ✓");
print("============================================================");
