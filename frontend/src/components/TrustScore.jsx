import { useEffect, useState } from 'react'

export default function TrustScore({ score, breakdown }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  const getColor = (s) => {
    if (s >= 70) return { main: '#00FF94', glow: 'rgba(0,255,148,0.3)', label: 'Trusted' }
    if (s >= 40) return { main: '#FFD700', glow: 'rgba(255,215,0,0.3)', label: 'Moderate' }
    return { main: '#FF4444', glow: 'rgba(255,68,68,0.3)', label: 'Risky' }
  }

  const color = getColor(score)

  const breakdownItems = [
    { label: 'Wallet Age', value: breakdown?.age || 0, max: 25, icon: '📅' },
    { label: 'Volume', value: breakdown?.volume || 0, max: 25, icon: '📈' },
    { label: 'Diversity', value: breakdown?.diversity || 0, max: 25, icon: '🌐' },
    { label: 'Assets', value: breakdown?.assets || 0, max: 25, icon: '💎' },
  ]

  return (
    <div className="glass rounded-2xl p-6" id="trust-score-section">
      <h3 className="font-orbitron text-xs font-bold text-sol-muted tracking-wider uppercase mb-4 text-center">
        ON-CHAIN TRUST SCORE
      </h3>

      <div className="flex justify-center mb-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90 trust-ring-glow animate-glow-pulse" style={{ '--ring-color': color.glow }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
            <circle cx="50" cy="50" r={radius} stroke={color.main} strokeWidth="6" fill="none" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-orbitron text-4xl font-bold" style={{ color: color.main }}>{animatedScore}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-5">
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-mono font-bold border tracking-wider uppercase"
          style={{ color: color.main, borderColor: color.main + '40', backgroundColor: color.main + '10' }}>
          {color.label}
        </span>
      </div>

      <div className="space-y-3">
        {breakdownItems.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-sol-muted">{item.icon} {item.label}</span>
              <span className="text-gray-300">{item.value}/{item.max}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(item.value / item.max) * 100}%`, background: color.main, transitionDelay: `${i * 200}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
