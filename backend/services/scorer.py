def compute_trust_score(wallet_data: dict) -> dict:
    """
    Compute a Trust Score (0–100) based on wallet activity.

    Breakdown:
    - Wallet age score (max 25): min(wallet_age_days / 365 * 25, 25)
    - Transaction volume score (max 25): min(total_transactions / 200 * 25, 25)
    - Diversity score (max 25): min(len(unique_programs) / 20 * 25, 25)
    - Asset score (max 25): min((token_count + nft_count) / 10 * 25, 25)
    """
    wallet_age_days = wallet_data.get("wallet_age_days", 0)
    total_transactions = wallet_data.get("total_transactions", 0)
    unique_programs = wallet_data.get("unique_programs", [])
    token_count = wallet_data.get("token_count", 0)
    nft_count = wallet_data.get("nft_count", 0)

    age_score = min(wallet_age_days / 365 * 25, 25)
    volume_score = min(total_transactions / 200 * 25, 25)
    diversity_score = min(len(unique_programs) / 20 * 25, 25)
    asset_score = min((token_count + nft_count) / 10 * 25, 25)

    total = int(round(age_score + volume_score + diversity_score + asset_score))
    total = max(0, min(100, total))

    return {
        "score": total,
        "breakdown": {
            "age": round(age_score, 1),
            "volume": round(volume_score, 1),
            "diversity": round(diversity_score, 1),
            "assets": round(asset_score, 1),
        },
    }
