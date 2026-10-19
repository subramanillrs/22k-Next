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
from bs4 import BeautifulSoup


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

    # 2b. IBJA extraction must not mistake the Platinum 999 row for Gold 999.
    ibja_fixture = BeautifulSoup("""
        <table id="TodayRatesTableDataYes">
          <tr><td>Gold 999</td><td>148048</td><td>147980</td></tr>
          <tr><td>Gold 916</td><td>135612</td><td>135550</td></tr>
          <tr><td>Platinum 999</td><td>58980</td><td>59133</td></tr>
        </table>
    """, "html.parser")
    ibja_rates = update_gold.extract_ibja_rates_from_soup(ibja_fixture)
    assert ibja_rates["24k_pm_10g"] == 147980
    assert ibja_rates["22k_pm_10g"] == 135550
    print("  ✓ [TEST 2b] IBJA gold rows are isolated from platinum rows")

    # Reject internally inverted purity quotes instead of publishing them as
    # current spot data or using them as a comparison benchmark.
    invalid_ibja_fixture = BeautifulSoup("""
        <table id="TodayRatesTableDataYes">
          <tr><td>Gold 999</td><td>147646</td><td>147055</td></tr>
          <tr><td>Gold 916</td><td>148473</td><td>147879</td></tr>
        </table>
    """, "html.parser")
    assert update_gold.extract_ibja_rates_from_soup(invalid_ibja_fixture) is None
    assert not update_gold.valid_ibja_rate_pair(14847, 14765)
    print("  ✓ [TEST 2c] Inverted IBJA 22K/24K quotes are rejected")

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
    assert 'id="dynamicIsland"' not in html_content, "Removed floating price pill must stay absent"
    print("  ✓ [TEST 5] 4-Tab docked architecture verified; floating price pill is absent")

    # The closed alarm sheet must not appear in the accessibility tree or tab order.
    assert 'id="alarmSheet" role="dialog" aria-modal="true"' in html_content
    assert 'aria-hidden="true" inert' in html_content
    print("  ✓ [TEST 5b] Alarm sheet is inert and hidden until explicitly opened")

    print("============================================================")
    print("ALL QUANTITATIVE PIPELINE TESTS PASSED 100%! ✓")
    print("============================================================")


if __name__ == "__main__":
    test_pipeline_quant_and_bootstrap()
