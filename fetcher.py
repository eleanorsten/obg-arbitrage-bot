import os
import requests

ALPHA_VANTAGE_KEY = os.environ["ALPHA_VANTAGE_KEY"]

# Alpha Vantage commodity functions → exchange label
_SOURCES = {
    "nymex_wti": "WTI",
    "ice_brent": "BRENT",
}

# Synthetic half-spread applied to the mid price (USD per barrel)
_HALF_SPREAD = 0.025


def _fetch_mid(function: str) -> tuple[float, str]:
    resp = requests.get(
        "https://www.alphavantage.co/query",
        params={"function": function, "interval": "daily", "apikey": ALPHA_VANTAGE_KEY},
        timeout=10,
    )
    resp.raise_for_status()
    payload = resp.json()
    latest = payload["data"][0]
    return float(latest["value"]), latest["date"]


def get_prices() -> list[dict]:
    results = []
    for source, function in _SOURCES.items():
        mid, ts = _fetch_mid(function)
        results.append({
            "source": source,
            "bid": round(mid - _HALF_SPREAD, 4),
            "ask": round(mid + _HALF_SPREAD, 4),
            "ts": ts,
        })
    return results
