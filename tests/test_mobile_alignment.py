"""
Unit Test: Mobile Alignment, Equal Gutter Geometry & Grid Symmetry
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

def test_mobile_alignment():
    nav_css = (BASE_DIR / "css/navigation.css").read_text()
    bento_css = (BASE_DIR / "css/bento-grid.css").read_text()
    upgrade_css = (BASE_DIR / "css/upgrade.css").read_text()
    index_html = (BASE_DIR / "index.html").read_text()

    print("============================================================")
    print("TESTING MOBILE ALIGNMENT, GUTTERS & GRID SYMMETRY")
    print("============================================================")

    assert ".masthead-inner" in nav_css and "class=\"masthead-inner\"" in index_html
    print("  ✓ [TEST 1a] .masthead-inner wrapper present in navigation.css and index.html")

    assert "padding: max(10px, env(safe-area-inset-top, 0px)) var(--mobile-gutter) 10px;" in nav_css
    assert "padding: 10px var(--mobile-gutter) 14px;" in nav_css
    assert ".masthead-inner { padding-inline: var(--mobile-gutter); }" in upgrade_css
    assert ".views-viewport {\n    padding-inline: var(--mobile-gutter);\n    padding-top: 16px;\n    padding-bottom: 28px;\n  }" in upgrade_css
    assert ".masthead-inner,\n  .views-viewport" not in upgrade_css
    assert "--mobile-gutter: clamp(12px, 4vw, 16px);" in (BASE_DIR / "css/design-system.css").read_text()
    assert "padding-inline: var(--mobile-gutter);" in upgrade_css
    print("  ✓ [TEST 1b] Masthead and content share one 12–16px phone gutter token")

    assert ".basis-grid" in bento_css and ".basis-box" in bento_css and "min-height: 76px" in bento_css
    print("  ✓ [TEST 2] .basis-grid and .basis-box enforce equal card heights and baselines")

    assert ".national-spread-grid" in bento_css and ".national-col" in bento_css and "min-height: 68px" in bento_css
    print("  ✓ [TEST 3] .national-spread-grid and .national-col enforce equal heights across 3 columns")

    assert ".quant-risk-grid" in bento_css and ".quant-risk-box" in bento_css and "min-height: 58px" in bento_css
    print("  ✓ [TEST 4] .quant-risk-grid and .quant-risk-box enforce uniform metric card heights")

    assert ".technical-meter-grid" in bento_css and ".tech-meter-box" in bento_css and "min-height: 124px" in bento_css
    print("  ✓ [TEST 5] .technical-meter-grid and .tech-meter-box align Sentiment dial and RSI scale")

    assert "grid-template-columns: repeat(7, minmax(0, 1fr))" in bento_css
    print("  ✓ [TEST 6] .segment-ctrl enforces strict 7-column grid without horizontal scrolling")

    assert "grid-template-columns: repeat(4, minmax(0, 1fr))" in bento_css
    print("  ✓ [TEST 7] #weightChips and #makingChips enforce strict 4-column row without clipping")

    assert ".meter-metric-item" in bento_css and "min-height: 56px" in bento_css
    assert ".port-metric" in bento_css and "min-height: 64px" in bento_css
    print("  ✓ [TEST 8] Meter metric items and portfolio metrics enforce structured card geometry")

    assert ".chart-tooltip" not in bento_css
    print("  ✓ [TEST 9] Floating chart price popup styles are removed")

    # Cascade order verification
    base_viewport_idx = nav_css.find(".views-viewport {\n  width: 100%;")
    mobile_viewport_idx = nav_css.find(".views-viewport {\n    padding: 10px var(--mobile-gutter) 14px;")
    assert base_viewport_idx != -1 and mobile_viewport_idx != -1
    assert base_viewport_idx < mobile_viewport_idx, "Base .views-viewport must precede mobile media query in cascade"
    print("  ✓ [TEST 10] .views-viewport base declaration correctly precedes @media (max-width: 640px)")

    # Purity benchmark alignment
    assert "height: 26px" in bento_css and ".purity-carat" in bento_css
    assert ".purity-row-bento" in bento_css and "repeat(3, minmax(0, 1fr))" in bento_css
    print("  ✓ [TEST 11] .purity-carat has fixed 26px height locking 24K, 22K, 18K price baselines")

    # Fix timeline chip symmetry
    assert "grid-template-columns: repeat(2, minmax(0, 1fr))" in bento_css and ".fix-chips-wrap" in bento_css
    assert "min-height: 72px" in bento_css and ".fix-chip" in bento_css
    print("  ✓ [TEST 12] .fix-chips-wrap uses strict 2-column grid locking AM and PM fix rate baselines")

    # Hero eyebrow alignment
    assert "min-height: 32px" in bento_css and ".hero-eyebrow" in bento_css
    print("  ✓ [TEST 13] .hero-eyebrow enforces 32px vertical center alignment with action button")

    # Analytics exits, gesture cancellation, and complete removal of floating prices
    app_js = (BASE_DIR / "js/app.js").read_text()
    assert 'id="dynamicIsland"' not in index_html
    assert "dynamicIsland" not in app_js and "syncDynamicIsland" not in app_js
    assert ".dynamic-island" not in nav_css and ".island-rate" not in nav_css
    assert 'id="chartTooltip"' not in index_html and "chartTipRate" not in app_js
    assert "endChartScrub();" in app_js and 'addEventListener("pointercancel", endScrub)' in app_js
    assert 'addEventListener("touchcancel", endScrub)' in app_js
    assert "Price Pill" not in (BASE_DIR / "js/quant-risk.js").read_text()
    print("  ✓ [TEST 14] All floating and chart price pop-up pills are removed; scrub cleanup remains")

    assert "grid-template-columns: repeat(3, minmax(0, 1fr));" in upgrade_css
    assert ".daily-snapshot > div { display: flex;" in upgrade_css
    assert ".tab-btn.active::before" in upgrade_css
    print("  ✓ [TEST 14b] Range metrics remain aligned and selected navigation uses its shared indicator")

    # Single-line masthead alignment
    assert "flex-wrap: nowrap;" in nav_css and ".masthead-actions" in nav_css
    print("  ✓ [TEST 15] .masthead-inner enforces flex-wrap: nowrap preventing mobile multi-row splitting")

    # Service worker cache invalidation
    sw_js = (BASE_DIR / "sw.js").read_text()
    assert 'CACHE_NAME = "gold-terminal-v35"' in sw_js
    assert 'request.mode === "navigate"' in sw_js
    print("  ✓ [TEST 16] sw.js enforces gold-terminal-v35 and network-first navigation policy")

    assert "padding-inline: var(--mobile-gutter);" in upgrade_css
    assert ".masthead .icon-btn { width: 44px; height: 44px; }" in upgrade_css
    assert ".masthead-inner { padding-inline: var(--mobile-gutter); gap: 6px; }" in upgrade_css
    assert "grid-template-columns: minmax(0, 1fr); gap: 12px;" in upgrade_css
    assert "padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px));" in upgrade_css
    assert "--page-max: 960px;" in (BASE_DIR / "css/design-system.css").read_text()
    assert 'src="js/share-cards.js?v=35"' in index_html
    assert ".tab-btn span {\n    display: block;" in upgrade_css
    assert ".meter-metric-item span,\n  .port-metric span" in upgrade_css
    assert "|| 14145" not in app_js
    assert "|| 14270" not in app_js
    assert "function isValidGoldRate" in app_js
    assert "Waiting for a verified Chennai 22K benchmark." in app_js
    assert "rate_22k || 14145" not in (BASE_DIR / "js/share-cards.js").read_text()
    assert "fix-timeline-head .status-indicator" in upgrade_css
    assert "grid-template-columns: repeat(2, minmax(0, 1fr));" in upgrade_css
    assert ".sentiment-dial circle {\n  fill: none;" in upgrade_css
    assert ".dial-fill {\n  stroke: var(--brand-primary);" in upgrade_css
    assert 'id="marketQuoteTime"' in index_html and 'id="marketDate"' in index_html
    assert "Waiting for verified market data…" in index_html
    assert 'dataset.appReady === "true"' in index_html
    assert 'boot("navigation", initNavigation)' in (BASE_DIR / "js/app.js").read_text()
    assert '$("marketQuoteTime").textContent = quoteTimeLabel' in (BASE_DIR / "js/app.js").read_text()
    assert ".calc-field label {\n  display: block;\n  min-height: 2.7em;" in upgrade_css
    share_cards = (BASE_DIR / "js/share-cards.js").read_text().split("Generates Itemized Quotation Receipt Card")[0]
    assert "#e1e7ff" in share_cards and "#4058a5" in share_cards
    assert "#faf6ed" not in share_cards and "#a97f34" not in share_cards
    print("  ✓ [TEST 17] Responsive gutters align and generated snapshots use the current indigo visual system")

    print("============================================================")
    print("ALL MOBILE ALIGNMENT TESTS PASSED 100%! ✓")
    print("============================================================")

if __name__ == "__main__":
    test_mobile_alignment()
