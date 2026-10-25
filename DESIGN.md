---
version: alpha
name: Chennai 22K Gold Terminal Next
description: A clear, glanceable Chennai gold-market instrument for live fixes, risk analysis, jewellery estimates, and local holdings.
colors:
  primary: "#1b1b22"
  secondary: "#454650"
  background: "#f7f7ff"
  surface: "#ffffff"
  accent: "#4058a5"
  coral: "#80536d"
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
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "30px"
  full: "9999px"
spacing:
  page-max: "960px"
  mobile-gutter: "clamp(12px, 4vw, 16px)"
  section-gap: "12px"
components:
  masthead:
    owner: "css/upgrade.css"
    treatment: "Light blue-gray app bar; slate brand, source freshness, language, refresh, alert, and theme actions."
  price-card:
    owner: "css/upgrade.css"
    treatment: "Primary-container sovereign quote with a strong tonal edge, per-gram rate, change, and market timestamp."
  navigation:
    owner: "css/upgrade.css"
    treatment: "Persistent four-destination dock: Market, Analytics, Calculator, Schemes; cobalt selected state."
  data-cards:
    owner: "css/upgrade.css"
    treatment: "Airy utility cards for fixes, purity, Chennai basis, and regional comparisons."
  controls:
    owner: "css/upgrade.css"
    treatment: "Shared cobalt-accent fields, segmented modes, and quick-value chips."
  feedback:
    owner: "js/app.js"
    treatment: "App-owned short toast; feed age and stale-price states remain visible in the masthead."
---

# Chennai 22K Gold Terminal Next

## Overview

### Creative North Star

Material 3 Expressive for a Chennai market instrument: tonal color, generous shapes, clear display typography, and contained interactions make the benchmark easy to scan without sacrificing the dense data work. The eight-gram quote sits in a primary-container surface; the dock uses Material navigation selection treatment. The default theme is light, not a black slab, and market prices never become floating pills.

### Product context and register

- **Audience and primary job:** Chennai gold buyers and market watchers checking the MJDMA fix, comparing trends and local spreads, estimating jewellery bills, and tracking personal holdings.
- **Target market(s) and evidence:** Chennai and Tamil Nadu; established by the product name, MJDMA/Chennai source fields, and regional hub data in `README.md`, `index.html`, and `data/`.
- **Locale(s) and language policy:** English is the full product language. Tamil is an optional, device-local translation for navigation and common calculator/portfolio controls; specialist market labels and quantitative explanations may remain English.
- **Usage scene:** Frequent, glanceable checks on mobile Safari and Android phones including OnePlus 13R-width screens; also usable on desktop. Source time and stale status matter more than decorative animation.
- **Register:** A practical market instrument, not a brokerage or a consumer-shopping storefront.
- **Memorable signature:** The eight-gram sovereign quote paired with a timestamped AM/PM fix timeline.
- **Restraint:** Keep the four-tab dock and quantitative density; use cobalt for focus/selection and coral sparingly. Do not darken the hero in the default theme.
- **Anti-references:** Black-and-gold trading terminals, generic crypto dashboards, neon charts, and luxury-commerce pages; they overstate speculation or obscure the local fix.
- **Token ownership/runtime mapping:** `css/design-system.css` is canonical. `DESIGN.md` mirrors its values; `css/upgrade.css` maps semantic tokens to shared component treatments. Legacy `--gold-*` aliases currently point to the cobalt accent for older component rules.

## Colors

The light palette uses `--bg-canvas: #f7f7ff`, `--surface-ground: #f1f2fa`, white raised surfaces, near-black primary text `#1b1b22`, and Material indigo `--brand-primary: #4058a5`. The primary container is `#e1e7ff` with `#18264e` foreground; muted plum `#80536d` is a restrained tertiary accent. Positive and negative values keep their semantic green/red tokens and readable labels. OLED remains optional; the app opens in the light Material theme after this visual upgrade, then remembers a new explicit theme choice. Analytics has no floating chart-price tooltip, badge, or axis pill.

## Typography

