import { useState, useEffect, useMemo, useRef, lazy, Suspense, Component } from 'react'
import SearchBar from './components/SearchBar'
import IdentityCard from './components/IdentityCard'
import TrustScore from './components/TrustScore'
import Timeline from './components/Timeline'
import CompareMode from './components/CompareMode'

const Globe3D = lazy(() => import('./components/Globe3D'))

class GlobeBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() { return this.state.hasError ? null : this.props.children }
}

const API_URL = import.meta.env.VITE_API_URL || ''

const LOADING_MESSAGES = [
  'Reading the blockchain...',
  'Consulting the AI oracle...',
  'Analyzing your on-chain DNA...',
  'Minting your identity...',
]

/* ===== Floating Green Particles ===== */
function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 2,
      duration: 14 + Math.random() * 20,
      delay: Math.random() * 15,
      opacity: 0.1 + Math.random() * 0.3,
    })),
  [])

  return (
    <div className="particle-field">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}

/* ===== Typewriter Loading ===== */
function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const msg = LOADING_MESSAGES[msgIndex]
    if (charIndex < msg.length) {
      const t = setTimeout(() => {
        setDisplayed(msg.slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      }, 40)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
        setCharIndex(0)
        setDisplayed('')
      }, 1800)
      return () => clearTimeout(t)
    }
  }, [charIndex, msgIndex])

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8">
      <div className="relative w-28 h-28">
        <div className="absolute inset-0 rounded-full bg-sol-green/15 animate-ping" />
        <div className="absolute inset-3 rounded-full bg-sol-green/20 animate-pulse" />
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-sol-green to-sol-gold animate-float" />
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-3/4 mx-auto rounded-lg shimmer-loader" />
        <div className="h-4 w-1/2 mx-auto rounded shimmer-loader" />
        <div className="h-52 w-full rounded-2xl shimmer-loader" />
      </div>

      <p className="text-sol-green font-mono text-sm tracking-wider h-6">
        <span>{displayed}</span>
        <span className="typewriter-cursor" />
      </p>
    </div>
  )
}

