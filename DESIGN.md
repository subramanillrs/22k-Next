---
version: alpha
name: Chennai 22K Gold Terminal Next
description: A calm, high-precision Chennai gold-market terminal for live fixes, risk analysis, jewellery estimates, and local holdings.
colors:
  primary: "#211d17"
  secondary: "#5e584d"
  background: "#f3f0e8"
  surface: "#fffefa"
  accent: "#946b24"
  nightBackground: "#050505"
  nightAccent: "#f0c95e"
  success: "#28633c"
  danger: "#a23c31"
typography:
  display:
    fontFamily: "Fraunces, Iowan Old Style, Georgia, serif"
  sans:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
rounded:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  full: "9999px"
spacing:
  page-max: "1160px"
  mobile-gutter: "14px"
  section-gap: "16px"
components:
  masthead:
    owner: "css/upgrade.css"
    treatment: "Steady ink-dark ledger header; brand, feed age, language, refresh, alert, and theme actions."
  price-card:
    owner: "css/upgrade.css"
    treatment: "Ink-dark sovereign quote, per-gram rate, change, and market timestamp."
  navigation:
    owner: "css/upgrade.css"
    treatment: "Persistent four-destination dock: Market, Analytics, Calculator, Schemes."
  data-cards: "Bento surfaces for fixes, purity, Chennai basis, and regional comparisons."
  controls: "Shared gold-accent fields, segmented modes, and quick-value chips."
  feedback: "App-owned short toast; feed age and stale-price states remain visible in the masthead."
---

# Chennai 22K Gold Terminal Next

## Overview

### Creative North Star

An Indian bullion desk translated into a compact mobile instrument: quiet ivory paper by day, pitch-black OLED glass by night, with restrained hallmark-gold accents. The key moment is the eight-gram sovereign quote; every other panel supports a decision around that benchmark.

### Product context and register

- **Audience and primary job:** Chennai gold buyers and market watchers checking the MJDMA fix, comparing trends and local spreads, estimating jewellery bills, and tracking personal holdings.
- **Target market(s) and evidence:** Chennai and Tamil Nadu; established by the product name, MJDMA/Chennai source fields, and regional hub data in `README.md`, `index.html`, and `data/`.
- **Locale(s) and language policy:** English is the full product language. Tamil is an optional, device-local translation for navigation and common calculator/portfolio controls; specialist market labels and quantitative explanations may remain English.
- **Usage scene:** Frequent, glanceable checks on mobile Safari; also usable in a desktop browser. Prices are time-sensitive, so source time and stale status matter more than decorative animation.
- **Register:** A practical market instrument with a premium Chennai-jewellery character; not a brokerage or a consumer-shopping storefront.
- **Memorable signature:** The large one-sovereign price paired with a timestamped AM/PM fix timeline.
- **Restraint:** Preserve the four-tab dock and existing quantitative density; use gold only for the benchmark, selected state, and small directional cues.
- **Anti-references:** Generic crypto dashboards, neon trading charts, and luxury-commerce product pages; they overstate speculative authority or obscure the actual local fix.
- **Token ownership/runtime mapping:** `css/design-system.css` is the canonical runtime source. This document mirrors its tokens; `css/upgrade.css` contains component-level refinements. Update this file when canonical values change.

## Colors

Day mode uses warm paper `--bg-canvas: #f3f0e8`, raised `#fffefa` surfaces, espresso `--ink-primary: #211d17`, and legible muted brown text. The dark ledger masthead and hero use `#211d17` with off-white text. `--gold-primary: #946b24` is reserved for the benchmark and active controls. Up/down states use green `#28633c` and brick `#a23c31`; direction is also expressed with text or symbols. OLED mode stays near-black with `#f0c95e` gold and warm white foreground. Focus uses a visible gold ring; selection uses the active gold token. Charts expose period/high/low values in stable text summaries; no floating price tooltip or callout is used.

## Typography

Fraunces is used for the hero price and selected editorial accents; Inter/system sans handles controls and dense information. Prices use tabular numerals and Indian grouping. Small labels are uppercase only when they identify data categories, not sentences. The system sans fallback supports Tamil script; controls use 16px or larger on narrow touch screens to avoid iOS focus zoom.

## Layout

The experience is mobile-first, with 14px mobile gutters and a 1160px maximum content width on larger screens. A steady masthead anchors feed status and actions; the four-item dock remains reachable at the bottom with safe-area padding. Market content leads with the sovereign hero and recorded daily range, followed by fix, purity, and local-basis cards in a calm two-column ledger grid. Analytics retains a large chart and a bounded history table. Calculator and scheme content scroll naturally; no shared shell traps long forms in a fixed-height viewport.

## Elevation & Depth

Hierarchy comes from paper/ink contrast, quiet borders, and minimal shadows. Surfaces stay opaque and calm; there is no glass blur. OLED cards use subtle separation from black without large glows. Avoid elevation on every nested statistic; use dividers and spacing for grouping.

## Shapes

Controls use 6px radii, content cards 10–18px, and status treatments use restrained rounding. Tables remain square-edged inside rounded scroll containers. Focus rings sit outside the component border and must not be clipped. The bottom navigation is the only persistent floating surface; market prices never appear in a floating pill.

## Components

### Foundational visual states

Buttons expose hover, active, focus-visible, disabled, and busy states. Inputs use a gold focus border and clear visible labels. Feed freshness is green only while recent; delayed/previous-close status changes to amber or neutral copy. Toasts announce short success/error feedback without replacing the persistent price freshness indicator. Reduced-motion preferences suppress nonessential animation.

### Buttons and actions

Gold emphasis is reserved for a primary save/calculation action. Refresh, theme, alarm, and language are compact icon/text controls with accessible names. Destructive portfolio removal remains visually separate from adding or exporting holdings.

### Navigation and data display

The persistent dock has exactly four destinations and a clear selected state. The daily range panel reports only recorded fixes for the current Asia/Kolkata date. Historical performance belongs to Analytics and is not presented as an intraday quote. Tables scroll inside their own viewport; charts pair canvas output with text metrics. Scrubbing updates the chart’s stable summary/header, never an overlay popup.

### Forms and overlays

Calculators use labeled native numeric/select/date controls; OS-owned popup geometry and picker locale are accepted. User values and presets stay on-device. Alarm configuration uses the existing app-owned sheet. Backup import validates JSON, limits size and record count, merges without replacing existing lots, and gives an explicit failure message.

### Iconography

Existing inline SVGs use a consistent 1.8–2.2px rounded stroke. Keep text labels on the four primary nav items and accessible names on compact action buttons.

### Motion

Transitions are short and communicate selection, page entry, price refresh, or toast feedback. Avoid continuous decorative animation beyond a subtle fresh-feed dot; respect `prefers-reduced-motion`.

### Content and data visualization

Use clear terms such as “Updated”, “Delayed”, and “Previous close”; never imply that source websites publish on a guaranteed schedule. Rates use INR and Indian digit grouping. Distinguish benchmark rates from modeled wholesale/retail estimates and label forecast/risk values as estimates.

## Do's and Don'ts

- **Do:** Keep the 8g sovereign quote visually dominant and timestamped.
- **Do:** Pair freshness claims with the source-data timestamp and keep the old-price state visible.
- **Don't:** Label an old cached rate “Live Consensus”.
- **Don't:** use gold glow, gradients, or motion as a substitute for readable value hierarchy.
