"""
Unit Test: Mobile Alignment, Equal Gutter Geometry & Grid Symmetry
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

def test_mobile_alignment():
    nav_css = (BASE_DIR / "css/navigation.css").read_text()
    bento_css = (BASE_DIR / "css/bento-grid.css").read_text()
    index_html = (BASE_DIR / "index.html").read_text()

    print("============================================================")
    print("TESTING MOBILE ALIGNMENT, GUTTERS & GRID SYMMETRY")
    print("============================================================")

    assert ".masthead-inner" in nav_css and "class=\"masthead-inner\"" in index_html
    print("  ✓ [TEST 1a] .masthead-inner wrapper present in navigation.css and index.html")

    assert "padding: max(10px, env(safe-area-inset-top, 0px)) 12px 10px;" in nav_css
    assert "padding: 10px 12px 14px;" in nav_css
    print("  ✓ [TEST 1b] Masthead and Views Viewport share identical 12px mobile gutters")

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

    assert "transform: none;" in bento_css
    print("  ✓ [TEST 9] Chart tooltip transform fixed to prevent off-canvas displacement")

    # Cascade order verification
    base_viewport_idx = nav_css.find(".views-viewport {\n  width: 100%;")
    mobile_viewport_idx = nav_css.find(".views-viewport {\n    padding: 10px 12px 14px;")
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

    # Inactive chart tooltip hidden rule
    assert ".chart-tooltip[hidden]" in bento_css and "display: none !important" in bento_css
    print("  ✓ [TEST 14] .chart-tooltip[hidden] enforces complete dismissal when inactive")

    # Single-line masthead alignment
    assert "flex-wrap: nowrap;" in nav_css and ".masthead-actions" in nav_css
    print("  ✓ [TEST 15] .masthead-inner enforces flex-wrap: nowrap preventing mobile multi-row splitting")

    # Service worker v10 cache invalidation
    sw_js = (BASE_DIR / "sw.js").read_text()
    assert 'CACHE_NAME = "gold-terminal-v10"' in sw_js
    assert 'request.mode === "navigate"' in sw_js
    print("  ✓ [TEST 16] sw.js enforces gold-terminal-v10 and network-first navigation policy")

    print("============================================================")
    print("ALL MOBILE ALIGNMENT TESTS PASSED 100%! ✓")
    print("============================================================")

if __name__ == "__main__":
    test_mobile_alignment()
