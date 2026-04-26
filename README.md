# ⛓️ ChainCV — Your On-Chain Identity

**ChainCV** transforms any Solana wallet address into a beautiful AI-generated professional identity card. No wallet connection required — just paste an address and discover its on-chain personality.

![ChainCV](https://img.shields.io/badge/Solana-Powered-blueviolet?style=for-the-badge) ![AI](https://img.shields.io/badge/Gemini_AI-Integrated-blue?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-Production_Ready-green?style=for-the-badge)

**[🔗 View Live Demo](https://your-deployment-link-here.com)**

---

## ✨ Features

- **🧬 AI Archetype Generation** — Gemini AI analyzes wallet patterns and assigns one of 8 unique trader archetypes
- **🎯 Trust Score** — On-chain reputation score (0–100) based on wallet age, transaction volume, protocol diversity, and asset holdings
- **🪪 Holographic Identity Card** — Stunning glassmorphism card with animated holographic border, downloadable as PNG
- **📜 Activity Timeline** — Visual timeline of recent on-chain transactions
- **⚔️ Wallet Comparison** — Side-by-side wallet showdown with head-to-head stats
- **📥 Export & Share** — Download card as PNG or copy shareable link

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI (Python) |
| **Frontend** | React + Tailwind CSS (Vite) |
| **AI** | Google Gemini 1.5 Pro |
| **Blockchain** | Helius API + Solana RPC |
| **Card Export** | html2canvas |

---

## 📦 Project Structure

```
chaincv/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example          # Environment variables template
│   ├── routers/
│   │   └── wallet.py        # API endpoints
│   └── services/
│       ├── helius.py         # Helius API integration
│       ├── gemini.py         # Gemini AI integration
│       └── scorer.py         # Trust Score computation
├── frontend/
│   ├── index.html            # HTML entry point
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind configuration
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Main app component
│       ├── components/
│       │   ├── SearchBar.jsx     # Wallet address input
│       │   ├── IdentityCard.jsx  # Hero holographic card
│       │   ├── TrustScore.jsx    # Animated trust ring
│       │   ├── Timeline.jsx      # Transaction timeline
│       │   ├── ArchetypeTag.jsx  # Archetype badge
│       │   └── CompareMode.jsx   # Wallet comparison
│       └── styles/
│           └── index.css     # Global styles + Tailwind
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Helius API key (free)
- Gemini API key

### 1. Get Your API Keys

#### Helius API Key (Free)
1. Go to [https://helius.xyz](https://helius.xyz)
2. Sign up for a free account
3. Create a new project
4. Copy your API key from the dashboard
5. Free tier includes 100,000 credits/month — plenty for development

#### Gemini API Key
1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys:
#   HELIUS_API_KEY=your_helius_key
#   GEMINI_API_KEY=your_gemini_key

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for interactive API docs.

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — proxy is configured in vite.config.js)
cp .env.example .env

# Start dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/api/wallet/{address}` | Get full wallet profile |
| `GET` | `/api/compare?wallet1={addr}&wallet2={addr}` | Compare two wallets |

### Example Response — `/api/wallet/{address}`

```json
{
  "address": "DYw8...",
  "archetype": "The DeFi Explorer",
  "archetype_emoji": "🧪",
  "bio": "A seasoned on-chain operator who thrives in the world of decentralized finance. Their transaction history reads like a masterclass in yield farming and protocol navigation.",
  "archetype_description": "Heavy DeFi protocol usage across multiple platforms.",
  "trust_score": 72,
  "trust_breakdown": {
    "age": 25.0,
    "volume": 18.5,
    "diversity": 15.0,
    "assets": 13.5
  },
  "stats": {
    "total_transactions": 148,
    "wallet_age_days": 412,
    "unique_programs": 12,
    "sol_balance": 3.2541,
    "token_count": 8,
    "nft_count": 3,
    "last_active": "2024-01-15T08:30:00+00:00"
  },
  "timeline": [...]
}
```

---

## 🎯 Trust Score Formula

The Trust Score (0–100) is computed from four equally-weighted categories:

| Category | Max Score | Formula |
|----------|-----------|---------|
| **Wallet Age** | 25 | `min(age_days / 365 × 25, 25)` |
| **Transaction Volume** | 25 | `min(total_tx / 200 × 25, 25)` |
| **Protocol Diversity** | 25 | `min(unique_programs / 20 × 25, 25)` |
| **Asset Holdings** | 25 | `min((tokens + nfts) / 10 × 25, 25)` |

---

## 🧬 Archetypes

| Archetype | Description |
|-----------|-------------|
| 💎 The Diamond Hand Hodler | Long-term holder who rarely sells |
| 🧪 The DeFi Explorer | Active across DeFi protocols |
| 🎨 The NFT Connoisseur | Collector of digital art and NFTs |
| 🪂 The Airdrop Hunter | Strategically farms airdrops |
| 🐋 The Whale | Massive holdings and high-value transactions |
| 👻 The Ghost Wallet | Minimal or no activity |
| 🦘 The Protocol Hopper | Constantly trying new protocols |
| 🌱 The Early Adopter | Among the first users of new platforms |

---

## 🚢 Deployment

### Backend (Render)

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your repo, set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables: `HELIUS_API_KEY`, `GEMINI_API_KEY`

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your repo, set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

---

## 📄 License

MIT License — build, fork, and share freely.

---

<p align="center">
  Built with ⛓️ by ChainCV
</p>
