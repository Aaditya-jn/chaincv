import os
import httpx
from datetime import datetime, timezone

HELIUS_BASE = "https://api.helius.xyz"


def _get_api_key() -> str:
    key = os.getenv("HELIUS_API_KEY", "")
    if not key:
        raise RuntimeError("HELIUS_API_KEY is not set in environment variables.")
    return key


async def fetch_wallet_data(address: str) -> dict:
    """Fetch on-chain wallet data from Helius API and return structured stats."""
    api_key = _get_api_key()
    defaults = {
        "total_transactions": 0,
        "wallet_age_days": 0,
        "unique_programs": [],
        "sol_balance": 0.0,
        "token_count": 0,
        "nft_count": 0,
        "last_active": None,
        "timeline": [],
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        # --- Fetch transaction history ---
        transactions = []
        try:
            tx_url = f"{HELIUS_BASE}/v0/addresses/{address}/transactions"
            resp = await client.get(tx_url, params={"api-key": api_key, "limit": 100})
            resp.raise_for_status()
            transactions = resp.json()
        except Exception:
            pass  # Graceful degradation

        # --- Fetch balances ---
        balances_data = {}
        try:
            bal_url = f"{HELIUS_BASE}/v0/addresses/{address}/balances"
            resp = await client.get(bal_url, params={"api-key": api_key})
            resp.raise_for_status()
            balances_data = resp.json()
        except Exception:
            pass

    # --- Process transactions ---
    total_transactions = len(transactions)
    unique_programs = set()
    timestamps = []

    for tx in transactions:
        # Collect unique program IDs
        if "accountData" in tx:
            for entry in tx["accountData"]:
                if "nativeBalanceChange" not in str(entry):
                    pass
        # Check for instructions or programId references
        if isinstance(tx, dict):
            # Helius enhanced transactions have different structures
            if "instructions" in tx:
                for instr in tx["instructions"]:
                    pid = instr.get("programId", "")
                    if pid:
                        unique_programs.add(pid)
            # Also check nativeTransfers, tokenTransfers, etc.
            if "type" in tx:
                pass  # We'll use type for timeline

        # Collect timestamps
        ts = tx.get("timestamp")
        if ts:
            timestamps.append(ts)

    # Wallet age
    wallet_age_days = 0
    if timestamps:
        oldest = min(timestamps)
        newest = max(timestamps)
        oldest_dt = datetime.fromtimestamp(oldest, tz=timezone.utc)
        now = datetime.now(tz=timezone.utc)
        wallet_age_days = max(1, (now - oldest_dt).days)

    # Last active
    last_active = None
    if timestamps:
        last_active = datetime.fromtimestamp(max(timestamps), tz=timezone.utc).isoformat()

    # --- Process balances ---
    sol_balance = 0.0
    token_count = 0
    nft_count = 0

    if balances_data:
        # Native SOL balance (in lamports → SOL)
        native = balances_data.get("nativeBalance", 0)
        sol_balance = round(native / 1e9, 4)

        # Token accounts
        tokens = balances_data.get("tokens", [])
        for tok in tokens:
            amount = tok.get("amount", 0)
            decimals = tok.get("decimals", 0)
            if amount > 0:
                if decimals == 0 and amount == 1:
                    nft_count += 1
                else:
                    token_count += 1

    # --- Build timeline (last 10) ---
    timeline = []
    for tx in transactions[:10]:
        tx_type = tx.get("type", "UNKNOWN")
        description = tx.get("description", "") or _build_description(tx)
        ts = tx.get("timestamp")
        date_str = ""
        if ts:
            date_str = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        timeline.append({
            "date": date_str,
            "type": tx_type,
            "description": description[:120] if description else f"{tx_type} transaction",
        })

    return {
        "total_transactions": total_transactions,
        "wallet_age_days": wallet_age_days,
        "unique_programs": list(unique_programs),
        "sol_balance": sol_balance,
        "token_count": token_count,
        "nft_count": nft_count,
        "last_active": last_active,
        "timeline": timeline,
    }


def _build_description(tx: dict) -> str:
    """Build a human-readable description from a Helius enhanced transaction."""
    parts = []
    tx_type = tx.get("type", "")

    if tx_type:
        parts.append(tx_type.replace("_", " ").title())

    # Check for native transfers
    native_transfers = tx.get("nativeTransfers", [])
    if native_transfers:
        total_sol = sum(t.get("amount", 0) for t in native_transfers) / 1e9
        if total_sol > 0:
            parts.append(f"{total_sol:.4f} SOL")

    # Check for token transfers
    token_transfers = tx.get("tokenTransfers", [])
    if token_transfers:
        parts.append(f"{len(token_transfers)} token transfer(s)")

    return " — ".join(parts) if parts else "Transaction"
