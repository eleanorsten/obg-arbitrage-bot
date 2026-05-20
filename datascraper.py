import json
import time
import yfinance as yf
from datetime import datetime, timezone

OUTPUT_FILE = "prices.json"
POLL_INTERVAL = 60  # seconds between refreshes


def fetch_price(ticker: str) -> dict:
    data = yf.Ticker(ticker)
    info = data.fast_info
    price = info.last_price
    if price is None:
        raise ValueError(f"No price returned for {ticker}")
    return {
        "price": round(float(price), 4),
        "currency": "USD",
        "unit": "per barrel",
    }


def build_snapshot(wti: dict, brent: dict) -> dict:
    spread = round(brent["price"] - wti["price"], 4)
    return {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "WTI": wti,
        "Brent": brent,
        "spread": {
            "brent_minus_wti": spread,
            "direction": "Brent_premium" if spread >= 0 else "WTI_premium",
        },
    }


def write_snapshot(snapshot: dict) -> None:
    with open(OUTPUT_FILE, "w") as f:
        json.dump(snapshot, f, indent=2)
    print(f"[{snapshot['fetched_at']}] WTI=${snapshot['WTI']['price']} "
          f"Brent=${snapshot['Brent']['price']} "
          f"Spread={snapshot['spread']['brent_minus_wti']}")


def run(poll: bool = True) -> None:
    print(f"Starting crude oil data scraper → {OUTPUT_FILE}")
    while True:
        try:
            wti = fetch_price("CL=F")
            brent = fetch_price("BZ=F")
            snapshot = build_snapshot(wti, brent)
            write_snapshot(snapshot)
        except Exception as e:
            print(f"[ERROR] {e}")

        if not poll:
            break
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run()
