from itertools import combinations

def find_arb(prices: list[dict], fee_pct: float = 0.02) -> list[dict]:
    """
    prices: [{"source": str, "contract": str, "bid": float, "ask": float, "ts": float}, ...]
    fee_pct: one-way fee as percentage (0.02 = 0.02%)
    Returns list of profitable arb opportunities, sorted best first.
    """
    opps = []
    fee_mult = fee_pct / 100

    for a, b in combinations(prices, 2):
        # direction 1: buy a's ask, sell b's bid
        cost_1 = a["ask"] * (1 + fee_mult)
        revenue_1 = b["bid"] * (1 - fee_mult)
        profit_1 = revenue_1 - cost_1

        # direction 2: buy b's ask, sell a's bid
        cost_2 = b["ask"] * (1 + fee_mult)
        revenue_2 = a["bid"] * (1 - fee_mult)
        profit_2 = revenue_2 - cost_2

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


# --- quick self-test, delete later ---
if __name__ == "__main__":
    fake = [
        {"source": "nymex", "contract": "CL_JUL26", "bid": 61.40, "ask": 61.45, "ts": 0},
        {"source": "ice_brent", "contract": "BRN_JUL26", "bid": 64.80, "ask": 64.85, "ts": 0},
        {"source": "cme_wti", "contract": "WTI_JUL26", "bid": 61.38, "ask": 61.50, "ts": 0},
    ]
    for o in find_arb(fake):
        print(f"BUY {o['buy_on']} @ {o['buy_price']} -> SELL {o['sell_on']} @ {o['sell_price']} | +{o['net_pct']}%")