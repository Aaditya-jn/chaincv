import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import ArchetypeTag from './ArchetypeTag'

export default function IdentityCard({ profile }) {
  const cardRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const {
    address, archetype, archetype_emoji, bio,
    archetype_description, trust_score, stats,
  } = profile

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateX = (y - 0.5) * -12
    const rotateY = (x - 0.5) * 12
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    // Update shimmer position
    const shimmer = cardRef.current.querySelector('.card-shimmer')
    if (shimmer) {
      shimmer.style.setProperty('--mouse-x', `${x * 100}%`)
      shimmer.style.setProperty('--mouse-y', `${y * 100}%`)
    }
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
  }

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      cardRef.current.style.transform = 'none'
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000', scale: 3, useCORS: true, logging: false,
      })
      const link = document.createElement('a')
      link.download = `chaincv-${address?.slice(0, 8) || 'card'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/${address}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const avatarHue = address ? (address.charCodeAt(0) * 37 + address.charCodeAt(1) * 73) % 360 : 150
  const avatarInitials = address ? address.slice(0, 2).toUpperCase() : '??'

  return (
    <div className="animate-card-reveal">
      <div
        ref={cardRef}
        id="identity-card"
        className="identity-card p-6 md:p-8 relative transition-transform duration-200 ease-out"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Shimmer overlay */}
        <div className="card-shimmer" />

        {/* Watermark */}
        <div className="absolute top-4 right-4 text-xs font-mono text-white/20 tracking-widest">
          CHAINCV
        </div>

        {/* Large Emoji */}
        <div className="text-center mb-5 relative z-10">
          <span className="text-6xl md:text-7xl inline-block animate-float">{archetype_emoji}</span>
        </div>

        {/* Archetype Name */}
        <div className="text-center mb-4 relative z-10">
          <h2 className="font-orbitron text-xl md:text-2xl font-bold text-white leading-tight mb-2 tracking-wide">
            {archetype}
          </h2>
          <div className="flex justify-center">
            <ArchetypeTag archetype={archetype} />
          </div>
        </div>

        {/* Avatar + Address */}
        <div className="flex items-center justify-center gap-3 mb-5 relative z-10">
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-mono font-bold text-sm text-black"
            style={{ background: `linear-gradient(135deg, hsl(${avatarHue}, 70%, 50%), hsl(${(avatarHue + 60) % 360}, 70%, 60%))` }}
          >
            {avatarInitials}
          </div>
          <div className="glass rounded-lg px-4 py-2 inline-flex items-center gap-2">
            <span className="text-sol-green text-sm">◎</span>
            <span className="font-mono text-sm text-gray-300 tracking-wider">{truncatedAddress}</span>
            <button onClick={() => navigator.clipboard.writeText(address)} className="text-gray-500 hover:text-sol-green transition-colors text-xs ml-1" title="Copy">📋</button>
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-200 text-base leading-relaxed mb-2 font-body text-center relative z-10">{bio}</p>
        <p className="text-sol-muted text-sm font-body italic mb-6 text-center relative z-10">{archetype_description}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
          {[
            { label: 'Trust Score', value: trust_score, icon: '🎯', color: trust_score >= 70 ? 'text-sol-green' : trust_score >= 40 ? 'text-sol-gold' : 'text-sol-red' },
            { label: 'Wallet Age', value: `${stats?.wallet_age_days || 0}d`, icon: '📅', color: 'text-white' },
            { label: 'Transactions', value: stats?.total_transactions || 0, icon: '💫', color: 'text-white' },
            { label: 'Tokens', value: (stats?.token_count || 0) + (stats?.nft_count || 0), icon: '🪙', color: 'text-sol-gold' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-3 text-center hover:border-sol-green/20 transition-colors">
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className={`font-mono font-bold text-lg ${stat.color}`}>{stat.value}</div>
              <div className="text-sol-muted text-xs font-mono mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* SOL Balance */}
        {stats?.sol_balance > 0 && (
          <div className="text-center mb-5 relative z-10">
            <span className="text-sol-muted text-xs font-mono">Balance: </span>
            <span className="font-mono text-sm text-sol-gold font-bold">{stats.sol_balance} SOL</span>
          </div>
        )}

        {/* Powered by Solana */}
        <div className="flex justify-center mb-5 relative z-10">
          <div className="powered-badge">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }} />
            Powered by Solana
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 relative z-10">
          <button id="download-card-btn" onClick={handleDownload} disabled={downloading}
            className="flex-1 bg-sol-green hover:bg-sol-green/90 text-black font-orbitron font-bold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm tracking-wide">
            {downloading ? '⏳ Capturing...' : '📥 Download Card'}
          </button>
          <button id="share-card-btn" onClick={handleShare}
            className="glass hover:border-sol-green/30 text-white font-orbitron font-bold px-5 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 text-sm">
            {copied ? '✅ Copied!' : '🔗 Share'}
          </button>
        </div>
      </div>
    </div>
  )
}
