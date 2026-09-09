"""
Unit & Integration Test Suite for Next-Gen Quantitative Gold Pipeline
"""

import sys
from pathlib import Path
import json

# Setup import path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import update_gold


def test_pipeline_quant_and_bootstrap():
    print("============================================================")
    print("TESTING BACKEND QUANT PIPELINE & BOOTSTRAP PRE-BAKING")
    print("============================================================")

    # 1. Submarket basis spreads including Salem
    spreads = update_gold.compute_submarket_spreads(14145)
    regional = spreads["submarket_spreads"]["regional_parity"]
    assert regional["salem"]["rate_22k"] == 14135, f"Expected 14135, got {regional['salem']['rate_22k']}"
    assert regional["salem"]["basis_spread"] == -10, f"Expected -10, got {regional['salem']['basis_spread']}"
    assert regional["coimbatore"]["basis_spread"] == -15
    assert regional["madurai"]["basis_spread"] == 15
    print("  ✓ [TEST 1] Sub-market regional basis spreads verified (Salem -₹10/g, Coimbatore -₹15/g, Madurai +₹15/g)")

    # 2. Bayesian Multi-Source Consensus
    consensus_res = update_gold.calculate_bayesian_consensus(
        {
            "livechennai": {"rate_22k": 14145},
            "goodreturns": {"rate_22k": 14145},
            "ibja": {"rate_22k": 14004},
        },
        previous_rate=14145
    )
    assert consensus_res["valid"] is True
    assert consensus_res["consensus_rate"] == 14145
    print(f"  ✓ [TEST 2] Bayesian consensus locked ₹{consensus_res['consensus_rate']} with confidence {consensus_res['confidence']}%")

    # 3. Probabilistic KDE Fix Timing
    kde_res = update_gold.predict_session_times()
    assert kde_res["AM"] is not None
    assert kde_res["PM"] is not None
    print(f"  ✓ [TEST 3] Gaussian KDE predicted AM arrival: {kde_res['AM'][0]:02d}:{kde_res['AM'][1]:02d}, PM arrival: {kde_res['PM'][0]:02d}:{kde_res['PM'][1]:02d}")

    # 4. Bootstrap Pre-Baking into index.html
    index_path = update_gold.INDEX_HTML_FILE
    assert index_path.exists(), "index.html missing"
    html_content = index_path.read_text(encoding="utf-8")
    assert 'id="gold-bootstrap"' in html_content, "gold-bootstrap tag missing in index.html"
    print("  ✓ [TEST 4] Instant bootstrap cache payload pre-baked into index.html")

    # 5. UI Structure & 4-Tab Verification in index.html
    assert 'data-tab="market"' in html_content, "Market tab button missing"
    assert 'data-tab="analytics"' in html_content, "Analytics tab button missing"
    assert 'data-tab="calc"' in html_content, "Calculator tab button missing"
    assert 'data-tab="schemes"' in html_content, "Schemes tab button missing"
    assert 'id="dynamicIsland"' in html_content, "Dynamic Island micro-bar missing"
    print("  ✓ [TEST 5] 4-Tab docked architecture and dynamic island verified in index.html")

    print("============================================================")
    print("ALL QUANTITATIVE PIPELINE TESTS PASSED 100%! ✓")
    print("============================================================")


if __name__ == "__main__":
    test_pipeline_quant_and_bootstrap()
