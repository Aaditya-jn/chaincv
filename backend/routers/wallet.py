from fastapi import APIRouter, HTTPException, Query
from services.helius import fetch_wallet_data
from services.scorer import compute_trust_score
from services.gemini import generate_identity

router = APIRouter(prefix="/api", tags=["wallet"])


async def build_profile(address: str) -> dict:
    """Build a complete ChainCV profile for a given wallet address."""
    # Validate address length
    if not (32 <= len(address) <= 44):
        raise HTTPException(status_code=400, detail="Invalid Solana wallet address. Must be 32-44 characters.")

    # Fetch on-chain data
    wallet_data = await fetch_wallet_data(address)

    # Compute trust score
    trust_result = compute_trust_score(wallet_data)

    # Generate AI identity
    ai_identity = await generate_identity(wallet_data, trust_result["score"])

    return {
        "address": address,
        "archetype": ai_identity.get("archetype", "The Ghost Wallet"),
        "archetype_emoji": ai_identity.get("archetype_emoji", "👻"),
        "bio": ai_identity.get("bio", "This wallet prefers to remain mysterious."),
        "archetype_description": ai_identity.get("archetype_description", "Not enough data to determine archetype."),
        "trust_score": trust_result["score"],
        "trust_breakdown": trust_result["breakdown"],
        "stats": {
            "total_transactions": wallet_data["total_transactions"],
            "wallet_age_days": wallet_data["wallet_age_days"],
            "unique_programs": len(wallet_data["unique_programs"]),
            "sol_balance": wallet_data["sol_balance"],
            "token_count": wallet_data["token_count"],
            "nft_count": wallet_data["nft_count"],
            "last_active": wallet_data["last_active"],
        },
        "timeline": wallet_data["timeline"],
    }


@router.get("/wallet/{address}")
async def get_wallet_profile(address: str):
    """Get the full ChainCV profile for a single wallet."""
    try:
        profile = await build_profile(address)
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate profile: {str(e)}")


@router.get("/compare")
async def compare_wallets(
    wallet1: str = Query(..., description="First wallet address"),
    wallet2: str = Query(..., description="Second wallet address"),
):
    """Compare two wallet profiles side by side."""
    try:
        profile1 = await build_profile(wallet1)
        profile2 = await build_profile(wallet2)
        return {
            "wallet1": profile1,
            "wallet2": profile2,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare wallets: {str(e)}")
