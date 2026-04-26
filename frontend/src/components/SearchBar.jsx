import { useState } from 'react'

export default function SearchBar({ onSearch, error }) {
  const [address, setAddress] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = address.trim()
    if (!trimmed) { setValidationError('Please enter a wallet address'); return }
    if (trimmed.length < 32 || trimmed.length > 44) { setValidationError('Solana addresses are 32–44 characters long'); return }
    setValidationError('')
    onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto" id="search-form">
      <div className="search-bar rounded-2xl p-2">
        <div className="flex items-center gap-3">
          <div className="pl-5 text-sol-green text-2xl font-bold">◎</div>
          <input
            id="wallet-search-input"
            type="text"
            value={address}
            onChange={(e) => { setAddress(e.target.value); setValidationError('') }}
            placeholder="Paste any Solana wallet address"
            className="flex-1 bg-transparent text-white font-mono text-base md:text-lg py-5 px-2 outline-none placeholder:text-gray-600"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            id="search-submit-btn"
            type="submit"
            className="bg-sol-green hover:bg-sol-green/90 text-black font-orbitron font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-sol-green/20 active:scale-95 whitespace-nowrap text-sm tracking-wide"
          >
            Reveal Identity
          </button>
        </div>
      </div>

      {(validationError || error) && (
        <div className="mt-3 text-center">
          <p className="text-sol-red text-sm font-mono animate-fade-up">
            ⚠️ {validationError || error}
          </p>
        </div>
      )}
    </form>
  )
}
