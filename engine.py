from engine_logic import find_arb  # re-exported for import compatibility


def main(fee_pct: float = 0.02) -> None:
    opps = find_arb(fee_pct=fee_pct)
    if not opps:
        print("No arb opportunities found.")
        return

    print(f"Found {len(opps)} opportunity(s):\n")
    for o in opps:
        print(
            f"  BUY  {o['buy_on']:<15s} @ {o['buy_price']:.4f}"
            f"  ->  SELL {o['sell_on']:<15s} @ {o['sell_price']:.4f}"
            f"  |  +{o['net_pct']:.4f}%  (${o['net_profit']:.4f}/bbl)"
        )


if __name__ == "__main__":
    main()
