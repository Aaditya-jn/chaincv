import os
import asyncio
import httpx
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.wallet import router as wallet_router

# Load .env from the same directory as this file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Debug: confirm keys are loaded
helius_key = os.getenv("HELIUS_API_KEY", "")
gemini_key = os.getenv("GEMINI_API_KEY", "")
print(f"HELIUS KEY LOADED: {bool(helius_key and helius_key != 'your_helius_api_key_here')}")
print(f"GEMINI KEY LOADED: {bool(gemini_key and gemini_key != 'your_gemini_api_key_here')}")
if helius_key:
    print(f"HELIUS KEY PREVIEW: {helius_key[:4]}****{helius_key[-4:]}")
if gemini_key:
    print(f"GEMINI KEY PREVIEW: {gemini_key[:4]}****{gemini_key[-4:]}")

app = FastAPI(
    title="ChainCV API",
    description="Transform any Solana wallet into a professional Web3 identity card",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wallet_router)


@app.get("/")
async def health_check():
    return {"status": "ChainCV is live"}

async def self_ping():
    while True:
        await asyncio.sleep(600)
        try:
            url = os.getenv("RENDER_EXTERNAL_URL", "https://chaincv.onrender.com")
            async with httpx.AsyncClient() as client:
                await client.get(f"{url}/")
        except:
            pass

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(self_ping())
