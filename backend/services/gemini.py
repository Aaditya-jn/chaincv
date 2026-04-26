import os
import json
import httpx

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def _get_api_key() -> str:
    key = os.getenv("GEMINI_API_KEY", "")
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not set in environment variables.")
    return key


async def generate_identity(wallet_data: dict, trust_score: int) -> dict:
    """Send wallet stats to Gemini 1.5 Pro and get an AI-generated identity."""
    api_key = _get_api_key()

    total_transactions = wallet_data.get("total_transactions", 0)
    wallet_age_days = wallet_data.get("wallet_age_days", 0)
    unique_programs = wallet_data.get("unique_programs", [])
    sol_balance = wallet_data.get("sol_balance", 0)
    token_count = wallet_data.get("token_count", 0)
    nft_count = wallet_data.get("nft_count", 0)

    prompt = f"""You are ChainCV, an AI that reads Solana wallet data and generates a professional Web3 identity.

Given this wallet data:
- Total transactions: {total_transactions}
- Wallet age: {wallet_age_days} days
- Unique protocols used: {len(unique_programs)}
- SOL balance: {sol_balance}
- Tokens held: {token_count}
- NFTs held: {nft_count}
- Trust Score: {trust_score}

Generate a JSON response with exactly these fields:
{{
  "archetype": "one of: The Diamond Hand Hodler, The DeFi Explorer, The NFT Connoisseur, The Airdrop Hunter, The Whale, The Ghost Wallet, The Protocol Hopper, The Early Adopter",
  "archetype_emoji": "one relevant emoji",
  "bio": "exactly 2 sentences. First sentence describes their on-chain personality. Second sentence is a punchy insight about what their wallet reveals about them as a person.",
  "archetype_description": "one sentence explaining why they got this archetype"
}}

Return ONLY valid JSON. No markdown, no explanation."""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 300,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                GEMINI_URL,
                params={"key": api_key},
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()

        # Extract text from Gemini response
        text = ""
        candidates = data.get("candidates", [])
        if candidates:
            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            if parts:
                text = parts[0].get("text", "")

        # Clean up any markdown code fences
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        result = json.loads(text)
        return result

    except json.JSONDecodeError:
        return _fallback_identity(wallet_data, trust_score)
    except Exception:
        return _fallback_identity(wallet_data, trust_score)


def _fallback_identity(wallet_data: dict, trust_score: int) -> dict:
    """Generate a basic identity when Gemini is unavailable."""
    total_tx = wallet_data.get("total_transactions", 0)
    nft_count = wallet_data.get("nft_count", 0)
    sol_balance = wallet_data.get("sol_balance", 0)
    token_count = wallet_data.get("token_count", 0)
    programs = len(wallet_data.get("unique_programs", []))

    # Simple heuristic archetype selection
    if total_tx == 0:
        archetype = "The Ghost Wallet"
        emoji = "👻"
        bio = "This wallet exists in silence, a phantom on the blockchain. Sometimes the most interesting wallets are the ones that say nothing at all."
        desc = "Zero transaction history — a true ghost on Solana."
    elif sol_balance >= 100:
        archetype = "The Whale"
        emoji = "🐋"
        bio = f"A heavyweight on the Solana blockchain with {sol_balance:.1f} SOL in holdings. This wallet commands respect through sheer capital presence."
        desc = f"Holding {sol_balance:.1f} SOL puts this wallet in whale territory."
    elif nft_count >= 5:
        archetype = "The NFT Connoisseur"
        emoji = "🎨"
        bio = f"A collector of {nft_count} digital artifacts across the Solana ecosystem. Their wallet is a curated gallery of on-chain art and utility."
        desc = f"Holding {nft_count} NFTs shows a clear passion for digital collectibles."
    elif programs >= 10:
        archetype = "The Protocol Hopper"
        emoji = "🦘"
        bio = f"An explorer who has touched {programs} different protocols on Solana. Curiosity drives this wallet — always chasing the next innovation."
        desc = f"Interaction with {programs} unique programs shows restless exploration."
    elif total_tx >= 100:
        archetype = "The DeFi Explorer"
        emoji = "🧪"
        bio = f"A seasoned on-chain operator with {total_tx} transactions under their belt. This wallet tells the story of someone who lives and breathes DeFi."
        desc = f"{total_tx} transactions demonstrate deep DeFi engagement."
    else:
        archetype = "The Early Adopter"
        emoji = "🌱"
        bio = f"A budding presence on Solana with {total_tx} transactions and growing. Every whale started somewhere — this wallet is just getting started."
        desc = "Early stage activity with room to grow."

    return {
        "archetype": archetype,
        "archetype_emoji": emoji,
        "bio": bio,
        "archetype_description": desc,
    }
