const ARCHETYPE_STYLES = {
  'The Diamond Hand Hodler': { bg: 'bg-sol-gold/10', border: 'border-sol-gold/30', text: 'text-sol-gold' },
  'The DeFi Explorer': { bg: 'bg-sol-green/10', border: 'border-sol-green/30', text: 'text-sol-green' },
  'The NFT Connoisseur': { bg: 'bg-sol-gold/10', border: 'border-sol-gold/30', text: 'text-sol-gold' },
  'The Airdrop Hunter': { bg: 'bg-sol-green/10', border: 'border-sol-green/30', text: 'text-sol-green' },
  'The Whale': { bg: 'bg-white/5', border: 'border-white/20', text: 'text-white' },
  'The Ghost Wallet': { bg: 'bg-white/5', border: 'border-white/10', text: 'text-sol-muted' },
  'The Protocol Hopper': { bg: 'bg-sol-green/10', border: 'border-sol-green/30', text: 'text-sol-green' },
  'The Early Adopter': { bg: 'bg-sol-green/10', border: 'border-sol-green/30', text: 'text-sol-green' },
}

const DEFAULT_STYLE = { bg: 'bg-sol-green/10', border: 'border-sol-green/30', text: 'text-sol-green' }

export default function ArchetypeTag({ archetype }) {
  const style = ARCHETYPE_STYLES[archetype] || DEFAULT_STYLE

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold border ${style.bg} ${style.border} ${style.text} tracking-wider uppercase`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.text === 'text-sol-green' ? 'bg-sol-green' : style.text === 'text-sol-gold' ? 'bg-sol-gold' : 'bg-white/50'} mr-2`} />
      {archetype}
    </span>
  )
}
