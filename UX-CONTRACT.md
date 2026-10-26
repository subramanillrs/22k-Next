# UX Contract

## Product context

- **Audience:** Chennai gold buyers and market watchers.
- **Primary jobs:** Check the latest MJDMA benchmark and source age; compare historical/quantitative trends; estimate a purchase; compare schemes; track local gold lots.
- **Target market(s):** Chennai / Tamil Nadu, as established by `README.md` and the application’s MJDMA, Chennai, and regional-hub data.
- **Active locales:** English; optional Tamil for common navigation and calculator/portfolio controls.
- **Language/content register:** Plain, practical market terminology. English is the complete fallback; specialist names, source labels, and quantitative explanations may remain English in Tamil mode. Tamil copy is a lightweight UI translation and should receive native-language review before claiming complete localization.
- **Timezone/calendar policy:** Market dates and “today” range are interpreted in Asia/Kolkata. Date-only values stay `YYYY-MM-DD` and are never timezone-converted. Native date picker locale/geometry is platform-owned and accepted.
- **Accessibility target:** WCAG 2.2 AA direction; keyboard focus is visible, browser zoom remains enabled, and changes/feedback must not depend on color alone.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Market and update cadence | `README.md`, `.github/workflows/main.yml`, `update_gold.py` | Product source / scheduled pipeline | 2026-10-13 |
| Price payload and history | `data/live.json`, `data/history.json`, `data/bootstrap.json` | Runtime data contract | 2026-10-13 |
| Local portfolio lifecycle | `js/app.js`, `js/local-tools.js` | Client-side storage behavior | 2026-10-11 |
| Calculator and scheme formulas | `js/app.js`, `js/scheme-optimizer.js`, `tests/` | Product implementation / tests | 2026-10-11 |

## Visual contract

- **Project `DESIGN.md`:** `DESIGN.md`.
- **Token ownership model:** Existing CSS is canonical; DESIGN.md mirrors the implemented values.
- **Runtime design-system/token source:** `css/design-system.css`; component refinements in `css/upgrade.css`.
- **Mapping/export/adapters:** CSS custom properties; no generated token pipeline.
- **Token drift gate:** Review DESIGN.md when editing canonical root/theme values; verify Day and OLED in browser.
- **Supported themes:** Material 3 Expressive light (default) and OLED Night (optional). This design-system release resets the earlier saved theme once; subsequent explicit theme choices persist.
- **Design-context owner/review policy:** This repository’s UI and CSS are the source of truth; preserve the four-tab information architecture.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Table Selection | Native table markup | `index.html` table regions | Read-only rows; no row selection | Keyboard and screen-reader scan |
| Select/Listbox | Native `<select>` | Browser/OS popup | Native geometry and option rendering accepted | Keyboard, popup, narrow viewport |
| Date | Native `input[type=date]` | Browser/OS picker; ISO date value in app state | Native locale/geometry accepted | Keyboard date entry; Asia/Kolkata storage check |
| Native ownership decision | Native `<select>` and `input[type=date]` | Browser/OS owns popup rendering, option/date navigation, and picker geometry; app owns labels, values, validation, and persistence | No authored replacement popup | Keyboard, VoiceOver, narrow viewport, date storage |
| Form | Existing calculator and local-ledger handlers | `js/app.js` | Calculator, audit, portfolio, alarm | Existing tests and manual valid/invalid flows |
| Scrollbar | Global CSS baseline | `css/design-system.css` | Horizontal carousel retains visible, tokenized scrollbar | Mouse, touch, forced-colors, computed styles |
| Toast | `showToast` in `js/app.js` | App-owned transient status | Success, info, warning, error | Live-region and timeout check |
| CRUD | `js/app.js` + `js/local-tools.js` | Browser localStorage | Add/remove/import holdings; import is additive | Add, remove, export, deduplicated import, invalid backup |

Native ownership manifest: `premium-ui.json` records `Select/Listbox` and `Date` as `native`. Their browser/OS picker surfaces remain platform-owned; application code owns labels, values, validation, and persistence.

## Component behavior

| Component | Default | Hover | Focus | Active | Disabled | Busy | Error |
|---|---|---|---|---|---|---|---|
| Button | Quiet or gold primary by emphasis | Border/ink contrast | Visible gold ring | Brief pressed scale | No action | Refresh icon spins and button disables | Toast explains failure |
| Icon button | Surface-sunken circular target | Gold border/ink | Visible gold ring | Pressed scale | Native disabled state | `aria-busy` when refreshing | Toast on failure |
| Input | Labeled, 44px-or-larger touch field | n/a | Gold border/ring | n/a | Native disabled | n/a | Existing helper/toast; do not rely on color only |
| Search | Not present | n/a | n/a | n/a | n/a | n/a | n/a |
| Textarea | Not present | n/a | n/a | n/a | n/a | n/a | n/a |
| Table/list | Read-only price/portfolio rows | n/a | Row actions focusable | Delete action only | n/a | n/a | Empty state and toast |

