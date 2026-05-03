import { useState } from 'react'

export default function CompareMode({ currentAddress, onCompare, error }) {
  const [isOpen, setIsOpen] = useState(false)
  const [secondAddress, setSecondAddress] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleCompare = (e) => {
    e.preventDefault()
    const trimmed = secondAddress.trim()
    if (!trimmed) { setValidationError('Enter a second wallet address'); return }
    if (trimmed.length < 32 || trimmed.length > 44) { setValidationError('Address must be 32–44 characters'); return }
    if (trimmed === currentAddress) { setValidationError("Can't compare a wallet with itself!"); return }
    setValidationError('')
    onCompare(currentAddress, trimmed)
  }

  if (!isOpen) {
    return (
      <button id="compare-mode-btn" onClick={() => setIsOpen(true)}
        className="w-full glass rounded-2xl p-5 text-center transition-all duration-300 group hover:scale-[1.02] active:scale-95 hover:border-sol-gold/30">
        <span className="text-4xl group-hover:scale-125 inline-block transition-transform duration-300">⚔️</span>
        <p className="font-orbitron font-bold text-white text-base mt-2 tracking-wide">COMPARE WALLETS</p>
        <p className="text-sol-muted text-xs font-mono mt-1">See how this wallet stacks up</p>
      </button>
    )
  }

  return (
    <div className="glass rounded-2xl p-5" id="compare-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-orbitron font-bold text-sol-gold text-xs tracking-wider">⚔️ COMPARE</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-sm transition-colors">✕</button>
      </div>

      <div className="glass rounded-xl px-3 py-2 mb-3">
        <span className="text-xs text-sol-muted font-mono">Wallet 1</span>
        <p className="font-mono text-xs text-gray-300 truncate">{currentAddress}</p>
      </div>

      <form onSubmit={handleCompare}>
        <div className="mb-3">
          <label className="text-xs text-sol-muted font-mono mb-1 block">Wallet 2</label>
          <input id="compare-wallet-input" type="text" value={secondAddress}
            onChange={(e) => { setSecondAddress(e.target.value); setValidationError('') }}
            placeholder="Paste second address"
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-sol-green"
            spellCheck={false} />
        </div>

        {(validationError || error) && (
          <p className="text-sol-red text-xs font-mono mb-3">⚠️ {validationError || error}</p>
        )}

        <button id="compare-submit-btn" type="submit"
          className="w-full bg-sol-gold hover:bg-sol-gold/90 text-black font-orbitron font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 text-sm tracking-wide">
          ⚔️ BATTLE
        </button>
      </form>
    </div>
  )
}