/* ===== Main App ===== */
export default function App() {
  const [state, setState] = useState('idle')
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [compareData, setCompareData] = useState(null)
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const handleSearch = async (address) => {
    setError('')
    setState('loading')
    setProfile(null)
    setCompareData(null)
    try {
      const resp = await fetch(`${API_URL}/api/wallet/${address}`)
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.detail || `Request failed with status ${resp.status}`)
      }
      const data = await resp.json()
      setProfile(data)
      setState('result')
    } catch (err) {
      setError(err.message || 'Failed to fetch wallet data.')
      setState('idle')
    }
  }

  const handleCompare = async (address1, address2) => {
    setError('')
    setState('loading')
    try {
      const resp = await fetch(`${API_URL}/api/compare?wallet1=${address1}&wallet2=${address2}`)
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.detail || `Compare failed with status ${resp.status}`)
      }
      const data = await resp.json()
      setCompareData(data)
      setState('compare')
    } catch (err) {
      setError(err.message || 'Failed to compare wallets.')
      setState('result')
    }
  }

  const handleBack = () => {
    setState('idle')
    setProfile(null)
    setCompareData(null)
    setError('')
  }

  return (
    <div className="relative min-h-screen bg-black">
      <ParticleField />

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-4 text-center">
          <button onClick={handleBack} className="inline-block group">
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold tracking-widest">
              <span className="text-sol-green">CHAIN</span>
              <span className="text-white">CV</span>
            </h1>
            <div className="h-px w-0 group-hover:w-full bg-sol-green transition-all duration-500 mx-auto mt-1" />
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-4 pb-20">
          {/* ===== IDLE / HERO ===== */}
          {state === 'idle' && (
            <div className="relative flex flex-col items-center justify-center pt-8 md:pt-16 animate-fade-up">
              {/* 3D Globe behind hero */}
              <div className="absolute inset-0 -top-20 overflow-hidden" style={{ height: '600px' }}>
                <GlobeBoundary>
                  <Suspense fallback={null}>
                    <Globe3D mousePos={mousePos} />
                  </Suspense>
                </GlobeBoundary>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                {/* 3D Chain Icon */}
                <div className="text-6xl md:text-7xl mb-8 animate-float" style={{ perspective: '200px' }}>
                  <span style={{ display: 'inline-block', transform: 'rotateY(15deg) rotateX(5deg)', textShadow: '0 0 30px rgba(0,255,148,0.3)' }}>⛓️</span>
                </div>

                <h2 className="font-orbitron text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-3 leading-tight text-white">
                  Your wallet has a story.
                </h2>
                <h2 className="font-orbitron text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-6 leading-tight text-sol-green">
                  We tell it.
                </h2>

                <p className="text-sol-muted text-base md:text-lg font-body mb-12 text-center max-w-lg">
                  Paste any Solana wallet address and discover your on-chain identity
                </p>

                <SearchBar onSearch={handleSearch} error={error} />

                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {['🎯 Trust Score', '🧬 AI Archetype', '📊 On-Chain Stats', '⚔️ Compare'].map(
                    (item, i) => (
                      <div key={i} className="feature-pill rounded-xl px-4 py-3 text-sm font-mono">
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== LOADING ===== */}
          {state === 'loading' && <LoadingState />}

          {/* ===== RESULT ===== */}
          {state === 'result' && profile && (
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handleBack}
                  className="text-sol-muted hover:text-sol-green font-mono text-sm flex items-center gap-2 transition-colors"
                >
                  <span>←</span> New Search
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <IdentityCard profile={profile} />
                </div>
                <div className="space-y-6">
                  <TrustScore score={profile.trust_score} breakdown={profile.trust_breakdown} />
                  <CompareMode currentAddress={profile.address} onCompare={handleCompare} error={error} />
                </div>
              </div>

              {profile.timeline && profile.timeline.length > 0 && (
                <div className="mt-10">
                  <Timeline events={profile.timeline} />
                </div>
              )}
            </div>
          )}

          {/* ===== COMPARE ===== */}
          {state === 'compare' && compareData && (
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handleBack}
                  className="text-sol-muted hover:text-sol-green font-mono text-sm flex items-center gap-2 transition-colors"
                >
                  <span>←</span> New Search
                </button>
                <h2 className="font-orbitron text-lg font-bold text-sol-gold">
                  ⚔️ WALLET SHOWDOWN
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-2 items-start">
                <div>
                  <IdentityCard profile={compareData.wallet1} />
                  <div className="mt-4">
                    <TrustScore score={compareData.wallet1.trust_score} breakdown={compareData.wallet1.trust_breakdown} />
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center justify-center pt-32">
                  <div className="w-px h-20 bg-gradient-to-b from-transparent to-sol-gold/40" />
                  <div className="vs-badge my-3">VS</div>
                  <div className="w-px h-20 bg-gradient-to-b from-sol-gold/40 to-transparent" />
                </div>
                <div className="md:hidden flex justify-center py-4">
                  <div className="vs-badge">VS</div>
                </div>

                <div>
                  <IdentityCard profile={compareData.wallet2} />
                  <div className="mt-4">
                    <TrustScore score={compareData.wallet2.trust_score} breakdown={compareData.wallet2.trust_breakdown} />
                  </div>
                </div>
              </div>

              <div className="mt-8 glass rounded-2xl p-6">
                <h3 className="font-orbitron text-sm font-bold mb-4 text-center text-sol-gold tracking-wider">
                  📊 HEAD-TO-HEAD
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Trust Score', v1: compareData.wallet1.trust_score, v2: compareData.wallet2.trust_score },
                    { label: 'Transactions', v1: compareData.wallet1.stats.total_transactions, v2: compareData.wallet2.stats.total_transactions },
                    { label: 'Wallet Age', v1: compareData.wallet1.stats.wallet_age_days, v2: compareData.wallet2.stats.wallet_age_days, suffix: 'd' },
                    { label: 'Protocols', v1: compareData.wallet1.stats.unique_programs, v2: compareData.wallet2.stats.unique_programs },
                  ].map((cat, i) => {
                    const winner = cat.v1 > cat.v2 ? 1 : cat.v2 > cat.v1 ? 2 : 0
                    return (
                      <div key={i} className="text-center">
                        <p className="text-sol-muted text-xs font-mono mb-2">{cat.label}</p>
                        <div className="flex items-center justify-center gap-3">
                          <span className={`text-lg font-bold font-mono ${winner === 1 ? 'text-sol-gold' : 'text-gray-300'}`}>
                            {cat.v1}{cat.suffix || ''}{winner === 1 && ' 👑'}
                          </span>
                          <span className="text-gray-600">vs</span>
                          <span className={`text-lg font-bold font-mono ${winner === 2 ? 'text-sol-gold' : 'text-gray-300'}`}>
                            {cat.v2}{cat.suffix || ''}{winner === 2 && ' 👑'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/5">
          <p className="text-sol-muted text-sm font-mono">
            Built at <span className="text-sol-gold font-bold">Colosseum Hackathon</span> · ChainCV 2026
          </p>
          <p className="text-gray-600 text-xs font-mono mt-1">
            Powered by Solana · Helius · Gemini AI
          </p>
        </footer>
      </div>
    </div>
  )
}