## Dataset navigation

- **Admin tables:** None.
- **Exploratory lists:** Historical rate table and personal holdings ledger.
- **URL state:** Tab and filters are transient; market payload/history are shareable through static repository data. Portfolio and saved presets are device-local and never put in a URL.
- **Page size:** History table displays a bounded recent slice and scrolls internally; portfolio contains the user’s local lots.
- **Empty/no-results/error/loading treatment:** Bootstrap payload renders immediately; history can show a loading/empty state. Failed refresh keeps the last available rate and surfaces a toast; freshness text warns when data is delayed.
- **Back/scroll restoration:** Tab selection returns to page top. Browser scroll is natural within each screen.
- **Selection scope:** No bulk selection. Portfolio deletion is per row. Imported holdings are merged and deduplicated; existing lots are never replaced by import.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome | Source ref |
|---|---|---|---|---|---|---|---|
| Refresh market | Refresh button, visible-tab timer, or return to page | One in-flight request; manual button indicates busy | Current tab | Toast on manual success; status age updates | Keep last rate; show offline/failed toast | Trigger retains focus | `js/app.js` |
| Save calculator setup | Name + Save setup | Local storage write | Calculator | Named saved toast | Explain storage failure; name remains editable | Name field can regain focus on missing name | `js/app.js` |
| Add portfolio lot | Save to Portfolio | Validate weight/rate and write local data | Portfolio section | Added-lot toast | Roll back in-memory addition and explain save failure | Button retains focus | `js/app.js` |
| Delete portfolio lot | Per-row delete | Local storage write | Same portfolio section | Deleted-lot toast | Restore row in memory and explain failure | Table action remains in place | `js/app.js` |
| Import portfolio backup | File picker | Read JSON; validate size, date, weight/rate, count; merge/dedupe | Same portfolio section | Count of new lots; existing holdings retained | Invalid/oversize/duplicate errors via toast; no partial write | File input resets for retry | `js/local-tools.js` |
| Export portfolio | Export backup button | Serialize validated local lots | Browser download | Download toast | Browser download remains retryable | Button retains focus | `js/app.js` |
| Change locale/theme/tab | Header/dock control | Immediate local UI update | Current app screen | Visible state change | Saved locally where supported | Focus remains on control | `js/app.js` |

## Navigation and responsive behavior

- **Document title:** One descriptive title for the single-page PWA.
- **Route error / 403 behavior:** No authenticated routes or permission model.
- **Breadcrumb/tab/route-state policy:** Four fixed tabs; selected tab is indicated visually and with `aria-current`.
- **Price display:** The Market hero is the single prominent quote; no floating duplicate price pill appears on any tab. Chennai-vs-IBJA spread uses a signed premium/discount and is shown only when both benchmark prices are valid, 22K is below 24K, and the benchmark is not synthetic; otherwise it is labeled unavailable rather than fabricated.
- **Sidebar/drawer/bottom-sheet transformation:** Fixed bottom dock with safe-area support. The app-owned alarm sheet starts visually hidden, inert, and `aria-hidden`; when opened it isolates the rest of the app, locks page scrolling, traps keyboard focus, closes on Escape/backdrop/close button, and restores the opener's focus and prior scroll state.
- **Responsive table strategy:** Tables scroll in their own bounded wrappers; headings remain visible.
- **Truncation/full-value access:** Long source and note labels can wrap or be read in table cells; numeric values use tabular figures.
- **Focus restoration and sticky-obstruction policy:** Visible focus ring; controls scroll below sticky header; keep zoom enabled.
- **Small-phone app bar:** All four app-bar actions remain available in 44px touch targets. At <=480px, only the noninteractive market feed label becomes a compact live dot while its changing text remains in a polite live region; masthead and content share one `clamp(12px, 4vw, 16px)` gutter.
- **OnePlus 13R-class portrait layout:** Phone layout is the base: one content column, nested metric grids only where comparisons are meaningful, full-width bottom navigation above the Android safe area, and natural page scrolling. Validate at 393px and 412px CSS widths without depending on a device-specific fixed width.
- **Regional parity on phones:** Show Tamil Nadu hubs as a two-column, two-row grid at phone widths instead of a clipped horizontal carousel; retain the wider-screen swipe/scroll presentation only where it fits.
- **Sentiment visualization:** The sentiment score is a stroked, non-filled SVG ring with a textual score and label; it must never fall back to the browser's default black SVG fill.
- **Generated market snapshot:** `js/share-cards.js` owns the snapshot renderer and must follow the Material indigo/day palette (while preserving the optional OLED variant); any renderer change increments the page/service-worker asset version together.