Roboto/system sans handles controls and dense information; Fraunces remains a distinctive display face for the sovereign quote. Prices use tabular numerals and Indian grouping. Small labels are uppercase only when they identify data categories, not sentences. The system sans fallback supports Tamil script; controls use 16px or larger on narrow touch screens to avoid iOS focus zoom.

## Layout

The base layout targets a 393–440 CSS-pixel portrait phone (including the OnePlus 13R class) with one shared 12–16px gutter, 44px app-bar actions, and a full-width four-destination bar above the Android safe area. Market content leads with the eight-gram quote, recorded daily range, and timestamped fix timeline; related readings remain grouped within consistent cards. Phone pages use one column while comparisons retain intentional two- and three-column inner grids. Wider screens expand the card grid and cap the reading width at 960px. Analytics keeps its chart and bounded history table. Calculator and scheme content scroll naturally; numeric forms use two columns only when they fit.

## Elevation & Depth

Hierarchy comes from a muted blue-gray canvas, raised white cards, and a single indigo primary-container quote. Nested readings use a neutral surface; green/red are reserved for semantic movement and status. Borders are quiet, shadows appear only on top-level cards, and there is no glass blur or dark default hero. OLED mode remaps the same semantic roles while retaining its optional high-contrast surface hierarchy.

## Shapes

Controls use 12px radii, nested readings 16px, and top-level cards 24–30px. Tables remain square-edged inside rounded scroll containers. Focus rings sit outside the component border and must not be clipped. The bottom navigation is the only persistent fixed surface; market prices never appear in a floating pill.

## Components

### Foundational visual states

Buttons expose hover, active, focus-visible, disabled, and busy states. Inputs use a cobalt focus border and clear visible labels. Feed freshness is green only while recent; delayed/previous-close status changes to amber or neutral copy. Toasts announce short success/error feedback without replacing the persistent price freshness indicator. Reduced-motion preferences suppress nonessential animation.

### Buttons and actions

Material primary emphasis is reserved for primary actions and selected controls; shape, size, and tonal containment reinforce state beyond color. Refresh, theme, alarm, and language are compact icon/text controls with accessible names. Destructive portfolio removal remains visually separate from adding or exporting holdings.

### Navigation and data display

The persistent dock has exactly four destinations and a clear selected state. The daily range panel reports only recorded fixes for the current Asia/Kolkata date. Historical performance belongs to Analytics and is not presented as an intraday quote. Tables scroll inside their own viewports; charts pair canvas output with text metrics. Scrubbing updates the chart's stable summary/header, never an overlay popup.

### Forms and overlays

Calculators use labeled native numeric/select/date controls; OS-owned popup geometry and picker locale are accepted. User values and presets stay on-device. Alarm configuration uses the existing app-owned sheet. Backup import validates JSON, limits size and record count, merges without replacing existing lots, and gives an explicit failure message.

### Iconography and motion

Existing inline SVGs use a consistent 1.8–2.2px rounded stroke. Keep text labels on the four primary nav items and accessible names on compact action buttons. Transitions are short and communicate selection, page entry, price refresh, or toast feedback. Avoid continuous decorative animation beyond a subtle fresh-feed dot; respect `prefers-reduced-motion`.

### Content and data visualization

Use clear terms such as “Updated”, “Delayed”, and “Previous close”; never imply that source websites publish on a guaranteed schedule. Rates use INR and Indian digit grouping. Distinguish benchmark rates from modeled wholesale/retail estimates and label forecast/risk values as estimates.

Generated market snapshots reuse the Material indigo palette, tonal quote surface, and neutral data cards so a shared image looks like the current app rather than the retired gold-sticker theme. The optional OLED theme remains gold-accented.

## Do's and Don'ts

- **Do:** Keep the 8g sovereign quote visually dominant and timestamped.
- **Do:** Pair freshness claims with the source-data timestamp and keep the old-price state visible.
- **Do:** Keep all current market, analytics, calculator, scheme, alarm, language, and OLED features intact.
- **Don't:** Label an old cached rate “Live Consensus”.
- **Don't:** use a black hero, gold glow, gradients, or motion as a substitute for readable value hierarchy.
