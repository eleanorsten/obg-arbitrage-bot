from itertools import combinations
from fetcher import get_prices

def find_arb(fee_pct: float = 0.02) -> list[dict]:
    """
    Pulls prices from partner's get_prices(), compares all pairs,
    returns profitable arb opportunities sorted best first.
    """
    prices = get_prices()
    opps = []
    fee_mult = fee_pct / 100

    for a, b in combinations(prices, 2):
        # buy a's ask, sell b's bid
        cost_1 = a["ask"] * (1 + fee_mult)
        rev_1 = b["bid"] * (1 - fee_mult)
        profit_1 = rev_1 - cost_1

        # buy b's ask, sell a's bid
        cost_2 = b["ask"] * (1 + fee_mult)
        rev_2 = a["bid"] * (1 - fee_mult)
        profit_2 = rev_2 - cost_2

        if profit_1 > 0:
            opps.append({
                "buy_on": a["source"],
                "sell_on": b["source"],
                "buy_price": a["ask"],
                "sell_price": b["bid"],
                "net_profit": round(profit_1, 4),
                "net_pct": round((profit_1 / cost_1) * 100, 4),
            })
        if profit_2 > 0:
            opps.append({
                "buy_on": b["source"],
                "sell_on": a["source"],
                "buy_price": b["ask"],
                "sell_price": a["bid"],
                "net_profit": round(profit_2, 4),
                "net_pct": round((profit_2 / cost_2) * 100, 4),
            })

    opps.sort(key=lambda x: x["net_pct"], reverse=True)
    return opps


# --- self-test with fake fetcher ---
if __name__ == "__main__":
    # mock get_prices so you can test standalone
    import sys, types
    fake_mod = types.ModuleType("fetcher")
    fake_mod.get_prices = lambda: [
        {"source": "nymex_wti", "contract": "CL_JUL26", "bid": 61.40, "ask": 61.45, "ts": 0},
        {"source": "ice_brent", "contract": "BRN_JUL26", "bid": 64.80, "ask": 64.85, "ts": 0},
        {"source": "cme_wti", "contract": "WTI_AUG26", "bid": 61.38, "ask": 61.50, "ts": 0},
    ]
    sys.modules["fetcher"] = fake_mod

    from engine import find_arb as _find_arb
    for o in _find_arb():
        print(f"BUY {o['buy_on']} @ {o['buy_price']} -> SELL {o['sell_on']} @ {o['sell_price']} | +{o['net_pct']}%")