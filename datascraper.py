import os
import json
import time
import requests
from datetime import datetime, timezone

API_KEY = os.environ.get("ALPHA_VANTAGE_API_KEY", "")
BASE_URL = "https://www.alphavantage.co/query"
OUTPUT_FILE = "prices.json"
POLL_INTERVAL = 60  # seconds between refreshes


def fetch_commodity(symbol: str) -> dict:
    """Fetch latest daily price for a commodity from Alpha Vantage."""
    params = {
        "function": symbol,
        "interval": "daily",
        "apikey": API_KEY,
        "datatype": "json",
    }
    response = requests.get(BASE_URL, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    if "Information" in data:
        raise RuntimeError(f"Alpha Vantage API limit reached: {data['Information']}")
    if "Error Message" in data:
        raise RuntimeError(f"Alpha Vantage error for {symbol}: {data['Error Message']}")

    entries = data.get("data", [])
    if not entries:
        raise ValueError(f"No data returned for {symbol}")

    latest = entries[0]
    return {
        "date": latest["date"],
        "price": float(latest["value"]),
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
    if not API_KEY:
        raise EnvironmentError(
            "ALPHA_VANTAGE_API_KEY environment variable is not set. "
            "Get a free key at https://www.alphavantage.co/support/#api-key"
        )

    print(f"Starting crude oil data scraper → {OUTPUT_FILE}")
    while True:
        try:
            wti = fetch_commodity("WTI")
            brent = fetch_commodity("BRENT")
            snapshot = build_snapshot(wti, brent)
            write_snapshot(snapshot)
        except Exception as e:
            print(f"[ERROR] {e}")

        if not poll:
            break
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run()
