const TYPE_STYLES = {
  TRANSFER: { emoji: '💸', color: 'text-sol-green' },
  SWAP: { emoji: '🔄', color: 'text-sol-green' },
  NFT_SALE: { emoji: '🖼️', color: 'text-sol-gold' },
  NFT_MINT: { emoji: '🎨', color: 'text-sol-gold' },
  NFT_LISTING: { emoji: '🏷️', color: 'text-sol-gold' },
  UNKNOWN: { emoji: '📝', color: 'text-sol-muted' },
  TOKEN_MINT: { emoji: '🪙', color: 'text-sol-gold' },
  BURN: { emoji: '🔥', color: 'text-sol-red' },
  STAKE: { emoji: '🥩', color: 'text-sol-green' },
  COMPRESSED_NFT_MINT: { emoji: '🗜️', color: 'text-sol-green' },
  DECREASE_LIQUIDITY: { emoji: '📉', color: 'text-sol-gold' },
  INITIALIZE_ACCOUNT: { emoji: '📂', color: 'text-sol-muted' },
  CLOSE_ACCOUNT: { emoji: '❌', color: 'text-sol-red' },
}

function getTypeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.UNKNOWN
}

export default function Timeline({ events }) {
  if (!events || events.length === 0) return null

  return (
    <div className="glass rounded-2xl p-6" id="timeline-section">
      <h3 className="font-orbitron text-sm font-bold text-sol-muted tracking-wider uppercase mb-6">
        📜 RECENT ACTIVITY
      </h3>

      <div className="space-y-3">
        {events.map((event, i) => {
          const style = getTypeStyle(event.type)
          return (
            <div
              key={i}
              className={`timeline-item rounded-xl p-4 opacity-0 animate-fade-up stagger-${i + 1}`}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{style.emoji}</span>
                  <span className={`font-mono text-sm font-bold ${style.color}`}>
                    {event.type?.replace(/_/g, ' ') || 'Transaction'}
                  </span>
                </div>
                <span className="text-gray-600 text-xs font-mono whitespace-nowrap">
                  {event.date}
                </span>
              </div>
              <p className="text-sol-muted text-sm font-mono leading-relaxed pl-8">
                {event.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