## Overlays and feedback

- **Dialog primitive:** Existing app-owned alarm bottom sheet; no native blocking dialogs. Modal semantics are active only while opened; closed-state content is unavailable to keyboard and assistive technology.
- **Destructive confirmation levels:** Per-lot deletion is immediate; the app does not offer whole-portfolio destructive import.
- **Toast placement/duration/deduplication:** App-owned top-center status, brief duration, success/warning/error text.
- **Alert/banner scope and persistence:** Feed freshness remains in the masthead; last known rate remains visible after a failed request.
- **Tooltip delay/dismissal:** Native title only for compact action explanations.
- **Chart price popups:** None. Scrubbing updates the chart’s selected value in the stable chart header and crosshair only; no floating tooltip, high/low badge, or y-axis price pill is rendered.
- **Unsaved-changes behavior:** Calculator input is transient unless the user saves a named setup; local lots persist immediately.
- **Layer/z-index contract:** Alarm backdrop/sheet above app content; toast above both.

## Async and resilience

- **Mutation default:** Local-only writes are committed to localStorage before showing success.
- **Idempotency and duplicate-submit policy:** Refresh requests are single-flight; imports deduplicate by date, weight, rate, and note.
- **Auto-save/draft recovery:** Holdings and theme/language persist locally; calculator presets are explicit saves.
- **Offline/read-stale/write behavior:** Bootstrap provides immediate rendering. Failed network refresh preserves the last value and exposes its age. Portfolio and presets remain local.
- **Retry/backoff/timeout behavior:** Client checks its live feed every 60 seconds while visible and immediately on visibility return. When configured, Cloudflare checks source pages every three minutes during fix windows and replaces the displayed rate only after LiveChennai and GoodReturns agree within the existing pipeline tolerance. Disagreement/unavailability preserves the last confirmed rate and labels the check state. GitHub Actions remains the five-minute best-effort fallback and updates history/analytics; neither schedule guarantees source publication time.
- **Version conflict and multi-tab behavior:** No remote writes; localStorage is shared by same-origin tabs, without conflict resolution.
- **Stale-request cancellation/invalidation:** One live request at a time; freshness label ages every 30 seconds.
- **Dialog/form preservation and retry after mutation failure:** User values remain in controls; failed local writes do not claim success.

## Validation

- **Schema/validation layer:** Numeric bounds and JSON validation in `js/local-tools.js`; individual existing calculators validate their numeric values in `js/app.js`.
- **Trigger timing:** Recalculate on input/change; validate portfolio additions on save and backups before merge.
- **Error policy:** Inline labels plus concise toast feedback; do not replace form data on invalid import.
- **Sensitive-value handling:** No credentials or payment data; portfolio is local by default.
- **`noValidate`:** No HTML `<form>` submission flows; all user-triggered calculations and local mutations use buttons.

## Permission and clipboard

- **Permission UI strategy:** No account permissions.
- **Clipboard copy policy:** Quotation text is user-triggered; toast reports copied/failed.
- **Disabled-state explanation:** Refresh is disabled only during a manual in-flight request.

## Verification

- **Required static commands:** Existing Python pipeline and JavaScriptCore test suites listed in `README.md`; add `jsc tests/test_local_tools.js`.
- **Browser/device/theme matrix:** Safari narrow viewport and desktop width; Day and OLED; keyboard focus; reduced motion; native picker/select.
- **Accessibility checks:** Zoom, focus visibility, selected-tab state, touch target size, status announcement, and alarm dialog open/close keyboard/focus lifecycle.
- **Native-language/domain review:** Tamil covers common controls only; source/fix naming and price semantics remain English until reviewed by a Tamil-speaking market user.
- **Component-state/visual regression coverage:** Manual screenshot at phone and desktop widths; latest-price, delayed-feed, empty-range, filled portfolio, and calculator states.
- **Project audit:** Premium UI static audit is advisory here; legacy ID-bound button handlers are not visible to its static action detector and are checked through the app test suite.
